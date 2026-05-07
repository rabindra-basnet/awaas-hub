"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { apiError } from "@/shared/lib/error";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, CartesianGrid } from "recharts";
import { Building2, Users, Calendar, Heart, TrendingUp, Clock } from "lucide-react";

function useAnalytics() {
  return useSuspenseQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const res = await fetch("/api/analytics");
      if (!res.ok) throw await apiError(res);
      return res.json();
    },
  });
}

const COLORS = ["#2563eb", "#16a34a", "#d97706", "#9333ea", "#dc2626"];

export default function AnalyticsDashboard() {
  const { data } = useAnalytics();

  const stats = [
    { label: "Total Properties", value: data.totalProperties, icon: Building2, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
    { label: "Available", value: data.availableProperties, icon: TrendingUp, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/30" },
    { label: "Booked", value: data.bookedProperties, icon: Clock, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950/30" },
    { label: "Sold", value: data.soldProperties, icon: Building2, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/30" },
    { label: "Appointments", value: data.totalAppointments, icon: Calendar, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
    { label: "Favorites", value: data.totalFavorites, icon: Heart, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/30" },
    { label: "Pending Review", value: data.pendingProperties, icon: Clock, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/30" },
  ];

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyData = [...(data.monthlyListings ?? [])].reverse().map((m: any) => ({
    name: `${monthNames[m.month - 1]} ${m.year}`,
    count: m.count,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time platform-wide statistics</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4 space-y-3">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold mb-4 text-sm">Properties by Status</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data.propertiesByStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label={({ status, count }: any) => `${status}: ${count}`}>
                {(data.propertiesByStatus ?? []).map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold mb-4 text-sm">Monthly Listings</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
