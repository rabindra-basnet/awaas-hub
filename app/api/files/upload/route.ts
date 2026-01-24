import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/server/getSession";
import { unauthorized, internalServerError, notFound } from "@/lib/error";
import { getDb } from "@/lib/server/db";
import Files from "@/lib/models/Files";
import { uploadFile } from "@/lib/server/r2-client"; // your existing function
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    await getDb();
    const session = await getServerSession();
    if (!session?.user?.id) return unauthorized();

    const userId = session.user.id;
    const formData = await req.formData();

    const file = formData.get("file") as File;
    const isPrivate = formData.get("isPrivate") === "true";
    const propertyId = (formData.get("propertyId") as string) || undefined;

    if (!file) return notFound("No File found");

    // Unique name
    let uniqueName = file.name;
    const exists = await Files.exists({ storedName: uniqueName });
    if (exists) {
      const ext = file.name.includes(".")
        ? `.${file.name.split(".").pop()}`
        : "";
      const base = file.name.replace(ext, "");
      const rand = crypto.randomBytes(4).toString("hex");
      uniqueName = `${base}${rand}${ext}`;
    }
    const fileMetadata = {
      userId: userId,
      lastModified: file.lastModified.toString(),
      isPrivate: isPrivate ? "true" : "false",
    };
    // Buffer from file
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to R2
    const d = await uploadFile(buffer, uniqueName, fileMetadata);

    console.log("after upload:", d);

    // Save to DB
    const doc = await Files.create({
      userId,
      propertyId,
      filename: file.name,
      storedName: uniqueName,
      isPrivate,
      mimetype: file.type,
      size: file.size,
    });

    return NextResponse.json({
      success: true,
      file: {
        _id: doc._id,
        filename: file.name,
        storedName: uniqueName,
        isPrivate,
        mimetype: file.type,
        size: file.size,
      },
    });
  } catch (err: any) {
    console.error(err);
    return internalServerError(err.message);
  }
}
