import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/server/getSession";
import { SupportConversation } from "@/lib/models/SupportConversation";
import { unauthorized, forbidden, internalServerError } from "@/lib/error";
import { getDb } from "@/lib/server/db";
import { Role } from "@/lib/rbac";

export async function GET() {
  try {
    await getDb();
    const session = await getServerSession();
    if (!session) return unauthorized();

    const role = session.user.role as Role;
    if (role === Role.ADMIN || role === Role.GUEST) return forbidden();

    const conversations = await SupportConversation.find({
      userId: session.user.id,
      unreadByUser: { $gt: 0 },
    })
      .sort({ lastMessageAt: -1 })
      .lean();

    const totalUnread = conversations.reduce(
      (sum, c) => sum + (c.unreadByUser ?? 0),
      0,
    );

    return NextResponse.json({ conversations, totalUnread });
  } catch (err) {
    console.error("[GET /api/support/user-notifications]", err);
    return internalServerError();
  }
}
