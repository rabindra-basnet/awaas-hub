import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/features/auth/server/session";
import { connectToDatabase } from "@/shared/lib/db";
import { SupportConversation, SupportMessage } from "@/features/support/models/support-conversation.model";
import { badRequest, forbidden, notFound, unauthorized } from "@/shared/lib/error";
import { broadcastSupportMessage, broadcastUserNotification } from "@/shared/lib/supabase";
import { Role } from "@/features/auth/rbac/access";
import { z } from "zod";
import { Types } from "mongoose";

type Params = { params: Promise<{ id: string }> };

const schema = z.object({ content: z.string().min(1).max(2000) });

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session) return unauthorized();
  if (session.user.role !== Role.ADMIN) return forbidden("Admin only");

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON");

  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.errors[0]?.message ?? "Validation error");

  await connectToDatabase();
  const convo = await SupportConversation.findById(id);
  if (!convo) return notFound();

  convo.lastMessage = parsed.data.content;
  convo.lastMessageAt = new Date();
  convo.unreadByUser += 1;
  await convo.save();

  const msg = await SupportMessage.create({
    conversationId: new Types.ObjectId(id),
    senderId: session.user.id,
    senderName: session.user.name,
    senderRole: "admin",
    content: parsed.data.content,
  });

  const payload = { ...msg.toObject(), _id: msg._id.toString(), conversationId: id };
  await broadcastSupportMessage(id, payload);
  await broadcastUserNotification(convo.userId, { type: "support_reply", message: parsed.data.content });

  return NextResponse.json(payload, { status: 201 });
}
