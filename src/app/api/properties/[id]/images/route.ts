import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/shared/lib/db";
import { File } from "@/features/files/models/file.model";
import { getSignedDownloadUrl } from "@/features/files/server/r2";
import { notFound } from "@/shared/lib/error";
import { Property } from "@/features/properties/models/property.model";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  await connectToDatabase();

  const property = await Property.findById(id).lean();
  if (!property) return notFound();

  const files = await File.find({ propertyId: id, isDeleted: false, mimetype: /^image\// })
    .sort({ createdAt: 1 })
    .lean();

  const images = await Promise.all(
    files.map(async (f) => ({
      _id: f._id.toString(),
      url: await getSignedDownloadUrl(f.storedName),
      filename: f.filename,
      size: f.size,
    })),
  );

  return NextResponse.json({ images });
}
