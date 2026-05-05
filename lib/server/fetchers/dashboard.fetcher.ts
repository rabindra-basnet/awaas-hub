import mongoose from "mongoose";
import { Property } from "@/lib/models/Property";
import { Appointment } from "@/lib/models/Appointment";
import { Favorite } from "@/lib/models/Favorite";
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
  const isSeller = role === Role.SELLER;
  const isBuyer = role === Role.BUYER;

  const now = new Date();
  const thisMonth = monthRange(now.getFullYear(), now.getMonth());
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = monthRange(
    lastMonthDate.getFullYear(),
    lastMonthDate.getMonth(),
  );

  const propertyQuery = isSeller ? { sellerId: new mongoose.Types.ObjectId(userId) } : {};
  const propertyQueryPlain = isSeller ? { sellerId: userId } : {};

  const verifiedPropertyIds = await Property.find({ verificationStatus: "verified" })
    .select("_id")
    .lean()
    .then((props) => props.map((p) => p._id));

  // Recent properties with signed image URLs
  const recentPropertiesRaw = await Property.find({ ...propertyQueryPlain, verificationStatus: "verified" })
    .sort({ createdAt: -1 })
    .limit(5)
    .select("title location price views messagesCount status verificationStatus")
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

  // Core counts + month-over-month for trend badges
  const [
    [
      totalProperties,
      propertiesThisMonth,
      propertiesLastMonth,
      activeListings,
      activeListingsThisMonth,
      activeListingsLastMonth,
      soldCount,
      soldThisMonth,
      soldLastMonth,
    ],
    [totalUsers, usersThisMonth, usersLastMonth],
    pendingVerificationCount,
    favoritesCount,
    propertiesByStatus,
    todaysAppointments,
  ] = await Promise.all([
    Promise.all([
      Property.countDocuments(propertyQueryPlain),
      Property.countDocuments({ ...propertyQueryPlain, createdAt: { $gte: thisMonth.start, $lte: thisMonth.end } }),
      Property.countDocuments({ ...propertyQueryPlain, createdAt: { $gte: lastMonth.start, $lte: lastMonth.end } }),
      Property.countDocuments({ ...propertyQueryPlain, status: "available" }),
      Property.countDocuments({ ...propertyQueryPlain, status: "available", createdAt: { $gte: thisMonth.start, $lte: thisMonth.end } }),
      Property.countDocuments({ ...propertyQueryPlain, status: "available", createdAt: { $gte: lastMonth.start, $lte: lastMonth.end } }),
      Property.countDocuments({ ...propertyQueryPlain, status: "sold" }),
      Property.countDocuments({ ...propertyQueryPlain, status: "sold", createdAt: { $gte: thisMonth.start, $lte: thisMonth.end } }),
      Property.countDocuments({ ...propertyQueryPlain, status: "sold", createdAt: { $gte: lastMonth.start, $lte: lastMonth.end } }),
    ] as const),
    isAdmin
      ? Promise.all([
          usersCol.countDocuments({ role: { $ne: Role.ADMIN } }),
          usersCol.countDocuments({ role: { $ne: Role.ADMIN }, createdAt: { $gte: thisMonth.start, $lte: thisMonth.end } }),
          usersCol.countDocuments({ role: { $ne: Role.ADMIN }, createdAt: { $gte: lastMonth.start, $lte: lastMonth.end } }),
        ])
      : Promise.resolve([0, 0, 0] as const),
    isAdmin
      ? Property.countDocuments({ verificationStatus: "pending" })
      : Promise.resolve(0),
    isBuyer
      ? Favorite.countDocuments({ userId })
      : Promise.resolve(0),
    Property.aggregate([
      ...(isSeller ? [{ $match: { sellerId: new mongoose.Types.ObjectId(userId) } }] : []),
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    isAdmin
      ? Appointment.find({ propertyId: { $in: verifiedPropertyIds } }).sort({ createdAt: -1 }).limit(4).lean()
      : (isSeller || isBuyer)
        ? Appointment.find({ participants: userId, propertyId: { $in: verifiedPropertyIds } }).sort({ createdAt: -1 }).limit(4).lean()
        : Promise.resolve([]),
  ]);

  // Build role-specific stat cards
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
          {
            label: "Pending Review",
            value: pendingVerificationCount,
            icon: "Clock",
            change: "0%",
          },
        ]
      : isSeller
        ? [
            {
              label: "Sold Properties",
              value: soldCount,
              icon: "TrendingUp",
              change: calcChange(soldThisMonth, soldLastMonth),
            },
            { label: "Revenue (MTD)", value: "NPR 0", icon: "DollarSign", change: "0%" },
          ]
        : [
            {
              label: "Saved Properties",
              value: favoritesCount,
              icon: "Heart",
              change: "0%",
            },
            { label: "Revenue (MTD)", value: "NPR 0", icon: "DollarSign", change: "0%" },
          ]),
  ];

  return JSON.parse(
    JSON.stringify({
      stats,
      recentProperties,
      todaysSchedule: todaysAppointments,
      propertiesByStatus,
      soldCount,
      bookedCount: await Property.countDocuments({ ...propertyQueryPlain, status: "booked" }),
      pendingVerificationCount,
      favoritesCount,
      role,
    }),
  );
}
