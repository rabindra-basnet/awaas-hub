import { Favorite } from "@/lib/models/Favorite";
import { Property } from "@/lib/models/Property";
import Files from "@/lib/models/Files";
import { getSignedUrlForDownload } from "@/lib/server/r2-client";
import { hasAnyPermission, Permission, Role } from "@/lib/rbac";
import { getDb } from "@/lib/server/db";
import type { Session } from "@/lib/server/auth";

export async function fetchFavorites(session: Session): Promise<any[]> {
  await getDb();

  const role = session.user.role as Role;
  if (
    !hasAnyPermission(role, [
      Permission.VIEW_FAVORITES,
      Permission.MANAGE_FAVORITES,
    ])
  ) {
    return [];
  }

  const favorites = await Favorite.find({ userId: session.user.id }).lean();

  if (!favorites.length) return [];

  const propertyIds = favorites.map((fav) => fav.propertyId);
  const properties = await Property.find({ _id: { $in: propertyIds } }).lean();

  const files = await Files.find({
    propertyId: { $in: propertyIds },
    isDeleted: false,
  })
    .sort({ createdAt: 1 })
    .lean();

  const firstFileByProperty = new Map<string, any>();
  for (const file of files) {
    const propertyId = file.propertyId?.toString();
    if (propertyId && !firstFileByProperty.has(propertyId)) {
      firstFileByProperty.set(propertyId, file);
    }
  }

  return Promise.all(
    properties.map(async (property: any) => {
      const propertyId = property._id.toString();
      const firstFile = firstFileByProperty.get(propertyId);
      if (!firstFile?.storedName)
        return JSON.parse(JSON.stringify({ ...property, images: [] }));
      const imageUrl = await getSignedUrlForDownload(firstFile.storedName);
      return JSON.parse(JSON.stringify({ ...property, images: [imageUrl] }));
    }),
  );
}
