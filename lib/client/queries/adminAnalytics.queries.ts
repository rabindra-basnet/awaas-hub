import { queryOptions, useQuery } from "@tanstack/react-query";

export interface Stats {
  totalUsers: number;
  totalProperties: number;
  availableProperties: number;
  totalFavorites: number;
}

export interface ChartData {
  propertiesByStatus: { _id: string; count: number }[];
}

export interface AnalyticsResponse {
  stats: Stats;
  charts: ChartData;
}

/* ======================
   Query Options
====================== */
export const adminAnalyticsQuery = () =>
  queryOptions<AnalyticsResponse>({
    queryKey: ["adminAnalytics"],
    queryFn: async () => {
      const res = await fetch("/api/analytics");

      if (!res.ok) {
        throw new Error("Failed to fetch admin analytics");
      }

      return res.json();
    },
    refetchOnWindowFocus: false,
  });

/* ======================
   Hook Wrapper
====================== */
export const useAdminAnalytics = () => {
  return useQuery(adminAnalyticsQuery());
};
