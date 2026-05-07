import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/features/auth/server/session";
import { getAuth } from "@/features/auth/server/auth";
import { forbidden, notFound, unauthorized } from "@/shared/lib/error";
import { Role } from "@/features/auth/rbac/access";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session) return unauthorized();
  if (session.user.role !== Role.ADMIN) return forbidden();

  const auth = await getAuth();
  const user = await auth.api.getUser({ query: { userId: id } }).catch(() => null);
  if (!user) return notFound();
  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session) return unauthorized();
  if (session.user.role !== Role.ADMIN) return forbidden();

  const { role } = await req.json().catch(() => ({}));
  if (!role || !["user", "admin"].includes(role))
    return NextResponse.json({ message: "Invalid role" }, { status: 400 });

  const auth = await getAuth();
  await auth.api.setRole({ body: { userId: id, role } });
  return NextResponse.json({ success: true });
}
