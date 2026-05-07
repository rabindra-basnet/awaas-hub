"use client";

import { useDashboardStats } from "@/features/dashboard/queries/dashboard.queries";
import { Role } from "@/features/auth/rbac/access";
import { formatPrice } from "@/shared/lib/utils";
import {
  Building2,
  CheckCircle2,
  Clock,
  Heart,
  Home,
  TrendingUp,
  AlertCircle,
  Ban,
} from "lucide-react";

interface Props {
  userId: string;
  role: Role;
}

export default function DashboardContent({ userId, role }: Props) {
  const { data } = useDashboardStats(userId);
  const { stats, recentProperties, isAdmin } = data;

  const statCards = [
    {
      label: isAdmin ? "Total Properties" : "My Listings",
      value: stats.totalProperties ?? 0,
      icon: Building2,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      label: "Available",
      value: stats.available,
      icon: CheckCircle2,
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-950/30",
    },
    {
      label: "Booked",
      value: stats.booked,
      icon: Clock,
      color: "text-yellow-500",
      bg: "bg-yellow-50 dark:bg-yellow-950/30",
    },
    {
      label: "Sold",
      value: stats.sold,
      icon: TrendingUp,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-950/30",
    },
    {
      label: "Favorites",
      value: stats.favorites,
      icon: Heart,
      color: "text-rose-500",
      bg: "bg-rose-50 dark:bg-rose-950/30",
    },
    ...(isAdmin && stats.pendingVerification != null
      ? [
          {
            label: "Pending Review",
            value: stats.pendingVerification,
            icon: AlertCircle,
            color: "text-orange-500",
            bg: "bg-orange-50 dark:bg-orange-950/30",
          },
        ]
      : []),
  ];

  const statusColors: Record<string, string> = {
    available: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
    booked:    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
    sold:      "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
  };

  const verificationColors: Record<string, string> = {
    pending:  "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
    verified: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {isAdmin ? "Admin Dashboard" : "My Dashboard"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isAdmin ? "Platform-wide overview" : "Your listings and activity at a glance"}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-card p-4 space-y-3 hover:shadow-sm transition-shadow"
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${bg}`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Listings */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-sm">Recent Listings</h2>
          <a
            href="/properties"
            className="text-xs text-primary hover:underline font-medium"
          >
            View all →
          </a>
        </div>

        {recentProperties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
            <Home className="w-10 h-10 opacity-20" />
            <p className="text-sm opacity-60">No listings yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentProperties.map((p) => (
              <a
                key={p._id}
                href={`/properties/${p._id}`}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-muted/40 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {p.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{p.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${verificationColors[p.verificationStatus]}`}>
                    {p.verificationStatus}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${statusColors[p.status]}`}>
                    {p.status}
                  </span>
                  <span className="text-sm font-semibold tabular-nums">
                    NPR {p.price.toLocaleString()}
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
