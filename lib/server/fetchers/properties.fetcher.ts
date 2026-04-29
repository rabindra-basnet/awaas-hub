import { Property } from "@/lib/models/Property";
import Files from "@/lib/models/Files";
import { getSignedUrlForDownload } from "@/lib/server/r2-client";
import { Role } from "@/lib/rbac";
import { getDb } from "@/lib/server/db";
import type { Session } from "@/lib/server/auth";

export async function fetchProperties(session: Session | null): Promise<any[]> {
  await getDb();
  const role = (session?.user?.role as Role) ?? Role.GUEST;

  const query: Record<string, any> =
    role === Role.ADMIN ? {} : { verificationStatus: "verified" };

  const properties = await Property.find(query).sort({ createdAt: -1 }).lean();

  if (!properties.length) return [];

  const propertyIds = properties.map((p) => p._id);
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
      const base = {
        ...property,
        verificationStatus: property.verificationStatus ?? "pending",
        isFavorite: false,
      };
      if (!firstFile?.storedName) return JSON.parse(
        JSON.stringify({ ...base, images: [] }));
      const imageUrl = await getSignedUrlForDownload(firstFile.storedName);
      return JSON.parse(JSON.stringify({ ...base, images: [imageUrl] }));
    }),
  );
}
