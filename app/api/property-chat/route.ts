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
  internalServerError,
} from "@/lib/error";
import { getDb } from "@/lib/server/db";
import { Role } from "@/lib/rbac";
import {
  broadcastDirectChatMessage,
  broadcastSellerInboxUpdate,
  broadcastAdminInboxUpdate,
} from "@/lib/server/supabase";

/**
 * GET /api/property-chat?propertyId=&sellerId=
 * Buyer gets or creates their conversation thread with the property's seller.
 */
export async function GET(req: Request) {
  try {
    await getDb();
    const session = await getServerSession();
    if (!session) return unauthorized();

    const role = session.user.role as Role;
    if (role === Role.GUEST) return forbidden();

    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId") ?? "";
    const sellerId = searchParams.get("sellerId") ?? "";

    if (!propertyId || !sellerId)
      return badRequest("propertyId and sellerId are required");

    const userId = session.user.id;
    if (userId === sellerId) return forbidden("You cannot message yourself");

    const conversation = await PropertyChatConversation.findOne({
      buyerId: userId,
      propertyId,
    }).lean();

    if (conversation) {
      // Mark seller messages as read
      await PropertyChatMessage.updateMany(
        {
          conversationId: conversation._id,
          senderRole: "seller",
          readBy: { $ne: userId },
        },
        { $addToSet: { readBy: userId } },
      );
      await PropertyChatConversation.updateOne(
        { _id: conversation._id },
        { $set: { unreadByBuyer: 0 } },
      );
    }

    const messages = conversation
      ? await PropertyChatMessage.find({ conversationId: conversation._id })
          .sort({ createdAt: 1 })
          .lean()
      : [];

    return NextResponse.json({ conversation: conversation ?? null, messages });
  } catch (err) {
    console.error("[GET /api/property-chat]", err);
    return internalServerError();
  }
}

/**
 * POST /api/property-chat
 * Body: { content, propertyId, sellerId, propertyTitle }
 * Buyer sends a message to the property's seller.
 */
export async function POST(req: Request) {
  try {
    await getDb();
    const session = await getServerSession();
    if (!session) return unauthorized();

    const role = session.user.role as Role;
    if (role === Role.GUEST) return forbidden();

    const {
      content,
      propertyId,
      sellerId,
      propertyTitle = "",
    } = await req.json();

    if (!content?.trim()) return badRequest("content is required");
    if (content.trim().length > 2000)
      return badRequest("Message too long (max 2000 chars)");
    if (!propertyId) return badRequest("propertyId is required");
    if (!sellerId) return badRequest("sellerId is required");

    const userId = session.user.id;
    const userName = session.user.name ?? "User";

    if (userId === sellerId) return forbidden("You cannot message yourself");

    const isNew = !(await PropertyChatConversation.exists({
      buyerId: userId,
      propertyId,
    }));

    const conversation = await PropertyChatConversation.findOneAndUpdate(
      { buyerId: userId, propertyId },
      {
        $setOnInsert: {
          buyerId: userId,
          buyerName: userName,
          sellerId,
          propertyId,
          propertyTitle,
        },
        $set: {
          lastMessage: content.trim().slice(0, 80),
          lastMessageAt: new Date(),
        },
        $inc: { unreadBySeller: 1 },
      },
      { upsert: true, new: true },
    );

    const message = await PropertyChatMessage.create({
      conversationId: conversation._id,
      senderId: userId,
      senderName: userName,
      senderRole: "buyer",
      content: content.trim(),
      readBy: [userId],
    });

    const msgObj = message.toObject();
    const convObj = conversation.toObject();

    await broadcastDirectChatMessage(conversation._id.toString(), {
      message: msgObj,
    });

    const inboxPayload = {
      message: msgObj,
      conversation: {
        _id: convObj._id.toString(),
        buyerId: userId,
        buyerName: userName,
        sellerId,
        propertyId,
        propertyTitle,
        lastMessage: content.trim().slice(0, 80),
        lastMessageAt: new Date().toISOString(),
        unreadBySeller: convObj.unreadBySeller,
        unreadByBuyer: 0,
        createdAt: convObj.createdAt?.toISOString(),
        isNew,
      },
    };

    await broadcastSellerInboxUpdate(sellerId, inboxPayload);
    await broadcastAdminInboxUpdate(propertyId, inboxPayload);

    return NextResponse.json(
      { message: msgObj, conversationId: conversation._id.toString() },
      { status: 201 },
    );
  } catch (err) {
    console.error("[POST /api/property-chat]", err);
    return internalServerError();
  }
}
