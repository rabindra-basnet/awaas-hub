import { connectToDatabase } from "@/shared/lib/db";
import { Property } from "@/features/properties/models/property.model";
import { Favorite } from "@/features/favorites/models/favorite.model";
import { Role } from "@/features/auth/rbac/access";

export async function fetchDashboardStats(userId: string, role: Role) {
  await connectToDatabase();

  const isAdmin = role === Role.ADMIN;

  const [
    totalProperties,
    myProperties,
    pendingVerification,
    availableCount,
    bookedCount,
    soldCount,
    myFavorites,
    recentProperties,
  ] = await Promise.all([
    isAdmin ? Property.countDocuments() : null,
    Property.countDocuments({ sellerId: userId }),
    isAdmin ? Property.countDocuments({ verificationStatus: "pending" }) : null,
    Property.countDocuments(
      isAdmin ? { status: "available" } : { sellerId: userId, status: "available" },
    ),
    Property.countDocuments(
      isAdmin ? { status: "booked" } : { sellerId: userId, status: "booked" },
    ),
    Property.countDocuments(
      isAdmin ? { status: "sold" } : { sellerId: userId, status: "sold" },
    ),
    Favorite.countDocuments({ userId }),
    Property.find({ sellerId: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title price location status verificationStatus createdAt category")
      .lean(),
  ]);

  return {
    isAdmin,
    stats: {
      totalProperties: isAdmin ? totalProperties : myProperties,
      myProperties,
      pendingVerification,
      available: availableCount,
      booked: bookedCount,
      sold: soldCount,
      favorites: myFavorites,
    },
    recentProperties: recentProperties.map((p) => ({
      _id: p._id.toString(),
      title: p.title,
      price: p.price,
      location: p.location,
      status: p.status,
      verificationStatus: p.verificationStatus,
      category: p.category,
      createdAt: p.createdAt.toISOString(),
    })),
  };
}
