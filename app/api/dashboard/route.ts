import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/server/getSession";
import { Property } from "@/lib/models/Property";
import { Appointment } from "@/lib/models/Appointment";
import Files from "@/lib/models/Files";
import { getSignedUrlForDownload } from "@/lib/server/r2-client";
import { Role, Permission, requirePermission } from "@/lib/rbac";
import { unauthorized } from "@/lib/error";

export async function GET() {
  const session = await getServerSession();
  if (!session) return unauthorized();

  requirePermission(session.user.role as Role, Permission.VIEW_DASHBOARD);

  const userId = session.user.id;
  const role = session.user.role;

  // 🔹 Today date range
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  // 🔹 Property query
  const propertyQuery = role === Role.SELLER ? { sellerId: userId } : {};

  // 🔹 Fetch seller property IDs for appointments
  const sellerPropertyIds =
    role === Role.SELLER
      ? await Property.find({ sellerId: userId }).select("_id").lean().then((p) => p.map((p) => p._id.toString()))
      : [];

  // 🔹 Build appointment query
  let appointmentQuery: any = {};
  if (role === Role.SELLER) {
    appointmentQuery.$or = [
      { createdBy: userId },
      { propertyId: { $in: sellerPropertyIds } },
    ];
    appointmentQuery.date = { $gte: startOfToday, $lte: endOfToday };
  } else if (role === Role.BUYER) {
    appointmentQuery.createdBy = userId;
    appointmentQuery.date = { $gte: startOfToday, $lte: endOfToday };
  }

  // 🔹 Fetch recent properties
  const recentPropertiesRaw = await Property.find(propertyQuery)
    .sort({ createdAt: -1 })
    .limit(4)
    .select("title location price views messagesCount")
    .lean();

  // 🔹 Fetch first image for each property
  const recentProperties = await Promise.all(
    recentPropertiesRaw.map(async (prop) => {
      let imageUrl: string | null = null;

      if (prop._id) {
        const file = await Files.findOne({
          propertyId: prop._id.toString(), // Use string match to avoid ObjectId mismatch
          isDeleted: false,
        }).sort({ createdAt: 1 });

        if (file?.storedName) {
          imageUrl = await getSignedUrlForDownload(file.storedName);
        }
      }

      return { ...prop, image: imageUrl || null };
    })
  );

  // 🔹 Stats & appointments
  const [totalProperties, activeListings, todaysAppointments] = await Promise.all([
    Property.countDocuments(propertyQuery),
    Property.countDocuments({ ...propertyQuery, status: "available" }),
    Appointment.find(appointmentQuery).sort({ date: 1 }).limit(4).lean(),
  ]);

  return NextResponse.json({
    stats: [
      { label: "Total Properties", value: totalProperties, icon: "Building2", change: "+15.5%" },
      { label: "Active Listings", value: activeListings, icon: "Home", change: "-10.2%" },
      { label: "Total Clients", value: "3,429", change: "+23.1%", icon: "Users" },
      { label: "Revenue (MTD)", value: "$284.5K", change: "+15.3%", icon: "DollarSign" },
    ],
    recentProperties,
    todaysSchedule: todaysAppointments,
  });
}
