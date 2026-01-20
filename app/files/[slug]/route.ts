import { NextResponse } from "next/server";
import { getDb } from "@/lib/server/db";
import Files from "@/lib/models/Files";
import fs from "fs";
import path from "path";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    await getDb();

    const { slug: storedName } = await params;

    // Find file in database
    const file = await Files.findOne({
      storedName,
      isPrivate: false,
      isDeleted: false,
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Read file from disk
    const filePath = path.join(process.cwd(), "storage", "public", storedName);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "File not found on disk" },
        { status: 404 },
      );
    }

    const fileBuffer = fs.readFileSync(filePath);

    // Check if file should be displayed inline or downloaded
    const displayInline = shouldDisplayInline(file.mimetype);

    // Return file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": file.mimetype,
        "Content-Disposition": displayInline
          ? `inline; filename="${encodeURIComponent(file.filename)}"`
          : `attachment; filename="${encodeURIComponent(file.filename)}"`,
        "Content-Length": file.size.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    console.error("File retrieval error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve file" },
      { status: 500 },
    );
  }
}

// Helper function to determine if file should display in browser
function shouldDisplayInline(mimetype: string): boolean {
  const inlineTypes = [
    // Images
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "image/bmp",

    // Documents
    "application/pdf",

    // Text
    "text/plain",
    "text/html",
    "text/css",
    "text/javascript",
    "text/csv",

    // Video
    "video/mp4",
    "video/webm",
    "video/ogg",

    // Audio
    "audio/mpeg",
    "audio/ogg",
    "audio/wav",
    "audio/webm",
  ];

  return inlineTypes.includes(mimetype.toLowerCase());
}
