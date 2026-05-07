import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/features/auth/server/session";
import { getAuth } from "@/features/auth/server/auth";
import { forbidden, unauthorized } from "@/shared/lib/error";
import { Role } from "@/features/auth/rbac/access";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return unauthorized();
  if (session.user.role !== Role.ADMIN) return forbidden();

  const { searchParams } = req.nextUrl;
  const limit = Number(searchParams.get("limit") || 50);
  const offset = Number(searchParams.get("offset") || 0);
  const search = searchParams.get("search") || undefined;
  const role = searchParams.get("role") || undefined;

  const auth = await getAuth();
  const result = await auth.api.listUsers({
    query: {
      limit,
      offset,
      ...(search ? { searchValue: search } : {}),
      ...(role ? { filterField: "role" as const, filterValue: role } : {}),
    },
  });

  return NextResponse.json(result);
}

const createSchema = z.object({
  name:     z.string().min(1),
  email:    z.string().email(),
  password: z.string().min(8),
  role:     z.enum(["user", "admin"]).default("user"),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return unauthorized();
  if (session.user.role !== Role.ADMIN) return forbidden();

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: parsed.error.errors[0]?.message }, { status: 400 });

  const auth = await getAuth();
  const user = await auth.api.createUser({ body: parsed.data });
  return NextResponse.json(user, { status: 201 });
}
