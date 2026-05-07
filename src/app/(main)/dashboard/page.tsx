import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { getQueryClient } from "@/shared/lib/query-client";
import { getServerSession, isRealSession } from "@/features/auth/server/session";
import { fetchDashboardStats } from "@/features/dashboard/server/dashboard.fetcher";
import { dashboardKeys } from "@/features/dashboard/lib/dashboard-keys";
import { Role } from "@/features/auth/rbac/access";
import DashboardContent from "@/features/dashboard/components/dashboard-content";

export default async function DashboardPage() {
  const session = await getServerSession();
  if (!isRealSession(session)) redirect("/login");

  const qc = getQueryClient();

  await qc.prefetchQuery({
    queryKey: dashboardKeys.stats(session.user.id),
    queryFn:  () => fetchDashboardStats(session.user.id, session.user.role as Role),
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <DashboardContent userId={session.user.id} role={session.user.role as Role} />
    </HydrationBoundary>
  );
}
