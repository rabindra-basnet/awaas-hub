import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/server/getSession";
import {
  PropertyChatConversation,
  PropertyChatMessage,
} from "@/lib/models/PropertyChat";
import {
  unauthorized,
  forbidden,
  badRequest,
  notFound,
  internalServerError,
} from "@/lib/error";
import { getDb } from "@/lib/server/db";
import { Role } from "@/lib/rbac";
import {
  broadcastDirectChatMessage,
  broadcastBuyerChatNotification,
} from "@/lib/server/supabase";

/**
 * GET /api/property-chat/[id]
 * Seller or admin reads a conversation and marks buyer messages as read.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await getDb();
    const session = await getServerSession();
    if (!session) return unauthorized();

    const role = session.user.role as Role;
    if (role === Role.GUEST) return forbidden();

    const { id } = await params;
    const userId = session.user.id;
    const isAdmin = role === Role.ADMIN;

    const conversation = await PropertyChatConversation.findById(id).lean();
    if (!conversation) return notFound("Conversation not found");

    // Only the seller or admin may read
    if (!isAdmin && conversation.sellerId !== userId) return forbidden();

    // Mark buyer messages as read by this seller/admin
    await PropertyChatMessage.updateMany(
      {
        conversationId: conversation._id,
        senderRole: "buyer",
        readBy: { $ne: userId },
      },
      { $addToSet: { readBy: userId } },
    );

    // Reset unread count for seller
    if (!isAdmin) {
      await PropertyChatConversation.updateOne(
        { _id: conversation._id },
        { $set: { unreadBySeller: 0 } },
      );
    }

    const messages = await PropertyChatMessage.find({
      conversationId: conversation._id,
    })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({ conversation, messages });
  } catch (err) {
    console.error("[GET /api/property-chat/[id]]", err);
    return internalServerError();
  }
}

/**
 * POST /api/property-chat/[id]
 * Seller replies to a buyer conversation. Admin is read-only.
 * Body: { content: string }
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await getDb();
    const session = await getServerSession();
    if (!session) return unauthorized();

    const role = session.user.role as Role;
    if (role === Role.GUEST) return forbidden();

    const { id } = await params;
    const { content } = await req.json();

    if (!content?.trim()) return badRequest("content is required");
    if (content.trim().length > 2000)
      return badRequest("Message too long (max 2000 chars)");

    const userId = session.user.id;
    const userName = session.user.name ?? "Seller";

    // Auth check before any mutation — only the property's seller can reply
    const existing = await PropertyChatConversation.findById(id).lean();
    if (!existing) return notFound("Conversation not found");
    if (existing.sellerId !== userId) return forbidden();

    const conversation = await PropertyChatConversation.findByIdAndUpdate(
      id,
      {
        $set: {
          lastMessage: content.trim().slice(0, 80),
          lastMessageAt: new Date(),
        },
        $inc: { unreadByBuyer: 1 },
      },
      { new: true },
    );

    if (!conversation) return notFound("Conversation not found");

    const message = await PropertyChatMessage.create({
      conversationId: conversation._id,
      senderId: userId,
      senderName: userName,
      senderRole: "seller",
      content: content.trim(),
      readBy: [userId],
    });

    const msgObj = message.toObject();

    await broadcastDirectChatMessage(conversation._id.toString(), {
      message: msgObj,
    });

    await broadcastBuyerChatNotification(conversation.buyerId, {
      message: msgObj,
    });

    return NextResponse.json({ message: msgObj }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/property-chat/[id]]", err);
    return internalServerError();
  }
}
