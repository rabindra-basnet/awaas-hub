import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/server/getSession";
import { Role } from "@/lib/rbac";
import { forbidden, unauthorized, internalServerError } from "@/lib/error";
import { getDb } from "@/lib/server/db";
import { ObjectId } from "mongodb";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const session = await getServerSession();
    if (!session) return unauthorized();
    if (session.user.role !== Role.ADMIN) return forbidden();

    const { id } = await params;
    if (!ObjectId.isValid(id)) return forbidden();

    const db = await getDb();
    await db.collection("users").deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/admin/users/[id]/delete]", err);
    return internalServerError();
  }
}
