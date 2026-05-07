import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/features/auth/server/session";
import { getAuth } from "@/features/auth/server/auth";
import { forbidden, unauthorized } from "@/shared/lib/error";
import { Role } from "@/features/auth/rbac/access";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session) return unauthorized();
  if (session.user.role !== Role.ADMIN) return forbidden();

  const { banReason, banExpiresIn } = await req.json().catch(() => ({}));
  const auth = await getAuth();
  await auth.api.banUser({ body: { userId: id, banReason, banExpiresIn } });
  return NextResponse.json({ success: true });
}
