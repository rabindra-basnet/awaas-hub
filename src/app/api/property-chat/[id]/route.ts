import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/features/auth/server/session";
import { connectToDatabase } from "@/shared/lib/db";
import { PropertyChatConversation, PropertyChatMessage } from "@/features/chat/models/property-chat.model";
import { badRequest, forbidden, notFound, unauthorized } from "@/shared/lib/error";
import { broadcastDirectChatMessage, broadcastSellerInboxUpdate } from "@/shared/lib/supabase";
import { z } from "zod";
import { Types } from "mongoose";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session) return unauthorized();

  await connectToDatabase();
  const convo = await PropertyChatConversation.findById(id).lean();
  if (!convo) return notFound();

  const isBuyer = convo.buyerId === session.user.id;
  const isSeller = convo.sellerId === session.user.id;
  if (!isBuyer && !isSeller) return forbidden();

  const messages = await PropertyChatMessage.find({ conversationId: new Types.ObjectId(id) })
    .sort({ createdAt: 1 })
    .lean();

  if (isSeller) await PropertyChatConversation.findByIdAndUpdate(id, { unreadBySeller: 0 });
  if (isBuyer) await PropertyChatConversation.findByIdAndUpdate(id, { unreadByBuyer: 0 });

  return NextResponse.json({
    conversation: { ...convo, _id: convo._id.toString() },
    messages: messages.map((m) => ({ ...m, _id: m._id.toString(), conversationId: m.conversationId.toString() })),
  });
}

const schema = z.object({ content: z.string().min(1).max(2000) });

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session) return unauthorized();

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON");

  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.errors[0]?.message ?? "Validation error");

  await connectToDatabase();
  const convo = await PropertyChatConversation.findById(id);
  if (!convo) return notFound();

  const isSeller = convo.sellerId === session.user.id;
  if (!isSeller) return forbidden("Only sellers can reply here");

  convo.lastMessage = parsed.data.content;
  convo.lastMessageAt = new Date();
  convo.unreadByBuyer += 1;
  await convo.save();

  const msg = await PropertyChatMessage.create({
    conversationId: new Types.ObjectId(id),
    senderId: session.user.id,
    senderName: session.user.name,
    senderRole: "owner",
    content: parsed.data.content,
  });

  const payload = { ...msg.toObject(), _id: msg._id.toString(), conversationId: id };
  await broadcastDirectChatMessage(id, payload);
  await broadcastSellerInboxUpdate(session.user.id, { conversationId: id, lastMessage: parsed.data.content });

  return NextResponse.json(payload, { status: 201 });
}
