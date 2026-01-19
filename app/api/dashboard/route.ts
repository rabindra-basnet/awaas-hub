import { NextResponse } from "next/server";
import dashboardData from "@/data/dashboard.json";
import { requirePermission, Permission, Role } from "@/lib/rbac";
import { getServerSession } from "@/lib/server/getSession";
import { Property } from "@/lib/models/Property";
import { Appointment } from "@/lib/models/Appointment";
import { unauthorized } from "@/lib/error";

// export async function GET() {
//   return NextResponse.json(dashboardData);
// }
export async function GET() {
  const session = await getServerSession();
  if (!session) return unauthorized();

  requirePermission(session.user.role as Role, Permission.VIEW_DASHBOARD);

  const userId = session.user.id;
  const role = session.user.role;

  const propertyFilter = role === Role.SELLER ? { sellerId: userId } : {};

  const [
    totalProperties,
    activeListings,
    recentProperties,
    todaysAppointments,
  ] = await Promise.all([
    Property.countDocuments(propertyFilter),
    Property.countDocuments({ ...propertyFilter, status: "available" }),
    Property.find(propertyFilter)
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title location price views messagesCount images")
      .lean(),
    Appointment.find({
      participants: userId,
      date: {
        $gte: new Date().setHours(0, 0, 0, 0),
        $lte: new Date().setHours(23, 59, 59, 999),
      },
    })
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
    recentProperties,
    todaysSchedule: todaysAppointments,
  });
}
