"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useSession } from "@/lib/client/auth-client";
import { dashboardQuery } from "@/lib/client/queries/dashboard.queries";
import TodayScheduleCard from "./today-schedule-card";
import Image from "next/image";
import Link from "next/link";
import {
  Home,
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  Heart,
  Clock,
  MapPin,
  Plus,
  ArrowRight,
  CheckCircle2,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  BarChart2,
  ShieldCheck,
  BadgeDollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

// ── Icon map ─────────────────────────────────────────────────────────────────
const ICONMAP: Record<string, React.ElementType> = {
  Home,
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  Heart,
  Clock,
};

// ── Status styling ────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  available: "#10b981",
  booked: "#f59e0b",
  sold: "#ef4444",
};

const STATUS_CARD_STYLES: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  available: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    text: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  booked: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  sold: {
    bg: "bg-rose-50 dark:bg-rose-950/30",
    text: "text-rose-700 dark:text-rose-400",
    dot: "bg-rose-500",
  },
};

const STAT_ACCENT: Record<string, string> = {
  Building2: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Home: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Users: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  DollarSign: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  TrendingUp: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  Heart: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  Clock: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
};

const STAT_BORDER: Record<string, string> = {
  Building2: "border-l-blue-500",
  Home: "border-l-emerald-500",
  Users: "border-l-violet-500",
  DollarSign: "border-l-amber-500",
  TrendingUp: "border-l-rose-500",
  Heart: "border-l-pink-500",
  Clock: "border-l-orange-500",
};

// ── Greeting ─────────────────────────────────────────────────────────────────
function useGreeting() {
  const [greeting, setGreeting] = useState<string>("");
  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(
      h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening",
    );
  }, []);
  return greeting;
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function DashboardContent() {
  const { data: dashboard } = useSuspenseQuery(dashboardQuery());
  const { data: session } = useSession();

  const role = dashboard.role;
  const isAdmin = role === "admin";
  const isSeller = role === "seller";
  const firstName = session?.user?.name?.split(" ")[0] ?? "there";
  const greeting = useGreeting();

  const stats = dashboard.stats.map((s) => ({
    ...s,
    IconComp: ICONMAP[s.icon] ?? Building2,
  }));
  console.log(dashboard.todaysSchedule)
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex-1 overflow-y-auto [scrollbar-width:thin]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ── Greeting banner ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {greeting && <>{greeting}, </>}
              <span className="text-primary">{firstName}</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">{today}</p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-primary/10 text-primary capitalize">
              {role}
            </span>

            <Link
              href="/properties/new"
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 px-3.5 py-2 rounded-lg transition-colors"
            >
              <Plus size={13} /> Add Property
            </Link>
            {isAdmin && (
              <Link
                href="/users"
                className="inline-flex items-center gap-1.5 text-xs font-semibold border border-border hover:bg-muted/60 px-3.5 py-2 rounded-lg transition-colors text-foreground"
              >
                <Users size={13} /> Manage Users
              </Link>
            )}
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const accentCls = STAT_ACCENT[stat.icon] ?? STAT_ACCENT.Building2;
            const borderCls = STAT_BORDER[stat.icon] ?? STAT_BORDER.Building2;
            const changeVal = parseFloat(
              String(stat.change).replace("%", "").replace("+", ""),
            );
            const isUp = changeVal >= 0;
            return (
              <div
                key={stat.label}
                className={cn(
                  "bg-card rounded-xl border border-border/60 border-l-4 p-5 hover:shadow-md transition-shadow",
                  borderCls,
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center",
                      accentCls,
                    )}
                  >
                    <stat.IconComp size={16} />
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full",
                      isUp
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                        : "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400",
                    )}
                  >
                    {isUp ? (
                      <ArrowUpRight size={10} />
                    ) : (
                      <ArrowDownRight size={10} />
                    )}
                    {Math.abs(changeVal)}%
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground tabular-nums">
                  {typeof stat.value === "number"
                    ? stat.value.toLocaleString()
                    : stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* ── Admin: Analytics charts ── */}
        {isAdmin && dashboard.propertiesByStatus?.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-card rounded-xl border border-border/60 p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 size={14} className="text-muted-foreground" />
                <h3 className="text-sm font-semibold">Properties by Status</h3>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={dashboard.propertiesByStatus}
                    dataKey="count"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    outerRadius={78}
                    innerRadius={44}
                    paddingAngle={3}
                  >
                    {dashboard.propertiesByStatus.map((entry, i) => (
                      <Cell
                        key={entry._id}
                        fill={STATUS_COLORS[entry._id] ?? "#6366f1"}
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
                    formatter={(value, name) => [
                      value,
                      String(name).charAt(0).toUpperCase() +
                        String(name).slice(1),
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="flex items-center justify-center gap-4 mt-1">
                {dashboard.propertiesByStatus.map((entry) => (
                  <span
                    key={entry._id}
                    className="flex items-center gap-1.5 text-[11px] text-muted-foreground capitalize"
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        background: STATUS_COLORS[entry._id] ?? "#6366f1",
                      }}
                    />
                    {entry._id}{" "}
                    <span className="font-semibold text-foreground">
                      {entry.count}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border/60 p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 size={14} className="text-muted-foreground" />
                <h3 className="text-sm font-semibold">Listing Volume</h3>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dashboard.propertiesByStatus} barSize={40}>
                  <XAxis
                    dataKey="_id"
                    tick={{
                      fontSize: 11,
                      fill: "var(--muted-foreground)",
                      textTransform: "capitalize",
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) =>
                      v.charAt(0).toUpperCase() + v.slice(1)
                    }
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    width={28}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(value, name) => [value, "Properties"]}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {dashboard.propertiesByStatus.map((entry) => (
                      <Cell
                        key={entry._id}
                        fill={STATUS_COLORS[entry._id] ?? "#6366f1"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── Seller: Property status breakdown ── */}
        {isSeller && dashboard.propertiesByStatus?.length > 0 && (
          <PropertyStatusBar
            propertiesByStatus={dashboard.propertiesByStatus}
          />
        )}

        {/* ── Bottom: Recent properties + Quick actions ── */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-1">
            <RecentProperties
              properties={dashboard.recentProperties}
              role={role}
            />
          </div>
          <TodayScheduleCard schedule={dashboard.todaysSchedule ?? []} />
          <div>
            <QuickActions
              role={role}
              pendingCount={dashboard.pendingVerificationCount}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Property status bar (seller) ─────────────────────────────────────────────
function PropertyStatusBar({
  propertiesByStatus,
}: {
  propertiesByStatus: { _id: string; count: number }[];
}) {
  const total = propertiesByStatus.reduce((s, e) => s + e.count, 0);
  if (total === 0) return null;

  const order = ["available", "booked", "sold"];
  const sorted = order
    .map(
      (id) =>
        propertiesByStatus.find((e) => e._id === id) ?? { _id: id, count: 0 },
    )
    .filter((e) => e.count > 0);

  return (
    <div className="bg-card rounded-xl border border-border/60 p-5">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck size={14} className="text-muted-foreground" />
        <h3 className="text-sm font-semibold">Your Portfolio Breakdown</h3>
        <span className="ml-auto text-xs text-muted-foreground">
          {total} total
        </span>
      </div>

      {/* Progress bar */}
      <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5 mb-4">
        {sorted.map((entry) => {
          const style = STATUS_CARD_STYLES[entry._id];
          const pct = Math.round((entry.count / total) * 100);
          return (
            <div
              key={entry._id}
              className="h-full rounded-full transition-all"
              style={{
                width: `${pct}%`,
                background: STATUS_COLORS[entry._id] ?? "#6366f1",
              }}
            />
          );
        })}
      </div>

      {/* Labels */}
      <div className="grid grid-cols-3 gap-3">
        {order.map((id) => {
          const entry = propertiesByStatus.find((e) => e._id === id) ?? {
            _id: id,
            count: 0,
          };
          const style = STATUS_CARD_STYLES[id] ?? STATUS_CARD_STYLES.available;
          const pct = total > 0 ? Math.round((entry.count / total) * 100) : 0;
          return (
            <div
              key={id}
              className={cn("rounded-xl px-3.5 py-3 text-center", style.bg)}
            >
              <p className={cn("text-xl font-bold tabular-nums", style.text)}>
                {entry.count}
              </p>
              <p
                className={cn(
                  "text-[10px] font-semibold capitalize mt-0.5",
                  style.text,
                )}
              >
                {id}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{pct}%</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Recent properties ─────────────────────────────────────────────────────────
const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=70";

const STATUS_BADGE: Record<string, string> = {
  available: "bg-emerald-500 text-white",
  booked: "bg-amber-500 text-white",
  sold: "bg-rose-600 text-white",
};

function RecentProperties({
  properties,
  role,
}: {
  properties: any[];
  role: string;
}) {
  return (
    <div className="bg-card rounded-xl border border-border/60 p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Recent Properties</h3>
        <Link
          href="/properties"
          className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
        >
          View all <ArrowRight size={11} />
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 gap-3 text-center">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
            <Building2 size={20} className="text-muted-foreground/40" />
          </div>
          <div>
            <p className="text-sm font-medium">No properties yet</p>
            {role !== "buyer" && (
              <Link
                href="/properties/new"
                className="text-xs text-primary hover:underline mt-1 block"
              >
                Add your first property →
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {properties.map((p: any) => {
            const isSold = p.status === "sold";
            return (
              <Link
                key={String(p._id)}
                href={`/properties/${p._id}`}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors group"
              >
                {/* Thumbnail */}
                <div className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={p.image || FALLBACK_IMG}
                    alt={p.title}
                    fill
                    sizes="56px"
                    className={cn(
                      "object-cover transition-transform duration-300 group-hover:scale-105",
                      isSold && "grayscale-[40%]",
                    )}
                  />
                  {p.status && (
                    <span
                      className={cn(
                        "absolute bottom-0.5 left-0.5 text-[8px] font-bold px-1.5 py-0.5 rounded capitalize leading-none",
                        STATUS_BADGE[p.status] ??
                          "bg-muted text-muted-foreground",
                      )}
                    >
                      {p.status}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold line-clamp-1 text-foreground group-hover:text-primary transition-colors">
                    {p.title}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5 text-[11px] text-muted-foreground">
                    <MapPin size={9} className="shrink-0" />
                    <span className="truncate">{p.location || "—"}</span>
                  </div>
                </div>

                {/* Price + verified */}
                <div className="text-right shrink-0">
                  <p className="text-[13px] font-bold text-foreground tabular-nums">
                    NPR {Number(p.price ?? 0).toLocaleString("en-IN")}
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    {p.verificationStatus === "verified" && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-emerald-600">
                        <CheckCircle2 size={9} /> Verified
                      </span>
                    )}
                    {p.views != null && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Eye size={9} /> {p.views}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Quick actions ─────────────────────────────────────────────────────────────
function QuickActions({
  role,
  pendingCount,
}: {
  role: string;
  pendingCount: number;
}) {
  const isAdmin = role === "admin";
  const isSeller = role === "seller";

  type Action = {
    label: string;
    desc: string;
    href: string;
    icon: React.ElementType;
    accent: string;
    badge?: number;
  };

  const actions: Action[] = isAdmin
    ? [
        {
          label: "All Properties",
          desc: "Browse & manage listings",
          href: "/properties",
          icon: Building2,
          accent: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
        },
        {
          label: "Manage Users",
          desc: "Roles, access & accounts",
          href: "/users",
          icon: Users,
          accent: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
        },
        {
          label: "Pending Review",
          desc: "Properties awaiting approval",
          href: "/properties?verification=pending",
          icon: Clock,
          accent: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
          badge: pendingCount,
        },
        {
          label: "Add Property",
          desc: "List a new property",
          href: "/properties/new",
          icon: Plus,
          accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        },
        {
          label: "Settings",
          desc: "Platform configuration",
          href: "/settings",
          icon: Settings,
          accent: "bg-muted text-muted-foreground",
        },
      ]
    : isSeller
      ? [
          {
            label: "Add Property",
            desc: "List a new property",
            href: "/properties/new",
            icon: Plus,
            accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
          },
          {
            label: "My Listings",
            desc: "View your properties",
            href: "/properties",
            icon: Building2,
            accent: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
          },
          {
            label: "Favorites",
            desc: "Your saved properties",
            href: "/favorites",
            icon: Heart,
            accent: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
          },
          {
            label: "Files",
            desc: "Manage uploaded files",
            href: "/files",
            icon: BadgeDollarSign,
            accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
          },
          {
            label: "Settings",
            desc: "Account preferences",
            href: "/settings",
            icon: Settings,
            accent: "bg-muted text-muted-foreground",
          },
        ]
      : [
          {
            label: "Browse Properties",
            desc: "Explore all listings",
            href: "/properties",
            icon: Building2,
            accent: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
          },
          {
            label: "Favorites",
            desc: "Your saved properties",
            href: "/favorites",
            icon: Heart,
            accent: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
          },
          {
            label: "Files",
            desc: "Your documents",
            href: "/files",
            icon: BadgeDollarSign,
            accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
          },
          {
            label: "Settings",
            desc: "Account preferences",
            href: "/settings",
            icon: Settings,
            accent: "bg-muted text-muted-foreground",
          },
        ];

  return (
    <div className="bg-card rounded-xl border border-border/60 p-5 h-full">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-sm font-semibold">Quick Actions</h3>
      </div>

      <div className="space-y-1.5">
        {actions.map((a) => (
          <Link
            key={a.href + a.label}
            href={a.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/60 transition-colors group"
          >
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                a.accent,
              )}
            >
              <a.icon size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold group-hover:text-primary transition-colors">
                {a.label}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {a.desc}
              </p>
            </div>
            {a.badge != null && a.badge > 0 && (
              <span className="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400 text-[10px] font-bold">
                {a.badge > 9 ? "9+" : a.badge}
              </span>
            )}
            <ArrowRight
              size={12}
              className="text-muted-foreground/40 shrink-0 group-hover:text-muted-foreground transition-colors"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
