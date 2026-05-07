import { connectToDatabase } from "@/shared/lib/db";
import { Property } from "@/features/properties/models/property.model";
import { File } from "@/features/files/models/file.model";
import { Favorite } from "@/features/favorites/models/favorite.model";
import { getSignedDownloadUrl } from "@/features/files/server/r2";
import { Role } from "@/features/auth/rbac/access";

const PAGE_LIMIT = 12;

export type PropertyWithMeta = {
  _id: string;
  title: string;
  price: number;
  location: string;
  status: string;
  verificationStatus: string;
  category: string;
  area?: string;
  bedrooms?: number;
  bathrooms?: number;
  negotiable: boolean;
  sellerId: string;
  createdAt: string;
  imageUrl: string | null;
  isFavorite: boolean;
};

export async function fetchProperties({
  userId,
  role,
  cursor,
  limit = PAGE_LIMIT,
  category,
  status,
  search,
}: {
  userId?: string;
  role?: Role;
  cursor?: string;
  limit?: number;
  category?: string;
  status?: string;
  search?: string;
}): Promise<{ items: PropertyWithMeta[]; nextCursor: string | null }> {
  await connectToDatabase();

  const baseQuery: Record<string, any> =
    role === Role.ADMIN
      ? {}
      : userId
        ? { $or: [{ verificationStatus: "verified" }, { sellerId: userId }] }
        : { verificationStatus: "verified" };

  if (category) baseQuery.category = category;
  if (status) baseQuery.status = status;
  if (cursor) baseQuery._id = { $lt: cursor };
  if (search) baseQuery.title = { $regex: search, $options: "i" };

  const properties = await Property.find(baseQuery)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .lean();

  const hasMore = properties.length > limit;
  const items = hasMore ? properties.slice(0, limit) : properties;

  const [favoriteIds] = userId
    ? await Promise.all([
        Favorite.find({ userId, propertyId: { $in: items.map((p) => p._id) } })
          .select("propertyId")
          .lean()
          .then((favs) => new Set(favs.map((f) => f.propertyId.toString()))),
      ])
    : [new Set<string>()];

  const enriched = await Promise.all(
    items.map(async (p) => {
      const file = await File.findOne({
        propertyId: p._id,
        isDeleted: false,
        mimetype: /^image\//,
      })
        .sort({ createdAt: 1 })
        .lean();

      const imageUrl = file?.storedName ? await getSignedDownloadUrl(file.storedName) : null;

      return {
        _id: p._id.toString(),
        title: p.title,
        price: p.price,
        location: p.location,
        status: p.status,
        verificationStatus: p.verificationStatus,
        category: p.category,
        area: p.area,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        negotiable: p.negotiable,
        sellerId: p.sellerId.toString(),
        createdAt: p.createdAt.toISOString(),
        imageUrl,
        isFavorite: favoriteIds.has(p._id.toString()),
      } satisfies PropertyWithMeta;
    }),
  );

  return {
    items: enriched,
    nextCursor: hasMore ? items[items.length - 1]._id.toString() : null,
  };
}

export async function fetchPropertyById(id: string, userId?: string, role?: string) {
  await connectToDatabase();

  const property = await Property.findById(id).lean();
  if (!property) return null;

  const isOwner = property.sellerId.toString() === userId;
  const isAdmin = role === Role.ADMIN;

  if (!isAdmin && !isOwner && property.verificationStatus !== "verified") return null;

  const files = await File.find({ propertyId: id, isDeleted: false, mimetype: /^image\// })
    .sort({ createdAt: 1 })
    .lean();

  const images = await Promise.all(
    files.map(async (f) => ({
      _id: f._id.toString(),
      url: await getSignedDownloadUrl(f.storedName),
      filename: f.filename,
    })),
  );

  const isFavorite = userId
    ? !!(await Favorite.findOne({ userId, propertyId: id }).lean())
    : false;

  return {
    ...property,
    _id: property._id.toString(),
    sellerId: property.sellerId.toString(),
    createdAt: property.createdAt.toISOString(),
    updatedAt: property.updatedAt.toISOString(),
    images,
    isFavorite,
  };
}
