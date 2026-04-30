import { NextResponse } from "next/server";
import { auth } from "@/lib/server/auth";
import { getServerSession } from "@/lib/server/getSession";
import { Role } from "@/lib/rbac";
import { forbidden, unauthorized, badRequest, internalServerError } from "@/lib/error";
import { getDb } from "@/lib/server/db";
import { ObjectId } from "mongodb";
import { headers } from "next/headers";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  try {
    const session = await getServerSession();
    if (!session) return unauthorized();
    if (session.user.role !== Role.ADMIN) return forbidden();

    const { id } = await params;
    if (!ObjectId.isValid(id)) return forbidden();

    const db = await getDb();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(id) }, { projection: { email: 1 } });

    if (!user) return badRequest("User not found");

    await auth.api.forgetPassword({
      body: {
        email: user.email as string,
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`,
      },
      headers: await headers(),
    });

    return NextResponse.json({ success: true, email: user.email });
  } catch (err) {
    console.error("[POST /api/admin/users/[id]/reset-password]", err);
    return internalServerError();
  }
}
