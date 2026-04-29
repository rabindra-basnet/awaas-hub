import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/server/getSession";
import { Conversation, Message } from "@/lib/models/Conversation";
import { Property } from "@/lib/models/Property";
import { unauthorized, internalServerError } from "@/lib/error";
import { getDb } from "@/lib/server/db";
import { broadcastPropertyMessage } from "@/lib/server/supabase";

/**
 * GET /api/conversations?propertyId=xxx
 */
export async function GET(req: Request) {
  try {
    await getDb();
    const session = await getServerSession();
    if (!session) return unauthorized();

    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");
    if (!propertyId) {
      return NextResponse.json(
        { message: "propertyId is required" },
        { status: 400 },
      );
    }

    const userId = session.user.id;

    const property = await Property.findById(propertyId)
      .select("sellerId title")
      .lean();
    if (!property) {
      return NextResponse.json(
        { message: "Property not found" },
        { status: 404 },
      );
    }

    const sellerId = property.sellerId.toString();
    const userRole = (session.user as any).role ?? "buyer";

    // Find or create conversation
    let conversation = await Conversation.findOne({
      propertyId,
      $or: [{ buyerId: userId }, { sellerId: userId }],
    }).lean();

    if (!conversation) {
      const created = await Conversation.create({
        propertyId,
        propertyTitle: (property as any).title ?? "",
        buyerId: userRole === "seller" ? sellerId : userId,
        sellerId,
      });
      conversation = created.toObject();
    }

    // Mark messages as read
    await Message.updateMany(
      { conversationId: conversation._id, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } },
    );

    const messages = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({ conversation, messages });
  } catch (err) {
    console.error("[GET /api/conversations]", err);
    return internalServerError();
  }
}

/**
 * POST /api/conversations
 * Body: { propertyId, content }
 */
export async function POST(req: Request) {
  try {
    await getDb();
    const session = await getServerSession();
    if (!session) return unauthorized();

    const { propertyId, content } = await req.json();

    if (!propertyId || !content?.trim()) {
      return NextResponse.json(
        { message: "propertyId and content are required" },
        { status: 400 },
      );
    }

    if (content.trim().length > 2000) {
      return NextResponse.json(
        { message: "Message too long (max 2000 chars)" },
        { status: 400 },
      );
    }

    const userId = session.user.id;
    const userName = session.user.name ?? "User";
    const userRole = (session.user as any).role ?? "buyer";

    const property = await Property.findById(propertyId)
      .select("sellerId title")
      .lean();
    if (!property) {
      return NextResponse.json(
        { message: "Property not found" },
        { status: 404 },
      );
    }

    const sellerId = property.sellerId.toString();

    // Find or create conversation
    const conversation = await Conversation.findOneAndUpdate(
      {
        propertyId,
        $or: [{ buyerId: userId }, { sellerId: userId }],
      },
      {
        $setOnInsert: {
          propertyId,
          propertyTitle: (property as any).title ?? "",
          buyerId: userRole === "seller" ? sellerId : userId,
          sellerId,
        },
        $set: {
          lastMessage: content.trim().slice(0, 80),
          lastMessageAt: new Date(),
        },
      },
      { upsert: true, new: true },
    );

    // Save message
    const message = await Message.create({
      conversationId: conversation._id,
      senderId: userId,
      senderName: userName,
      senderRole: userRole,
      content: content.trim(),
      readBy: [userId],
    });

    const msgObj = message.toObject();

    await broadcastPropertyMessage(conversation._id.toString(), {
      message: msgObj,
    });

    return NextResponse.json({ message: msgObj }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/conversations]", err);
    return internalServerError();
  }
}
