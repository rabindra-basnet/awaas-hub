import { Property } from "@/lib/models/Property";
import Files from "@/lib/models/Files";
import { getSignedUrlForDownload } from "@/lib/server/r2-client";
import { Role } from "@/lib/rbac";
import { getDb } from "@/lib/server/db";
import type { Session } from "@/lib/server/auth";

export async function fetchPropertiesPage(
  session: Session | null,
  page: number = 1,
  limit: number = 12,
): Promise<{ items: any[]; page: number; hasNextPage: boolean; total: number }> {
  await getDb();
  const role = (session?.user?.role as Role) ?? Role.GUEST;
  const query: Record<string, any> =
    role === Role.ADMIN ? {} : { verificationStatus: "verified" };

  const skip = (page - 1) * limit;
  const [properties, total] = await Promise.all([
    Property.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Property.countDocuments(query),
  ]);

  if (!properties.length) return { items: [], page, hasNextPage: false, total };

  const propertyIds = properties.map((p) => p._id);
  const files = await Files.find({ propertyId: { $in: propertyIds }, isDeleted: false })
    .sort({ createdAt: 1 })
    .lean();

  const firstFileByProperty = new Map<string, any>();
  for (const file of files) {
    const pid = file.propertyId?.toString();
    if (pid && !firstFileByProperty.has(pid)) firstFileByProperty.set(pid, file);
  }

  const items = await Promise.all(
    (properties as any[]).map(async (property: any) => {
      const pid = property._id.toString();
      const firstFile = firstFileByProperty.get(pid);
      const base = { ...property, verificationStatus: property.verificationStatus ?? "pending", isFavorite: false };
      if (!firstFile?.storedName) return JSON.parse(JSON.stringify({ ...base, images: [] }));
      const imageUrl = await getSignedUrlForDownload(firstFile.storedName);
      return JSON.parse(JSON.stringify({ ...base, images: [imageUrl] }));
    }),
  );

  return { items, page, hasNextPage: skip + properties.length < total, total };
}

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
