import { Property } from "@/lib/models/Property";
import Files from "@/lib/models/Files";
import { getSignedUrlForDownload } from "@/lib/server/r2-client";
import { Role } from "@/lib/rbac";
import { getDb } from "@/lib/server/db";
import type { DashboardResponse } from "@/lib/client/queries/dashboard.queries";
import type { Session } from "@/lib/server/auth";

function calcChange(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? "+100%" : "0%";
  const pct = ((current - previous) / previous) * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
}

function monthRange(year: number, month: number) {
  return {
    start: new Date(year, month, 1, 0, 0, 0, 0),
    end: new Date(year, month + 1, 0, 23, 59, 59, 999),
  };
}

export async function fetchDashboardData(
  session: Session,
): Promise<DashboardResponse> {
  const db = await getDb();
  const userId = session.user.id;
  const role = session.user.role as Role;
  const isAdmin = role === Role.ADMIN;

  const now = new Date();
  const thisMonth = monthRange(now.getFullYear(), now.getMonth());
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = monthRange(
    lastMonthDate.getFullYear(),
    lastMonthDate.getMonth(),
  );

  const propertyQuery = role === Role.SELLER ? { sellerId: userId } : {};

  const recentPropertiesRaw = await Property.find(propertyQuery)
    .sort({ createdAt: -1 })
    .limit(4)
    .select("title location price views messagesCount")
    .lean();

  const recentProperties = await Promise.all(
    recentPropertiesRaw.map(async (prop) => {
      let imageUrl: string | null = null;
      if (prop._id) {
        const file = await Files.findOne({
          propertyId: prop._id.toString(),
          isDeleted: false,
        }).sort({ createdAt: 1 });
        if (file?.storedName) imageUrl = await getSignedUrlForDownload(file.storedName);
      }
      return { ...prop, image: imageUrl || null };
    }),
  );

  const usersCol = db.collection("users");

  const [
    [
      totalProperties,
      propertiesThisMonth,
      propertiesLastMonth,
      activeListings,
      activeListingsThisMonth,
      activeListingsLastMonth,
    ],
    [totalUsers, usersThisMonth, usersLastMonth],
  ] = await Promise.all([
    Promise.all([
      Property.countDocuments(propertyQuery),
      Property.countDocuments({
        ...propertyQuery,
        createdAt: { $gte: thisMonth.start, $lte: thisMonth.end },
      }),
      Property.countDocuments({
        ...propertyQuery,
        createdAt: { $gte: lastMonth.start, $lte: lastMonth.end },
      }),
      Property.countDocuments({ ...propertyQuery, status: "available" }),
      Property.countDocuments({
        ...propertyQuery,
        status: "available",
        createdAt: { $gte: thisMonth.start, $lte: thisMonth.end },
      }),
      Property.countDocuments({
        ...propertyQuery,
        status: "available",
        createdAt: { $gte: lastMonth.start, $lte: lastMonth.end },
      }),
    ] as const),
    isAdmin
      ? Promise.all([
        usersCol.countDocuments({ role: { $ne: Role.ADMIN } }),
        usersCol.countDocuments({
          role: { $ne: Role.ADMIN },
          createdAt: { $gte: thisMonth.start, $lte: thisMonth.end },
        }),
        usersCol.countDocuments({
          role: { $ne: Role.ADMIN },
          createdAt: { $gte: lastMonth.start, $lte: lastMonth.end },
        }),
      ])
      : Promise.resolve([0, 0, 0] as const),
  ]);

  const stats: any[] = [
    {
      label: "Total Properties",
      value: totalProperties,
      icon: "Building2",
      change: calcChange(propertiesThisMonth, propertiesLastMonth),
    },
    {
      label: "Active Listings",
      value: activeListings,
      icon: "Home",
      change: calcChange(activeListingsThisMonth, activeListingsLastMonth),
    },
    ...(isAdmin
      ? [
        {
          label: "Total Users",
          value: totalUsers,
          icon: "Users",
          change: calcChange(usersThisMonth, usersLastMonth),
        },
      ]
      : []),
    { label: "Revenue (MTD)", value: "NPR0.00", icon: "DollarSign", change: "0.00%" },
  ];

  return JSON.parse(JSON.stringify({ stats, recentProperties }));
}
