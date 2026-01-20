import { NextResponse } from "next/server";
import { getDb } from "@/lib/server/db";
import { getServerSession } from "@/lib/server/getSession";
import Files from "@/lib/models/Files";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    await getDb();

    const url = new URL(req.url);
    const isPrivate = url.searchParams.get("isPrivate") === "true";
    const propertyId = url.searchParams.get("propertyId");

    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;

    // Parse FormData using native Web API
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file)
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    // Validate file exists and has content
    if (file.size === 0)
      return NextResponse.json({ error: "File is empty" }, { status: 400 });

    // Create upload directory
    const uploadDir = path.join(
      process.cwd(),
      "storage",
      isPrivate ? "private" : "public",
    );
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Original name parts
    // Try original name first
    let uniqueName = file.name;
    let filePath = path.join(uploadDir, uniqueName);

    const exists = await Files.exists({ storedName: uniqueName });

    if (exists) {
      const ext = path.extname(file.name);
      const baseName = path.basename(file.name, ext);

      // Use crypto for random digits
      const randomArray = new Uint8Array(4);
      crypto.getRandomValues(randomArray);
      const randomDigits = Array.from(randomArray)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .slice(0, 8);

      uniqueName = `${baseName}${randomDigits}${ext}`;
      filePath = path.join(uploadDir, uniqueName);
    }

    // Write file to disk
    fs.writeFileSync(filePath, buffer);

    // Save metadata to MongoDB
    const doc = await Files.create({
      userId,
      propertyId: propertyId || undefined,
      filename: file.name,
      storedName: uniqueName,
      isPrivate,
      mimetype: file.type,
      size: file.size,
    });

    const urlPath = isPrivate
      ? `/private/files/${doc.storedName}`
      : `/files/${doc.storedName}`;

    return NextResponse.json({
      ...doc.toObject(),
      url: urlPath,
      message: "File uploaded successfully",
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 },
    );
  }
}

export async function GET() {
  await getDb();

  const session = await getServerSession();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const files = await Files.find({ userId }).sort({ createdAt: -1 });

  return NextResponse.json(
    files.map((file) => ({
      id: file._id,
      filename: file.filename,
      storedName: file.storedName,
      isPrivate: file.isPrivate,
      mimetype: file.mimetype,
      size: file.size,
      url: file.isPrivate
        ? `/private/files/${file.storedName}`
        : `/files/${file.storedName}`,
      createdAt: file.createdAt,
    })),
  );
}
