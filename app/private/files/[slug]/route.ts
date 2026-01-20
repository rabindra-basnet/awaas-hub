import { NextResponse } from "next/server";
import { getDb } from "@/lib/server/db";
import { getServerSession } from "@/lib/server/getSession";
import Files from "@/lib/models/Files";
import fs from "fs";
import path from "path";
import { internalServerError } from "@/lib/error";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    await getDb();

    const { slug: storedName } = await params;

    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.id) {
      const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Access Denied</title>
        <style>
          body { margin:0; height:100vh; display:flex; align-items:center; justify-content:center; font-family:sans-serif; background:#f8f9fa; color:#333; }
          .container { text-align:center; padding:2rem; max-width:400px; }
          h1 { margin:0 0 1rem; font-size:1.8rem; }
          p { margin:0; color:#666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>You don't have access to this content</h1>
          <p>Please check your permissions or contact support.</p>
        </div>
      </body>
      </html>
    `;

      return new NextResponse(html, {
        status: 403,
        headers: { "Content-Type": "text/html" },
      });
    }

    // Find file in database and verify ownership
    const file = await Files.findOne({
      storedName,
      isPrivate: true,
      isDeleted: false,
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Verify user owns the file
    if (file.userId.toString() !== session.user.id) {
      // Simple centered error page
      const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Access Denied</title>
        <style>
          body { margin:0; height:100vh; display:flex; align-items:center; justify-content:center; font-family:sans-serif; background:#f8f9fa; color:#333; }
          .container { text-align:center; padding:2rem; max-width:400px; }
          h1 { margin:0 0 1rem; font-size:1.8rem; }
          p { margin:0; color:#666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>You don't have access to this content please login to access this document</h1>
          <p>Please check your permissions or contact support.</p>
        </div>
      </body>
      </html>
    `;

      return new NextResponse(html, {
        status: 403,
        headers: { "Content-Type": "text/html" },
      });
      // return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Read file from disk
    const filePath = path.join(process.cwd(), "storage", "private", storedName);

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
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error: any) {
    // Simple centered error page
    return internalServerError("Failed to get the files");
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
