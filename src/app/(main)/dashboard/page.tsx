import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { getQueryClient } from "@/shared/lib/query-client";
import { getServerSession } from "@/features/auth/server/session";
import { fetchDashboardStats } from "@/features/dashboard/server/dashboard.fetcher";
import { dashboardStatsOptions } from "@/features/dashboard/queries/dashboard.queries";
import { Role } from "@/features/auth/rbac/access";
import DashboardContent from "@/features/dashboard/components/dashboard-content";

export default async function DashboardPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const qc = getQueryClient();
  const opts = dashboardStatsOptions(session.user.id);

  await qc.prefetchQuery({
    queryKey: opts.queryKey,
    queryFn:  () => fetchDashboardStats(session.user.id, session.user.role as Role),
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <DashboardContent userId={session.user.id} role={session.user.role as Role} />
    </HydrationBoundary>
  );
}
