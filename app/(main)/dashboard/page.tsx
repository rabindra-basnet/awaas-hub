import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { getServerSession } from "@/lib/server/getSession";
import { fetchDashboardData } from "@/lib/server/fetchers/dashboard.fetcher";
import DashboardContent from "./_components/dashboard-content";
import DashboardSkeleton from "./_components/dashboard-skeleton";

export default async function DashboardPage() {
  const session = await getServerSession();
  const queryClient = getQueryClient();

  if (session) {
    await queryClient.prefetchQuery({
      queryKey: ["dashboard"],
      queryFn: () => fetchDashboardData(session),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </HydrationBoundary>
  );
}
