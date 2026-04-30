"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Home, Building2, Users, DollarSign } from "lucide-react";
import StatsGrid from "./stat-card";
import RecentPropertiesCard from "./recent-properties-card";
import { dashboardQuery } from "@/lib/client/queries/dashboard.queries";

const ICONMAP = {
  Home,
  Building2,
  Users,
  DollarSign,
};

export default function DashboardContent() {
  const { data: dashboard } = useSuspenseQuery(dashboardQuery());

  const stats = dashboard.stats.map((stat) => ({
    ...stat,
    icon: ICONMAP[stat.icon as keyof typeof ICONMAP],
  }));

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="bg-background px-6 py-6 space-y-8">
        <StatsGrid stats={stats} />
        <RecentPropertiesCard properties={dashboard.recentProperties} />
      </div>
    </div>
  );
}
