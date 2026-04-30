"use client";

import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis,
} from "recharts";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { useAdminAnalytics } from "@/lib/client/queries/adminAnalytics.queries";
import { Building2, Users, Heart, CheckCircle2 } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  available: "#10b981",
  booked: "#f59e0b",
  sold: "#ef4444",
};
const FALLBACK_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#3b82f6"];

const STAT_ICONS: Record<string, React.ReactNode> = {
  totalUsers: <Users size={18} className="text-primary" />,
  totalProperties: <Building2 size={18} className="text-primary" />,
  availableProperties: <CheckCircle2 size={18} className="text-emerald-500" />,
  totalFavorites: <Heart size={18} className="text-red-400" />,
};

const STAT_LABELS: Record<string, string> = {
  totalUsers: "Total Users",
  totalProperties: "Total Properties",
  availableProperties: "Available Properties",
  totalFavorites: "Total Favorites",
};

export default function AnalyticsPage() {
  const { data, isLoading, isError, error } = useAdminAnalytics();
  const [barColors, setBarColors] = useState<string[]>([]);

  useEffect(() => {
    if (data?.charts?.propertiesByStatus?.length) {
      setBarColors(
        data.charts.propertiesByStatus.map(
          (entry) => STATUS_COLORS[entry._id] ?? FALLBACK_COLORS[0],
        ),
      );
    }
  }, [data]);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-muted-foreground animate-pulse">Loading analytics…</p>
      </div>
    );

  if (isError)
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-destructive">Error: {(error as Error)?.message}</p>
      </div>
    );

  if (!data)
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );

  const { stats, charts } = data;
  const propertiesByStatus = charts?.propertiesByStatus ?? [];

  return (
    <div className="p-6 space-y-8">
      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.keys(STAT_LABELS) as (keyof typeof STAT_LABELS)[]).map((key) => (
          <Card key={key} className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{STAT_LABELS[key]}</p>
                  <p className="text-3xl font-bold text-foreground">
                    {stats[key as keyof typeof stats] ?? 0}
                  </p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  {STAT_ICONS[key]}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Properties by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {propertiesByStatus.length === 0 ? (
              <div className="flex items-center justify-center h-[260px] text-sm text-muted-foreground">
                No data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={propertiesByStatus}
                    dataKey="count"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ _id, percent }) =>
                      `${_id} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {propertiesByStatus.map((entry, index) => (
                      <Cell
                        key={entry._id}
                        fill={
                          STATUS_COLORS[entry._id] ??
                          FALLBACK_COLORS[index % FALLBACK_COLORS.length]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Legend iconType="circle" iconSize={10} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Property Count by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {propertiesByStatus.length === 0 ? (
              <div className="flex items-center justify-center h-[260px] text-sm text-muted-foreground">
                No data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={propertiesByStatus} barSize={36}>
                  <XAxis
                    dataKey="_id"
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {propertiesByStatus.map((entry, index) => (
                      <Cell
                        key={entry._id}
                        fill={
                          barColors[index] ??
                          STATUS_COLORS[entry._id] ??
                          FALLBACK_COLORS[index % FALLBACK_COLORS.length]
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
