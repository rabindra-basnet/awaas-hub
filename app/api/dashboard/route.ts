// import { NextResponse } from "next/server";
import { Types } from "mongoose";

import { requirePermission, Permission, Role } from "@/lib/rbac";
import { getServerSession } from "@/lib/server/getSession";
import { Property } from "@/lib/models/Property";
import { Appointment } from "@/lib/models/Appointment";
import { unauthorized } from "@/lib/error";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession();
  if (!session) return unauthorized();

  requirePermission(session.user.role as Role, Permission.VIEW_DASHBOARD);

  const userId = session.user.id;
  const role = session.user.role;
  const userObjectId = new Types.ObjectId(userId);

  // 🔹 Today date range
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  // 🔹 Build property query for stats/recent properties
  const propertyQuery = role === Role.SELLER ? { sellerId: userObjectId } : {};

  // 🔹 Fetch property IDs for seller's own properties (for appointments)
  const sellerPropertyIds =
    role === Role.SELLER
      ? await Property.find({ sellerId: userObjectId })
          .select("_id")
          .lean()
          .then((props) => props.map((p) => p._id))
      : [];

  // 🔹 Build appointments query dynamically based on role
  let appointmentQuery: any = {};

  if (role === Role.SELLER) {
    // Sellers see:
    // 1️⃣ Appointments they created (any property)
    // 2️⃣ Appointments for their properties (any creator)
    appointmentQuery.$or = [
      { createdBy: userObjectId },
      { propertyId: { $in: sellerPropertyIds } },
    ];
    appointmentQuery.date = { $gte: startOfToday, $lte: endOfToday };
  } else if (role === Role.BUYER) {
    // Buyers see only their own appointments
    appointmentQuery.createdBy = userObjectId;
    appointmentQuery.date = { $gte: startOfToday, $lte: endOfToday };
  } else if (role === Role.ADMIN) {
    // Admins see all appointments
    // Optional: filter by today if needed
    // appointmentQuery.date = { $gte: startOfToday, $lte: endOfToday };
  }

  // 🔹 Fetch data in parallel
  const [
    totalProperties,
    activeListings,
    recentProperties,
    todaysAppointments,
  ] = await Promise.all([
    Property.countDocuments(propertyQuery),
    Property.countDocuments({ ...propertyQuery, status: "available" }),
    Property.find(propertyQuery)
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title location price views messagesCount images")
      .lean(),
    Appointment.find(appointmentQuery)
      .sort({ date: 1 })
      .lean(),
  ]);

  return NextResponse.json({
    stats: [
      {
        label: "Total Properties",
        value: totalProperties,
        icon: "Building2",
        change: "+15.5%",
      },
      {
        label: "Active Listings",
        value: activeListings,
        icon: "Home",
        change: "-10.2%",
      },
      {
        label: "Total Clients",
        value: "3,429",
        change: "+23.1%",
        icon: "Users",
      },
      {
        label: "Revenue (MTD)",
        value: "$284.5K",
        change: "+15.3%",
        icon: "DollarSign",
      },
    ],
    recentProperties,           // properties visible to the user
    todaysSchedule: todaysAppointments, // appointments filtered based on role
  });
}
