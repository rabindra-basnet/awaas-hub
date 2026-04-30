import { NextResponse } from "next/server";
import { auth } from "@/lib/server/auth";
import { getServerSession } from "@/lib/server/getSession";
import { Role } from "@/lib/rbac";
import { forbidden, unauthorized, internalServerError } from "@/lib/error";
import { headers } from "next/headers";

type Params = { params: Promise<{ id: string }> };

/** POST /api/admin/users/[id]/ban */
export async function POST(req: Request, { params }: Params) {
  try {
    const session = await getServerSession();
    if (!session) return unauthorized();
    if (session.user.role !== Role.ADMIN) return forbidden();

    const { id } = await params;
    const { reason } = await req.json().catch(() => ({}));

    await auth.api.banUser({
      body: { userId: id, banReason: reason || "Violated platform policy" },
      headers: await headers(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/admin/users/[id]/ban]", err);
    return internalServerError();
  }
}
