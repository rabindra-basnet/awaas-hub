import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/server/getSession";
import { forbidden, internalServerError, notFound, unauthorized } from "@/lib/error";
import Files from "@/lib/models/Files";
import { getDb } from "@/lib/server/db";
import { getSignedUrlForDownload } from "@/lib/server/r2-client";
import { hasAnyPermission, hasPermission, Permission, Role } from "@/lib/rbac";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession();
        if (!session?.user) return unauthorized();

        const role = session.user.role as Role;

        if (!hasPermission(role, Permission.VIEW_PROPERTIES)) return forbidden();
        await getDb();

        const { id: propertyId } = await params;

        console.log(propertyId)

        // Find all files for this property
        const files = await Files.find({
            propertyId,
            isDeleted: false,
        }).sort({ createdAt: 1 }); // Sort by upload order

        console.log(files)

        if (!files || files.length === 0) {
            return notFound("No files found");
        }

        // Generate presigned URLs for all files
        const imagesWithUrls = await Promise.all(
            files.map(async (file) => {
                const url = await getSignedUrlForDownload(file.storedName);
                return {
                    id: file._id.toString(),
                    url,
                    filename: file.filename,
                    size: file.size,
                    mimetype: file.mimetype,
                };
            })
        );

        return NextResponse.json({ images: imagesWithUrls });
    } catch (err: any) {
        console.error(err);
        return internalServerError(err.message);

    }
}