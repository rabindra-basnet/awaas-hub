import { NextResponse } from "next/server";
import { auth } from "@/lib/server/auth";
import { getServerSession } from "@/lib/server/getSession";
import { Role } from "@/lib/rbac";
import { forbidden, unauthorized, internalServerError } from "@/lib/error";
import { headers } from "next/headers";

type Params = { params: Promise<{ id: string }> };

/** DELETE /api/admin/users/[id]/delete */
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const session = await getServerSession();
    if (!session) return unauthorized();
    if (session.user.role !== Role.ADMIN) return forbidden();

    const { id } = await params;

    await auth.api.removeUser({
      body: { userId: id },
      headers: await headers(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/admin/users/[id]/delete]", err);
    return internalServerError();
  }
}
