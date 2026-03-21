"use client";

import { useSession } from "@/lib/client/auth-client";
import StatsGrid from "./_components/stat-card";
import RecentPropertiesCard from "./_components/recent-properties-card";
import TodayScheduleCard from "./_components/today-schedule-card";

import { Home, Building2, Users, DollarSign } from "lucide-react";
import Loading from "../_components/loading";
import { useDashboardData } from "@/lib/client/queries/dashboard.queries";
import { forbidden } from "@/lib/error";

export const iconMap = {
  Home,
  Building2,
  Users,
  DollarSign,
};

export default function DashboardPage() {
  const { data: session } = useSession();
  if (!session || !session.user) return forbidden();

  const { data: dashboard, isLoading } = useDashboardData();
  if (isLoading) return <Loading />;

  // Fallback if dashboard is undefined
  const safeDashboard = dashboard ?? {
    stats: [],
    recentProperties: [],
    todaysSchedule: [],
  };

  const stats = safeDashboard.stats.map((stat) => ({
    ...stat,
    icon: iconMap[stat.icon as keyof typeof iconMap],
  }));

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="bg-background px-6 py-6 space-y-8">
        <StatsGrid stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RecentPropertiesCard properties={safeDashboard.recentProperties} />
          <TodayScheduleCard schedule={safeDashboard.todaysSchedule} />
        </div>
      </div>
    </div>
  );
}
