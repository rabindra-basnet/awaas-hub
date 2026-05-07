import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { getQueryClient } from "@/shared/lib/query-client";
import { getServerSession } from "@/features/auth/server/session";
import { fetchAnalytics } from "@/features/analytics/server/analytics.fetcher";
import { Role } from "@/features/auth/rbac/access";
import AnalyticsDashboard from "@/features/analytics/components/analytics-dashboard";

export default async function AnalyticsPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");
  if (session.user.role !== Role.ADMIN) redirect("/dashboard");

  const qc = getQueryClient();
  await qc.prefetchQuery({
    queryKey: ["analytics"],
    queryFn:  fetchAnalytics,
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <AnalyticsDashboard />
    </HydrationBoundary>
  );
}
