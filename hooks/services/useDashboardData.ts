import { useQuery } from "@tanstack/react-query";

type DashboardResponse = {
  stats: {
    label: string;
    value: string;
    change: string;
    icon: string;
  }[];
  recentProperties: any[];
  todaysSchedule: any[];
};

export function useDashboardData() {
  return useQuery<DashboardResponse>({
    queryKey: ["dashboard-data"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      return res.json();
    },
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
    staleTime: 5_000,
  });
}
