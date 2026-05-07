import { getDb } from "@/shared/lib/db";
import { Property } from "@/features/properties/models/property.model";
import { File } from "@/features/files/models/file.model";
import { getSignedDownloadUrl } from "@/features/files/server/r2";

export type FeaturedProperty = {
  _id: string;
  title: string;
  price: number;
  location: string;
  category: string;
  status: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: string;
  imageUrl: string | null;
};

export async function fetchFeaturedProperties(): Promise<FeaturedProperty[]> {
  await getDb();

  const properties = await Property.find({ verificationStatus: "verified", status: "available" })
    .sort({ createdAt: -1 })
    .limit(6)
    .select("title price location category status bedrooms bathrooms area")
    .lean();

  return Promise.all(
    properties.map(async (p) => {
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
        category: p.category,
        status: p.status,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        area: p.area,
        imageUrl,
      };
    }),
  );
}
