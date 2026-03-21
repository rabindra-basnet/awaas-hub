//

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/server/getSession";
import { Favorite } from "@/lib/models/Favorite";
import { Property } from "@/lib/models/Property";
import Files from "@/lib/models/Files";
import { getDb } from "@/lib/server/db";
import { getSignedUrlForDownload } from "@/lib/server/r2-client";
import { forbidden, internalServerError, unauthorized } from "@/lib/error";
import { hasAnyPermission, Permission, Role } from "@/lib/rbac";

export async function GET(_: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) return unauthorized();

    // ✅ Block anonymous users
    if (session.user.isAnonymous) {
      return forbidden("Sign in to view favorites");
    }

    const role = session.user.role as Role;

    if (
      !hasAnyPermission(role, [
        Permission.VIEW_FAVORITES,
        Permission.MANAGE_FAVORITES,
      ])
    )
      return forbidden("You do not have access to view favorites");

    await getDb();

    const favorites =
      role === Role.ADMIN
        ? await Favorite.find({}).lean()
        : await Favorite.find({ userId: session.user.id }).lean();

    if (!favorites.length) return NextResponse.json([]);

    const propertyIds = favorites.map((fav) => fav.propertyId);

    const properties = await Property.find({
      _id: { $in: propertyIds },
    }).lean();

    // ✅ Fetch first file for each property — same pattern as main properties API
    const files = await Files.find({
      propertyId: { $in: propertyIds },
      isDeleted: false,
    })
      .sort({ createdAt: 1 })
      .lean();

    // ✅ Map only the first file per property
    const firstFileByProperty = new Map<string, any>();
    for (const file of files) {
      const propertyId = file.propertyId?.toString();
      if (propertyId && !firstFileByProperty.has(propertyId)) {
        firstFileByProperty.set(propertyId, file);
      }
    }

    // ✅ Attach signed image URL to each property
    const propertiesWithImages = await Promise.all(
      properties.map(async (property: any) => {
        const propertyId = property._id.toString();
        const firstFile = firstFileByProperty.get(propertyId);

        if (!firstFile?.storedName) {
          return { ...property, images: [] };
        }

        const imageUrl = await getSignedUrlForDownload(firstFile.storedName);
        return { ...property, images: [imageUrl] };
      }),
    );

    return NextResponse.json(propertiesWithImages);
  } catch (err) {
    console.error(err);
    return internalServerError("Failed to fetch favorites");
  }
}
