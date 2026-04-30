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
  internalServerError,
} from "@/lib/error";
import { getDb } from "@/lib/server/db";
import { Role } from "@/lib/rbac";
import {
  broadcastSupportMessage,
  broadcastNewConversation,
} from "@/lib/server/supabase";

/**
 * GET /api/support
 * Returns the current user's support conversation + messages (creates one if needed).
 * Query: ?propertyId= (empty = general support)
 */
export async function GET(req: Request) {
  try {
    await getDb();
    const session = await getServerSession();
    if (!session) return unauthorized();

    const role = session.user.role as Role;
    if (role === Role.ADMIN || role === Role.GUEST) return forbidden();

    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId") ?? "";
    const propertyTitle = searchParams.get("propertyTitle") ?? "";
    const userId = session.user.id;

    let conversation = await SupportConversation.findOne({ userId, propertyId }).lean();

    if (!conversation) {
      const created = await SupportConversation.create({
        userId,
        userName: session.user.name ?? "User",
        userRole: role,
        propertyId,
        propertyTitle: propertyTitle,
      });
      conversation = created.toObject();
    } else {
      // Mark admin messages as read for the user
      await SupportMessage.updateMany(
        {
          conversationId: conversation._id,
          senderRole: "admin",
          readBy: { $ne: userId },
        },
        { $addToSet: { readBy: userId } },
      );
      await SupportConversation.updateOne(
        { _id: conversation._id },
        { $set: { unreadByUser: 0 } },
      );
    }

    const messages = await SupportMessage.find({
      conversationId: conversation._id,
    })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({ conversation, messages });
  } catch (err) {
    console.error("[GET /api/support]", err);
    return internalServerError();
  }
}

/**
 * POST /api/support
 * Body: { content: string, propertyId?: string, propertyTitle?: string }
 * User (buyer/seller) sends a message in their support thread.
 */
export async function POST(req: Request) {
  try {
    await getDb();
    const session = await getServerSession();
    if (!session) return unauthorized();

    const role = session.user.role as Role;
    if (role === Role.ADMIN || role === Role.GUEST) return forbidden();

    const { content, propertyId = "", propertyTitle = "" } = await req.json();
    if (!content?.trim()) return badRequest("content is required");
    if (content.trim().length > 2000)
      return badRequest("Message too long (max 2000 chars)");

    const userId = session.user.id;
    const userName = session.user.name ?? "User";

    // Upsert conversation
    const isNew = !(await SupportConversation.exists({ userId, propertyId }));
    const conversation = await SupportConversation.findOneAndUpdate(
      { userId, propertyId },
      {
        $setOnInsert: { userId, userName, userRole: role, propertyId, propertyTitle },
        $set: {
          lastMessage: content.trim().slice(0, 80),
          lastMessageAt: new Date(),
          status: "open",
        },
        $inc: { unreadByAdmin: 1 },
      },
      { upsert: true, new: true },
    );

    const message = await SupportMessage.create({
      conversationId: conversation._id,
      senderId: userId,
      senderName: userName,
      senderRole: role,
      content: content.trim(),
      readBy: [userId],
    });

    const msgObj = message.toObject();

    await broadcastSupportMessage(conversation._id.toString(), {
      message: msgObj,
    });

    if (isNew) {
      await broadcastNewConversation({ conversation: conversation.toObject() });
    }

    return NextResponse.json({ message: msgObj }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/support]", err);
    return internalServerError();
  }
}
