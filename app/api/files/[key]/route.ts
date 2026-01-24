import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/server/db";
import { getServerSession } from "@/lib/server/getSession";
import Files from "@/lib/models/Files";
import {
  unauthorized,
  internalServerError,
  notFound,
  forbidden,
} from "@/lib/error";
import { getSignedUrlForDownload, deleteFile } from "@/lib/server/r2-client";
import { canManageResource, Permission, Role } from "@/lib/rbac";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  try {
    await getDb();

    const session = await getServerSession();
    if (!session?.user?.id) return unauthorized();
    const role = session.user.role as Role;

    const { key } = await params;

    const file = await Files.findOne({
      storedName: key,
      userId: session.user.id,
    });

    if (!file) {
      return notFound("file not found");
    }
    if (
      !canManageResource(
        role,
        file.userId.toString(),
        session.user.id,
        Permission.VIEW_FILES,
      )
    ) {
      return forbidden("You don't have enough permission to view this page");
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
  _: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  try {
    await getDb();
    const session = await getServerSession();
    if (!session?.user?.id) return unauthorized();
    const role = session.user.role as Role;

    const { key } = await params;

    const file = await Files.findOne({
      storedName: key,
      userId: session.user.id,
    });

    if (!file) return notFound("File not found");

    if (
      !canManageResource(
        role,
        file.userId.toString(),
        session.user.id,
        Permission.MANAGE_FILES,
      )
    )
      return forbidden("You don't have enough permission to delete the files");

    await deleteFile(key);

    await Files.deleteOne({ storedName: key });

    return NextResponse.json({ message: "File deleted" });
  } catch (error) {
    return internalServerError();
  }
}
