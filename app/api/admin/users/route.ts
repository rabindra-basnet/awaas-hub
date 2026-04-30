import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/server/getSession";
import { Role } from "@/lib/rbac";
import { forbidden, unauthorized, internalServerError } from "@/lib/error";
import { getDb } from "@/lib/server/db";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) return unauthorized();
    if (session.user.role !== Role.ADMIN) return forbidden();

    const db = await getDb();
    const users = await db
      .collection("users")
      .find({
        role: { $nin: [Role.ADMIN, null] },
        isAnonymous: { $ne: true },
      })
      .project({ password: 0 })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ users });
  } catch (err) {
    console.error("[GET /api/admin/users]", err);
    return internalServerError();
  }
}
