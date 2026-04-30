import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/server/getSession";
import { SupportConversation } from "@/lib/models/SupportConversation";
import { unauthorized, forbidden, internalServerError } from "@/lib/error";
import { getDb } from "@/lib/server/db";
import { Role } from "@/lib/rbac";

/**
 * GET /api/support/inbox
 * Admin only — returns all support conversations sorted by latest activity.
 */
export async function GET() {
  try {
    await getDb();
    const session = await getServerSession();
    if (!session) return unauthorized();
    if ((session.user.role as Role) !== Role.ADMIN) return forbidden();

    const conversations = await SupportConversation.find()
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({ conversations });
  } catch (err) {
    console.error("[GET /api/support/inbox]", err);
    return internalServerError();
  }
}
