import { NextResponse } from "next/server";
import { Property } from "@/lib/models/Property";
import Files from "@/lib/models/Files";
import { getSignedUrlForDownload } from "@/lib/server/r2-client";
import { getDb } from "@/lib/server/db";
import { internalServerError } from "@/lib/error";

/**
 * GET /api/properties/featured
 * Public endpoint for home page featured properties.
 * Returns latest 3 properties with first indexed image from R2 (if available).
 */
export async function GET() {
  try {
    await getDb();

    const properties = await Property.find({ verificationStatus: "verified" })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    if (!properties.length) {
      return NextResponse.json([]);
    }

    const propertyIds = properties.map((property: any) => property._id);

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

    const featuredProperties = await Promise.all(
      properties.map(async (property: any) => {
        const firstFile = firstFileByProperty.get(property._id.toString());

        if (!firstFile?.storedName) {
          return { ...property, images: [] };
        }

        const imageUrl = await getSignedUrlForDownload(firstFile.storedName);

        return { ...property, images: [imageUrl] };
      }),
    );

    return NextResponse.json(featuredProperties);
  } catch (error) {
    console.error(error);
    return internalServerError();
  }
}
