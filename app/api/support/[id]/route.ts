import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/server/getSession";
import {
  SupportConversation,
  SupportMessage,
} from "@/lib/models/SupportConversation";
import {
  unauthorized,
  forbidden,
  badRequest,
  notFound,
  internalServerError,
} from "@/lib/error";
import { getDb } from "@/lib/server/db";
import { Role } from "@/lib/rbac";
import { broadcastSupportMessage } from "@/lib/server/supabase";

/**
 * GET /api/support/[id]
 * Admin only — fetch a specific conversation with all messages.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await getDb();
    const session = await getServerSession();
    if (!session) return unauthorized();
    if ((session.user.role as Role) !== Role.ADMIN) return forbidden();

    const { id } = await params;
    const conversation = await SupportConversation.findByIdAndUpdate(
      id,
      { $set: { unreadByAdmin: 0 } },
      { new: true },
    ).lean();

    if (!conversation) return notFound("Conversation not found");

    const adminId = session.user.id;
    await SupportMessage.updateMany(
      {
        conversationId: conversation._id,
        senderRole: { $ne: "admin" },
        readBy: { $ne: adminId },
      },
      { $addToSet: { readBy: adminId } },
    );

    const messages = await SupportMessage.find({
      conversationId: conversation._id,
    })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({ conversation, messages });
  } catch (err) {
    console.error("[GET /api/support/[id]]", err);
    return internalServerError();
  }
}

/**
 * POST /api/support/[id]
 * Admin only — reply to a conversation.
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
    if ((session.user.role as Role) !== Role.ADMIN) return forbidden();

    const { id } = await params;
    const { content } = await req.json();

    if (!content?.trim()) return badRequest("content is required");
    if (content.trim().length > 2000)
      return badRequest("Message too long (max 2000 chars)");

    const conversation = await SupportConversation.findByIdAndUpdate(
      id,
      {
        $set: {
          lastMessage: content.trim().slice(0, 80),
          lastMessageAt: new Date(),
          status: "open",
        },
        $inc: { unreadByUser: 1 },
      },
      { new: true },
    );

    if (!conversation) return notFound("Conversation not found");

    const adminId = session.user.id;
    const adminName = session.user.name ?? "Admin";

    const message = await SupportMessage.create({
      conversationId: conversation._id,
      senderId: adminId,
      senderName: adminName,
      senderRole: "admin",
      content: content.trim(),
      readBy: [adminId],
    });

    const msgObj = message.toObject();

    await broadcastSupportMessage(conversation._id.toString(), {
      message: msgObj,
    });

    return NextResponse.json({ message: msgObj }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/support/[id]]", err);
    return internalServerError();
  }
}
