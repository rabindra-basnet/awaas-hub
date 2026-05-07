import { NextResponse } from "next/server";
import { getServerSession } from "@/features/auth/server/session";
import { fetchAnalytics } from "@/features/analytics/server/analytics.fetcher";
import { forbidden, unauthorized } from "@/shared/lib/error";
import { Role } from "@/features/auth/rbac/access";

export async function GET() {
  const session = await getServerSession();
  if (!session) return unauthorized();
  if (session.user.role !== Role.ADMIN) return forbidden();

  const data = await fetchAnalytics();
  return NextResponse.json(data);
}
