import { NextResponse } from "next/server";
import { getServerSession } from "@/features/auth/server/session";
import { connectToDatabase } from "@/shared/lib/db";
import { File } from "@/features/files/models/file.model";
import { getSignedDownloadUrl } from "@/features/files/server/r2";
import { unauthorized } from "@/shared/lib/error";

export async function GET() {
  const session = await getServerSession();
  if (!session) return unauthorized();

  await connectToDatabase();
  const files = await File.find({ userId: session.user.id, isDeleted: false })
    .sort({ createdAt: -1 })
    .lean();

  const enriched = await Promise.all(
    files.map(async (f) => ({
      _id: f._id.toString(),
      filename: f.filename,
      storedName: f.storedName,
      mimetype: f.mimetype,
      size: f.size,
      isPrivate: f.isPrivate,
      propertyId: f.propertyId?.toString() ?? null,
      url: await getSignedDownloadUrl(f.storedName),
      createdAt: f.createdAt.toISOString(),
    })),
  );

  return NextResponse.json({ files: enriched });
}
