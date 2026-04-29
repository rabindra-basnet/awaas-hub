import { NextResponse } from "next/server";
import { auth } from "@/lib/server/auth";
import { getServerSession } from "@/lib/server/getSession";
import { Role } from "@/lib/rbac";
import {
  forbidden,
  unauthorized,
  badRequest,
  internalServerError,
} from "@/lib/error";
import { headers } from "next/headers";

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/admin/users/[id] — change role */
export async function PATCH(req: Request, { params }: Params) {
  try {
    const session = await getServerSession();
    if (!session) return unauthorized();
    if (session.user.role !== Role.ADMIN) return forbidden();

    const { id } = await params;
    const { role } = await req.json();

    if (!role || !["buyer", "seller"].includes(role))
      return badRequest("role must be buyer or seller");

    await auth.api.setRole({
      body: { userId: id, role },
      headers: await headers(),
    });

    return NextResponse.json({ success: true, role });
  } catch (err) {
    console.error("[PATCH /api/admin/users/[id]]", err);
    return internalServerError();
  }
}
