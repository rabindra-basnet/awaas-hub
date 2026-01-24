// app/api/favorites/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/server/getSession";
import { Favorite } from "@/lib/models/Favorite";
import { connectToDatabase } from "@/lib/server/db";
import { forbidden, internalServerError, unauthorized } from "@/lib/error";
import { hasAnyPermission, hasPermission, Permission, Role } from "@/lib/rbac";

export async function GET(_: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) return unauthorized();
    const role = session.user.role as Role;

    // Check if user has VIEW or MANAGE permission for files/favorites
    if (
      !hasAnyPermission(role, [
        Permission.VIEW_FAVORITES,
        Permission.MANAGE_FAVORITES,
      ])
    )
      return forbidden("You do not have access to view favorites");

    await connectToDatabase();
    const favorites = await Favorite.find({ userId: session.user.id }).lean();
    console.log(favorites);

    return NextResponse.json(favorites);
  } catch (err) {
    console.error(err);
    return internalServerError("Failed to fetch favorites");
  }
}
