import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/server/getSession";
import { PropertyChatConversation } from "@/lib/models/PropertyChat";
import {
  unauthorized,
  forbidden,
  badRequest,
  internalServerError,
} from "@/lib/error";
import { getDb } from "@/lib/server/db";
import { Role } from "@/lib/rbac";

/**
 * GET /api/property-chat/seller-inbox?propertyId=
 * Seller: all conversations for their property.
 * Admin: all conversations for the property (no sellerId constraint).
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

    if (!propertyId) return badRequest("propertyId is required");

    const userId = session.user.id;
    const filter: Record<string, string> = { propertyId };

    // Non-admins can only see conversations where they are the seller
    if (role !== Role.ADMIN) {
      filter.sellerId = userId;
    }

    const conversations = await PropertyChatConversation.find(filter)
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({ conversations });
  } catch (err) {
    console.error("[GET /api/property-chat/seller-inbox]", err);
    return internalServerError();
  }
}
