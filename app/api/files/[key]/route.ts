// app/api/files/[key]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/server/db";
import { getServerSession } from "@/lib/server/getSession";
import Files from "@/lib/models/Files";
import { unauthorized, internalServerError } from "@/lib/error";
import { getSignedUrlForDownload, deleteFile } from "@/lib/server/r2-client";

// export async function GET(
//   request: NextRequest,
//   { params }: { params: Promise<{ key: string }> },
// ) {
//   try {
//     await getDb();
//     const session = await getServerSession();
//     if (!session?.user?.id) return unauthorized();

//     const { key } = await params;

//     const file = await Files.findOne({
//       storedName: key,
//       userId: session.user.id,
//     });
//     if (!file)
//       return NextResponse.json({ error: "File not found" }, { status: 404 });

//     const signedUrl = await getSignedUrlForDownload(key);
//     return NextResponse.json({ signedUrl });
//   } catch (error) {
//     return internalServerError();
//   }
// }

// app/api/files/[key]/route.ts

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  try {
    await getDb();

    const session = await getServerSession();
    if (!session?.user?.id) return unauthorized();

    const { key } = await params;

    const file = await Files.findOne({
      storedName: key,
      userId: session.user.id,
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Get signed URL for download
    const signedUrl = await getSignedUrlForDownload(key);

    // Return full metadata + signed URL
    return NextResponse.json({
      signedUrl,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      createdAt: file.createdAt,
      propertyId: file.propertyId,
    });
  } catch (error) {
    console.error(error);
    return internalServerError();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  try {
    await getDb();
    const session = await getServerSession();
    if (!session?.user?.id) return unauthorized();

    const { key } = await params;

    const file = await Files.findOne({
      storedName: key,
      userId: session.user.id,
    });

    if (!file)
      return NextResponse.json({ error: "File not found" }, { status: 404 });

    await deleteFile(key);

    await Files.deleteOne({ storedName: key });

    return NextResponse.json({ message: "File deleted" });
  } catch (error) {
    return internalServerError();
  }
}
