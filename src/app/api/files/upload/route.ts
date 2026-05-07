import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/features/auth/server/session";
import { connectToDatabase } from "@/shared/lib/db";
import { File } from "@/features/files/models/file.model";
import { getSignedUploadUrl } from "@/features/files/server/r2";
import { badRequest, unauthorized } from "@/shared/lib/error";
import { z } from "zod";
import { nanoid } from "nanoid";

const schema = z.object({
  filename:   z.string().min(1),
  mimetype:   z.string().min(1),
  size:       z.number().min(1),
  propertyId: z.string().optional(),
  isPrivate:  z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return unauthorized();

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON");

  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.errors[0]?.message ?? "Validation error");

  const { filename, mimetype, size, propertyId, isPrivate } = parsed.data;
  const ext = filename.split(".").pop() || "bin";
  const storedName = `${nanoid(24)}.${ext}`;

  await connectToDatabase();

  if (propertyId) {
    const existing = await File.countDocuments({ propertyId, isDeleted: false, mimetype: /^image\// });
    if (mimetype.startsWith("image/") && existing >= 10)
      return badRequest("Maximum 10 images per property");
  }

  const uploadUrl = await getSignedUploadUrl(storedName, mimetype);

  await File.create({
    userId: session.user.id,
    propertyId: propertyId || null,
    filename,
    storedName,
    mimetype,
    size,
    isPrivate,
  });

  return NextResponse.json({ uploadUrl, storedName }, { status: 201 });
}
