import { NextResponse } from "next/server";
import { getServerSession } from "@/features/auth/server/session";
import { connectToDatabase } from "@/shared/lib/db";
import { Favorite } from "@/features/favorites/models/favorite.model";
import { Property } from "@/features/properties/models/property.model";
import { File } from "@/features/files/models/file.model";
import { getSignedDownloadUrl } from "@/features/files/server/r2";
import { unauthorized } from "@/shared/lib/error";

export async function GET() {
  const session = await getServerSession();
  if (!session) return unauthorized();

  await connectToDatabase();
  const favs = await Favorite.find({ userId: session.user.id }).lean();
  const propertyIds = favs.map((f) => f.propertyId);

  const properties = await Property.find({ _id: { $in: propertyIds } }).lean();

  const enriched = await Promise.all(
    properties.map(async (p) => {
      const file = await File.findOne({ propertyId: p._id, isDeleted: false, mimetype: /^image\// })
        .sort({ createdAt: 1 })
        .lean();
      const imageUrl = file ? await getSignedDownloadUrl(file.storedName) : null;
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
        sellerId: p.sellerId.toString(),
        imageUrl,
        isFavorite: true,
      };
    }),
  );

  return NextResponse.json({ favorites: enriched });
}
