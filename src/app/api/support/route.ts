import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/features/auth/server/session";
import { connectToDatabase } from "@/shared/lib/db";
import { SupportConversation, SupportMessage } from "@/features/support/models/support-conversation.model";
import { badRequest, forbidden, unauthorized } from "@/shared/lib/error";
import { broadcastSupportMessage, broadcastNewConversation, broadcastUserNotification } from "@/shared/lib/supabase";
import { z } from "zod";

const schema = z.object({
  content:    z.string().min(1).max(2000),
  propertyId: z.string().default(""),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return unauthorized();
  if (session.user.isAnonymous) return forbidden("Login required");

  const propertyId = req.nextUrl.searchParams.get("propertyId") || "";
  await connectToDatabase();

  let convo = await SupportConversation.findOne({ userId: session.user.id, propertyId }).lean();
  if (!convo) return NextResponse.json({ conversation: null, messages: [] });

  const messages = await SupportMessage.find({ conversationId: convo._id })
    .sort({ createdAt: 1 })
    .lean();

  await SupportConversation.findByIdAndUpdate(convo._id, { unreadByUser: 0 });

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

  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.errors[0]?.message ?? "Validation error");

  const { content, propertyId } = parsed.data;
  await connectToDatabase();

  const isNew = !(await SupportConversation.findOne({ userId: session.user.id, propertyId }).lean());

  const convo = await SupportConversation.findOneAndUpdate(
    { userId: session.user.id, propertyId },
    {
      $set: { lastMessage: content, lastMessageAt: new Date(), userName: session.user.name },
      $inc: { unreadByAdmin: 1 },
    },
    { upsert: true, new: true },
  );

  const msg = await SupportMessage.create({
    conversationId: convo._id,
    senderId: session.user.id,
    senderName: session.user.name,
    senderRole: "user",
    content,
  });

  const payload = { ...msg.toObject(), _id: msg._id.toString(), conversationId: convo._id.toString() };
  await broadcastSupportMessage(convo._id.toString(), payload);
  if (isNew) await broadcastNewConversation({ conversation: { ...convo.toObject(), _id: convo._id.toString() } });

  return NextResponse.json(payload, { status: 201 });
}
