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

/** POST /api/admin/users/[id]/reset-password — send password reset email to user */
export async function POST(_req: Request, { params }: Params) {
  try {
    const session = await getServerSession();
    if (!session) return unauthorized();
    if (session.user.role !== Role.ADMIN) return forbidden();

    const { id } = await params;

    // Get the user's email first
    const result = await auth.api.listUsers({
      query: { searchField: "id", searchValue: id, limit: 1 },
      headers: await headers(),
    });

    const user = result.users[0];
    if (!user) return badRequest("User not found");

    await auth.api.forgetPassword({
      body: {
        email: user.email,
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
