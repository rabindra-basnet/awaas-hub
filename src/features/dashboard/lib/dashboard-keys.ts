// Shared query key factory — no "use client", safe on server and client
export const dashboardKeys = {
  stats: (userId: string) => ["dashboard", "stats", userId] as const,
};
