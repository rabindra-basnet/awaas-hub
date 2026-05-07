import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/features/auth/server/session";
import { fetchProperties } from "@/features/properties/server/properties.fetcher";
import { Role } from "@/features/auth/rbac/access";

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  const { searchParams } = req.nextUrl;

  const data = await fetchProperties({
    userId: session?.user.id,
    role:   session?.user.role as Role | undefined,
    cursor:   searchParams.get("cursor") ?? undefined,
    limit:    searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
    category: searchParams.get("category") ?? undefined,
    status:   searchParams.get("status") ?? undefined,
    search:   searchParams.get("search") ?? undefined,
  });

  return NextResponse.json(data);
}
