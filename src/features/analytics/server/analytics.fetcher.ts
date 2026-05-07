import { connectToDatabase } from "@/shared/lib/db";
import { Property } from "@/features/properties/models/property.model";
import { Appointment } from "@/features/appointments/models/appointment.model";
import { Favorite } from "@/features/favorites/models/favorite.model";

export async function fetchAnalytics() {
  await connectToDatabase();

  const [
    totalProperties,
    availableProperties,
    bookedProperties,
    soldProperties,
    pendingProperties,
    totalAppointments,
    totalFavorites,
    propertiesByStatus,
    monthlyData,
  ] = await Promise.all([
    Property.countDocuments(),
    Property.countDocuments({ status: "available" }),
    Property.countDocuments({ status: "booked" }),
    Property.countDocuments({ status: "sold" }),
    Property.countDocuments({ verificationStatus: "pending" }),
    Appointment.countDocuments(),
    Favorite.countDocuments(),
    Property.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Property.aggregate([
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 },
    ]),
  ]);

  return {
    totalProperties,
    availableProperties,
    bookedProperties,
    soldProperties,
    pendingProperties,
    totalAppointments,
    totalFavorites,
    propertiesByStatus: propertiesByStatus.map((p: any) => ({ status: p._id, count: p.count })),
    monthlyListings: monthlyData.map((m: any) => ({
      year: m._id.year,
      month: m._id.month,
      count: m.count,
    })),
  };
}
