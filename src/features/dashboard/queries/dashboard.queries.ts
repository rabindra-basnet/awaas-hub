"use client";

import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

export const dashboardKeys = {
  stats: (userId: string) => ["dashboard", "stats", userId] as const,
};

export const dashboardStatsOptions = (userId: string) =>
  queryOptions({
    queryKey: dashboardKeys.stats(userId),
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Failed to load dashboard");
      }
      return res.json();
    },
  });

export const useDashboardStats = (userId: string) =>
  useSuspenseQuery(dashboardStatsOptions(userId));
