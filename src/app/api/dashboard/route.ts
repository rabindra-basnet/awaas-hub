import { NextResponse } from "next/server";
import { getServerSession } from "@/features/auth/server/session";
import { fetchDashboardStats } from "@/features/dashboard/server/dashboard.fetcher";
import { unauthorized } from "@/shared/lib/error";
import { Role } from "@/features/auth/rbac/access";

export async function GET() {
  const session = await getServerSession();
  if (!session) return unauthorized();

  const data = await fetchDashboardStats(session.user.id, session.user.role as Role);
  return NextResponse.json(data);
}
