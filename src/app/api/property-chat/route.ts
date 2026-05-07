import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/features/auth/server/session";
import { connectToDatabase } from "@/shared/lib/db";
import { PropertyChatConversation, PropertyChatMessage } from "@/features/chat/models/property-chat.model";
import { Property } from "@/features/properties/models/property.model";
import { badRequest, forbidden, notFound, unauthorized } from "@/shared/lib/error";
import { broadcastDirectChatMessage, broadcastSellerInboxUpdate } from "@/shared/lib/supabase";
import { z } from "zod";
import { Types } from "mongoose";

const msgSchema = z.object({
  content:    z.string().min(1).max(2000),
  propertyId: z.string().min(1),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return unauthorized();

  const propertyId = req.nextUrl.searchParams.get("propertyId");
  if (!propertyId) return badRequest("propertyId required");

  await connectToDatabase();
  const property = await Property.findById(propertyId).lean();
  if (!property) return notFound("Property not found");

  const isOwner = property.sellerId.toString() === session.user.id;
  const buyerId = isOwner ? req.nextUrl.searchParams.get("buyerId") : session.user.id;
  if (isOwner && !buyerId) return badRequest("buyerId required for seller");

  const convo = await PropertyChatConversation.findOne({ buyerId, propertyId }).lean();
  if (!convo) return NextResponse.json({ conversation: null, messages: [] });

  const messages = await PropertyChatMessage.find({ conversationId: convo._id })
    .sort({ createdAt: 1 })
    .lean();

  if (isOwner) {
    await PropertyChatConversation.findByIdAndUpdate(convo._id, { unreadBySeller: 0 });
  } else {
    await PropertyChatConversation.findByIdAndUpdate(convo._id, { unreadByBuyer: 0 });
  }

  return NextResponse.json({
    conversation: { ...convo, _id: convo._id.toString() },
    messages: messages.map((m) => ({ ...m, _id: m._id.toString(), conversationId: m.conversationId.toString() })),
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return unauthorized();
  if (session.user.isAnonymous) return forbidden("Login required");

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON");

  const parsed = msgSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.errors[0]?.message ?? "Validation error");

  const { content, propertyId } = parsed.data;
  await connectToDatabase();

  const property = await Property.findById(propertyId).lean();
  if (!property) return notFound("Property not found");

  if (property.sellerId.toString() === session.user.id)
    return forbidden("Owners cannot message their own property");

  const convo = await PropertyChatConversation.findOneAndUpdate(
    { buyerId: session.user.id, propertyId },
    {
      $set: {
        sellerId: property.sellerId.toString(),
        propertyTitle: property.title,
        lastMessage: content,
        lastMessageAt: new Date(),
        buyerName: session.user.name,
      },
      $inc: { unreadBySeller: 1 },
    },
    { upsert: true, new: true },
  );

  await Property.findByIdAndUpdate(propertyId, { $inc: { messagesCount: 1 } });

  const msg = await PropertyChatMessage.create({
    conversationId: convo._id,
    senderId: session.user.id,
    senderName: session.user.name,
    senderRole: "inquirer",
    content,
  });

  const payload = { ...msg.toObject(), _id: msg._id.toString(), conversationId: convo._id.toString() };
  await broadcastDirectChatMessage(convo._id.toString(), payload);
  await broadcastSellerInboxUpdate(property.sellerId.toString(), {
    conversationId: convo._id.toString(),
    lastMessage: content,
    buyerName: session.user.name,
  });

  return NextResponse.json(payload, { status: 201 });
}
