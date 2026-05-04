import { queryOptions, useQuery } from "@tanstack/react-query";

/* ======================
   Types
====================== */
export type DashboardStat = {
  label: string;
  value: string;
  change: string;
  icon: string;
};

export type DashboardResponse = {
  stats: DashboardStat[];
  recentProperties: any[];
  propertiesByStatus: { _id: string; count: number }[];
  soldCount: number;
  bookedCount: number;
  pendingVerificationCount: number;
  favoritesCount: number;
  role: string;
};

/* ======================
   Query Options
====================== */
export const dashboardQuery = () =>
  queryOptions<DashboardResponse>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");

      if (!res.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      return res.json();
    },
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
    staleTime: 5_000,
  });

/* ======================
   Hook Wrapper
====================== */
export const useDashboardData = () => {
  return useQuery(dashboardQuery());
};
