import { NextResponse } from "next/server";
import { auth } from "@/lib/server/auth";
import { getServerSession } from "@/lib/server/getSession";
import { Role } from "@/lib/rbac";
import { forbidden, unauthorized, internalServerError } from "@/lib/error";
import { headers } from "next/headers";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) return unauthorized();
    if (session.user.role !== Role.ADMIN) return forbidden();

    const result = await auth.api.listUsers({
      query: { limit: 200 },
      headers: await headers(),
    });

    // Exclude admins from the list
    const users = result.users.filter((u) => u.role !== Role.ADMIN);

    return NextResponse.json({ users });
  } catch (err) {
    console.error("[GET /api/admin/users]", err);
    return internalServerError();
  }
}
