import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/server/getSession";
import { Favorite } from "@/lib/models/Favorite";
import { Property } from "@/lib/models/Property"; // import your Property model
import { getDb } from "@/lib/server/db";
import { forbidden, internalServerError, unauthorized } from "@/lib/error";
import { hasAnyPermission, Permission, Role } from "@/lib/rbac";

export async function GET(_: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) return unauthorized();
    const role = session.user.role as Role;

    if (
      !hasAnyPermission(role, [
        Permission.VIEW_FAVORITES,
        Permission.MANAGE_FAVORITES,
      ])
    )
      return forbidden("You do not have access to view favorites");

    await getDb();

    // 1️⃣ Get the favorite records
    let favorites;
    if (role === Role.ADMIN) {
      favorites = await Favorite.find({}).lean();
    } else {
      favorites = await Favorite.find({ userId: session.user.id }).lean();
    }

    // 2️⃣ Fetch the property details for these favorites
    const propertyIds = favorites.map(fav => fav.propertyId);
    const properties = await Property.find({ _id: { $in: propertyIds } }).lean();

    return NextResponse.json(properties);
  } catch (err) {
    console.error(err);
    return internalServerError("Failed to fetch properties");
  }
}
