import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/server/getSession";
import { fetchDashboardData } from "@/lib/server/fetchers/dashboard.fetcher";
import { Role, Permission, requirePermission } from "@/lib/rbac";
import { unauthorized, internalServerError } from "@/lib/error";
import { getDb } from "@/lib/server/db";

export async function GET() {
  try {
    await getDb();
    const session = await getServerSession();
    if (!session) return unauthorized();
    requirePermission(session.user.role as Role, Permission.VIEW_DASHBOARD);

    const data = await fetchDashboardData(session);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error(err);
    return internalServerError(err.message);
  }
}
