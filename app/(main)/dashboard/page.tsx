"use client";

import { useSession } from "@/lib/client/auth-client";
import { useDashboardData } from "@/hooks/services/useDashboardData";

import StatsGrid from "./_components/stat-card";
import RecentPropertiesCard from "./_components/recent-properties-card";
import TodayScheduleCard from "./_components/today-schedule-card";

import { Home, Building2, Users, DollarSign } from "lucide-react";
import Loading from "../_components/loading";

export const iconMap = {
  Home,
  Building2,
  Users,
  DollarSign,
};

export default function DashboardPage() {
  const { data } = useSession();
  const { data: dashboard, isLoading } = useDashboardData();

  if (isLoading) return <Loading />;

  const stats = dashboard!.stats.map((stat) => ({
    ...stat,
    icon: iconMap[stat.icon as keyof typeof iconMap],
  }));

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="bg-background px-6 py-6 space-y-8">
        <StatsGrid stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RecentPropertiesCard properties={dashboard!.recentProperties} />
          <TodayScheduleCard />
        </div>
      </div>
    </div>
  );
}
