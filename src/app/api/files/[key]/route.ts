import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/features/auth/server/session";
import { connectToDatabase } from "@/shared/lib/db";
import { File } from "@/features/files/models/file.model";
import { getSignedDownloadUrl, deleteFile } from "@/features/files/server/r2";
import { forbidden, notFound, unauthorized } from "@/shared/lib/error";
import { Role } from "@/features/auth/rbac/access";

type Params = { params: Promise<{ key: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { key } = await params;
  const session = await getServerSession();
  if (!session) return unauthorized();

  await connectToDatabase();
  const file = await File.findOne({ storedName: key, isDeleted: false }).lean();
  if (!file) return notFound();

  const isAdmin = session.user.role === Role.ADMIN;
  const isOwner = file.userId.toString() === session.user.id;
  if (!isAdmin && !isOwner && file.isPrivate) return forbidden();

  const url = await getSignedDownloadUrl(key);
  return NextResponse.json({
    _id: file._id.toString(),
    filename: file.filename,
    mimetype: file.mimetype,
    size: file.size,
    url,
    createdAt: file.createdAt.toISOString(),
  });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { key } = await params;
  const session = await getServerSession();
  if (!session) return unauthorized();

  await connectToDatabase();
  const file = await File.findOne({ storedName: key, isDeleted: false }).lean();
  if (!file) return notFound();

  const isAdmin = session.user.role === Role.ADMIN;
  const isOwner = file.userId.toString() === session.user.id;
  if (!isAdmin && !isOwner) return forbidden();

  await deleteFile(key).catch(() => {});
  await File.findByIdAndUpdate(file._id, { isDeleted: true, deletedAt: new Date() });

  return NextResponse.json({ success: true });
}
