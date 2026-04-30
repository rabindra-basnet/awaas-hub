import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/server/getSession";
import { Role } from "@/lib/rbac";
import { forbidden, unauthorized, badRequest, internalServerError } from "@/lib/error";
import { getDb } from "@/lib/server/db";
import { ObjectId } from "mongodb";

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

    if (!ObjectId.isValid(id)) return badRequest("Invalid user id");

    const db = await getDb();
    await db.collection("users").updateOne(
      { _id: new ObjectId(id) },
      { $set: { role } },
    );

    return NextResponse.json({ success: true, role });
  } catch (err) {
    console.error("[PATCH /api/admin/users/[id]]", err);
    return internalServerError();
  }
}
