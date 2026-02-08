// import { NextResponse } from "next/server";
// import mongoose from "mongoose";
// import { Property } from "@/lib/models/Property";
// import { Favorite } from "@/lib/models/Favorite";
// import { Role, Permission, hasPermission } from "@/lib/rbac";
// import { getServerSession } from "@/lib/server/getSession";
// import {
//   badRequest,
//   forbidden,
//   notFound,
//   internalServerError,
//   unauthorized,
// } from "@/lib/error";

// // GET /api/properties/:id
// export async function GET(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   const session = await getServerSession();
//   if (!session?.user) return unauthorized();

//   const role = session.user.role as Role;
//   if (!hasPermission(role, Permission.VIEW_PROPERTIES)) return forbidden();

//   const { id } = await params;
//   if (!mongoose.Types.ObjectId.isValid(id)) return badRequest("Invalid property ID");

//   try {
//     const property = await Property.findById(id).lean();
//     if (!property) return notFound("Property not found");

//     // Only seller can see their own private properties
//     if (role === Role.SELLER && property.sellerId.toString() !== session.user.id) {
//       return forbidden();
//     }

//     // Check if current user has favorited this property
//     const isFavorite = await Favorite.exists({
//       userId: session.user.id,
//       propertyId: id,
//     });

//     return NextResponse.json({ ...property, isFavorite: !!isFavorite });
//   } catch (err) {
//     console.error(err);
//     return internalServerError();
//   }
// }

// // PUT - Edit property
// export async function PUT(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   const session = await getServerSession();
//   if (!session?.user) return unauthorized();

//   const role = session.user.role as Role;
//   if (!hasPermission(role, Permission.MANAGE_PROPERTIES)) return forbidden();

//   const { id } = await params;
//   if (!mongoose.Types.ObjectId.isValid(id)) return badRequest("Invalid ID");

//   try {
//     const property = await Property.findById(id);
//     if (!property) return notFound();

//     // Only admin or property owner can edit
//     if (role !== Role.ADMIN && property.sellerId.toString() !== session.user.id) {
//       return forbidden();
//     }

//     const body = await req.json();
//     const updated = await Property.findByIdAndUpdate(id, body, {
//       new: true,
//       runValidators: true,
//     });

//     return NextResponse.json(updated);
//   } catch (err) {
//     console.error(err);
//     return internalServerError();
//   }
// }

// // DELETE - Delete property and its favorites
// export async function DELETE(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   const session = await getServerSession();
//   if (!session?.user) return unauthorized();

//   const role = session.user.role as Role;
//   if (!hasPermission(role, Permission.MANAGE_PROPERTIES)) return forbidden();

//   const { id } = await params;
//   if (!mongoose.Types.ObjectId.isValid(id)) return badRequest("Invalid ID");

//   try {
//     const property = await Property.findById(id);
//     if (!property) return notFound();

//     // Only admin or property owner can delete
//     if (role !== Role.ADMIN && property.sellerId.toString() !== session.user.id) {
//       return forbidden();
//     }

//     // Delete property
//     await Property.findByIdAndDelete(id);

//     // ✅ Also delete all favorites referencing this property
//     await Favorite.deleteMany({ propertyId: id });

//     return NextResponse.json({ success: true });
//   } catch (err) {
//     console.error(err);
//     return internalServerError();
//   }
// }


import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { Property } from "@/lib/models/Property";
import { Favorite } from "@/lib/models/Favorite";
import Files from "@/lib/models/Files";
import { Role, Permission, hasPermission } from "@/lib/rbac";
import { getServerSession } from "@/lib/server/getSession";
import { deleteFile } from "@/lib/server/r2-client";
import {
  badRequest,
  forbidden,
  notFound,
  internalServerError,
  unauthorized,
} from "@/lib/error";
import { getDb } from "@/lib/server/db";

// GET /api/properties/:id
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getDb();

    const session = await getServerSession();
    if (!session?.user) return unauthorized();

    const role = session.user.role as Role;
    if (!hasPermission(role, Permission.VIEW_PROPERTIES)) return forbidden();

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return badRequest("Invalid property ID");

    const property = await Property.findById(id).lean();
    if (!property) return notFound("Property not found");

    // Only seller can see their own private properties
    if (
      role === Role.SELLER &&
      property.sellerId.toString() !== session.user.id
    ) {
      return forbidden();
    }

    // Check if current user has favorited this property
    const isFavorite = await Favorite.exists({
      userId: session.user.id,
      propertyId: id,
    });

    return NextResponse.json({ ...property, isFavorite: !!isFavorite });
  } catch (err: any) {
    console.error(err);
    return internalServerError(err.message);
  }
}

/**
 * PUT /api/properties/:id
 * - Updates property with already-uploaded file IDs
 * - Files are uploaded separately via /api/files/upload
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getDb();

    const session = await getServerSession();
    if (!session?.user?.id) return unauthorized();

    const role = session.user.role as Role;
    if (!hasPermission(role, Permission.MANAGE_PROPERTIES)) return forbidden();

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) return badRequest("Invalid ID");

    const property = await Property.findById(id);
    if (!property) return notFound();

    // Only admin or property owner can edit
    if (
      role !== Role.ADMIN &&
      property.sellerId.toString() !== session.user.id
    ) {
      return forbidden();
    }

    const body = await req.json();
    const { fileIds, deletedFileIds, ...propertyData } = body;

    /* ---------------- Handle File Deletions ---------------- */
    if (deletedFileIds && deletedFileIds.length > 0) {
      for (const fileId of deletedFileIds) {
        const file = await Files.findById(fileId);

        if (file && file.propertyId?.toString() === id) {
          // Delete from R2
          try {
            await deleteFile(file.storedName);
          } catch (error) {
            console.error(`Failed to delete file ${file.storedName}:`, error);
          }

          // Mark as deleted in database
          await Files.findByIdAndUpdate(fileId, {
            isDeleted: true,
            deletedAt: new Date(),
          });
        }
      }
    }

    /* ---------------- Link New Files to Property ---------------- */
    if (fileIds && fileIds.length > 0) {
      for (const fileId of fileIds) {
        await Files.findByIdAndUpdate(fileId, {
          propertyId: property._id,
        });
      }
    }

    /* ---------------- Update Property ---------------- */
    const updated = await Property.findByIdAndUpdate(
      id,
      propertyData,
      {
        new: true,
        runValidators: true,
      }
    );

    return NextResponse.json({
      success: true,
      property: updated,
    });
  } catch (err: any) {
    console.error(err);
    return internalServerError(err.message);
  }
}

/**
 * DELETE /api/properties/:id
 * - Deletes property
 * - Deletes all associated files from R2 and database
 * - Deletes all favorites
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getDb();

    const session = await getServerSession();
    if (!session?.user?.id) return unauthorized();

    const role = session.user.role as Role;
    if (!hasPermission(role, Permission.MANAGE_PROPERTIES)) return forbidden();

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) return badRequest("Invalid ID");

    const property = await Property.findById(id);
    if (!property) return notFound();

    // Only admin or property owner can delete
    if (
      role !== Role.ADMIN &&
      property.sellerId.toString() !== session.user.id
    ) {
      return forbidden();
    }

    /* ---------------- Delete Files ---------------- */
    const files = await Files.find({ propertyId: id, isDeleted: false });

    for (const file of files) {
      try {
        // Delete from R2
        await deleteFile(file.storedName);

        // Mark as deleted in database
        await Files.findByIdAndUpdate(file._id, {
          isDeleted: true,
          deletedAt: new Date(),
        });
      } catch (error) {
        console.error(`Failed to delete file ${file.storedName}:`, error);
        // Continue deleting other files even if one fails
      }
    }

    /* ---------------- Delete Property ---------------- */
    await Property.findByIdAndDelete(id);

    /* ---------------- Delete Favorites ---------------- */
    await Favorite.deleteMany({ propertyId: id });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return internalServerError(err.message);
  }
}