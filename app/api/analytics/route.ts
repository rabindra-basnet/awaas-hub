import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/server/getSession";
import { Role } from "@/lib/rbac";
import { Property } from "@/lib/models/Property";
import { Appointment } from "@/lib/models/Appointment";
import { Favorite } from "@/lib/models/Favorite";
import { unauthorized, forbidden, internalServerError } from "@/lib/error";
import { getDb } from "@/lib/server/db";

export async function GET() {
  try {
    // 1️⃣ Get session
    const session = await getServerSession();
    if (!session) return unauthorized();

    // 2️⃣ Only allow admin
    if (session.user.role !== Role.ADMIN) return forbidden();

    const db = await getDb();

    // 3️⃣ Fetch stats in parallel
    const [
      totalUsers,
      totalProperties,
      availableProperties,
      totalAppointments,
      totalFavorites,
    ] = await Promise.all([
      db.collection("users").countDocuments(),
      Property.countDocuments(),
      Property.countDocuments({ status: "available" }),
      Appointment.countDocuments(),
      Favorite.countDocuments(),
    ]);

    // 4️⃣ Optional: fetch breakdown for charts
    const appointmentsByStatus = await Appointment.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const propertiesByStatus = await Property.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalProperties,
        availableProperties,
        totalAppointments,
        totalFavorites,
      },
      charts: {
        appointmentsByStatus, // e.g., [{_id: "scheduled", count: 12}, ...]
        propertiesByStatus, // e.g., [{_id: "available", count: 8}, ...]
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return internalServerError("Failed to fetch analytics");
  }
}
