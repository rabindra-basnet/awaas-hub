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
import { extractPropertyFields } from "../new/route";

// // GET /api/properties/:id
// export async function GET(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> },
// ) {
//   try {
//     await getDb();

//     const session = await getServerSession();
//     if (!session?.user) return unauthorized();

//     const role = session.user.role as Role;
//     if (!hasPermission(role, Permission.VIEW_PROPERTIES)) return forbidden();

//     const { id } = await params;
//     if (!mongoose.Types.ObjectId.isValid(id))
//       return badRequest("Invalid property ID");

//     const property = await Property.findById(id).lean();
//     if (!property) return notFound("Property not found");

//     if (
//       role === Role.SELLER &&
//       property.sellerId.toString() !== session.user.id
//     ) {
//       return forbidden();
//     }

//     const isFavorite = await Favorite.exists({
//       userId: session.user.id,
//       propertyId: id,
//     });

//     return NextResponse.json({ ...property, isFavorite: !!isFavorite });
//   } catch (err: any) {
//     console.error(err);
//     return internalServerError(err.message);
//   }
// }

// GET /api/properties/:id
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await getDb();

    const session = await getServerSession();
    const role = (session?.user?.role as Role) ?? Role.GUEST;

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return badRequest("Invalid property ID");

    const property = await Property.findById(id).lean();
    if (!property) return notFound("Property not found");

    // ✅ Sellers can only view their own properties
    if (
      role === Role.SELLER &&
      session?.user?.id &&
      property.sellerId.toString() !== session.user.id
    ) {
      return forbidden();
    }

    // ✅ Only check favorites if user is authenticated
    const isFavorite = session?.user?.id
      ? await Favorite.exists({ userId: session.user.id, propertyId: id })
      : false;

    return NextResponse.json({ ...property, isFavorite: !!isFavorite });
  } catch (err: any) {
    console.error(err);
    return internalServerError(err.message);
  }
}
// /**
//  * PUT /api/properties/:id
//  * - Updates all property fields including new schema fields
//  * - Handles file linking and deletion
//  */
// export async function PUT(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> },
// ) {
//   try {
//     await getDb();

//     const session = await getServerSession();
//     if (!session?.user?.id) return unauthorized();

//     const role = session.user.role as Role;
//     if (!hasPermission(role, Permission.MANAGE_PROPERTIES)) return forbidden();

//     const { id } = await params;
//     if (!mongoose.Types.ObjectId.isValid(id)) return badRequest("Invalid ID");

//     const property = await Property.findById(id);
//     if (!property) return notFound();

//     if (
//       role !== Role.ADMIN &&
//       property.sellerId.toString() !== session.user.id
//     ) {
//       return forbidden();
//     }

//     const body = await req.json();

//     const {
//       // File management — not stored on Property directly
//       fileIds,
//       deletedFileIds,

//       // Core
//       title,
//       price,
//       location,
//       description,
//       status,

//       // Property details
//       category,
//       area,
//       bedrooms,
//       bathrooms,
//       face,
//       roadType,
//       roadAccess,
//       negotiable,

//       // Location details
//       municipality,
//       wardNo,
//       ringRoad,

//       // Nearby facilities
//       nearHospital,
//       nearAirport,
//       nearSupermarket,
//       nearSchool,
//       nearGym,
//       nearTransport,
//       nearAtm,
//       nearRestaurant,
//     } = body;

//     /* ---------------- Handle File Deletions ---------------- */
//     if (deletedFileIds?.length > 0) {
//       for (const fileId of deletedFileIds) {
//         const file = await Files.findById(fileId);
//         if (file && file.propertyId?.toString() === id) {
//           try {
//             await deleteFile(file.storedName);
//           } catch (error) {
//             console.error(`Failed to delete file ${file.storedName}:`, error);
//           }
//           await Files.findByIdAndUpdate(fileId, {
//             isDeleted: true,
//             deletedAt: new Date(),
//           });
//         }
//       }
//     }

//     /* ---------------- Link New Files to Property ---------------- */
//     if (fileIds?.length > 0) {
//       for (const fileId of fileIds) {
//         await Files.findByIdAndUpdate(fileId, { propertyId: property._id });
//       }
//     }

//     /* ---------------- Update Property ---------------- */
//     const updated = await Property.findByIdAndUpdate(
//       id,
//       {
//         // Core
//         title,
//         price,
//         location,
//         description,
//         status,

//         // Property details
//         category,
//         area,
//         bedrooms,
//         bathrooms,
//         face,
//         roadType,
//         roadAccess,
//         negotiable,

//         // Location details
//         municipality,
//         wardNo,
//         ringRoad,

//         // Nearby facilities
//         nearHospital,
//         nearAirport,
//         nearSupermarket,
//         nearSchool,
//         nearGym,
//         nearTransport,
//         nearAtm,
//         nearRestaurant,
//       },
//       { new: true, runValidators: true },
//     );

//     return NextResponse.json({ success: true, property: updated });
//   } catch (err: any) {
//     console.error(err);
//     return internalServerError(err.message);
//   }
// }

// /**
//  * DELETE /api/properties/:id
//  * - Deletes property, all associated R2 files, and all favorites
//  */
// export async function DELETE(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> },
// ) {
//   try {
//     await getDb();

//     const session = await getServerSession();
//     if (!session?.user?.id) return unauthorized();

//     const role = session.user.role as Role;
//     if (!hasPermission(role, Permission.MANAGE_PROPERTIES)) return forbidden();

//     const { id } = await params;
//     if (!mongoose.Types.ObjectId.isValid(id)) return badRequest("Invalid ID");

//     const property = await Property.findById(id);
//     if (!property) return notFound();

//     if (
//       role !== Role.ADMIN &&
//       property.sellerId.toString() !== session.user.id
//     ) {
//       return forbidden();
//     }

//     /* ---------------- Delete Files from R2 + DB ---------------- */
//     const files = await Files.find({ propertyId: id, isDeleted: false });

//     for (const file of files) {
//       try {
//         await deleteFile(file.storedName);
//         await Files.findByIdAndUpdate(file._id, {
//           isDeleted: true,
//           deletedAt: new Date(),
//         });
//       } catch (error) {
//         console.error(`Failed to delete file ${file.storedName}:`, error);
//       }
//     }

//     /* ---------------- Delete Property & Favorites ---------------- */
//     await Property.findByIdAndDelete(id);
//     await Favorite.deleteMany({ propertyId: id });

//     return NextResponse.json({ success: true });
//   } catch (err: any) {
//     console.error(err);
//     return internalServerError(err.message);
//   }
// }

// ── PUT /api/properties/[id] ──────────────────────────────────────────
/**
 * Updates all property fields including coordinates.
 * Handles file linking and deletion.
 */
// export async function PUT(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> },
// ) {
//   try {
//     await getDb();

//     const session = await getServerSession();
//     if (!session?.user?.id) return unauthorized();

//     const role = session.user.role as Role;
//     if (!hasPermission(role, Permission.MANAGE_PROPERTIES)) return forbidden();

//     const { id } = await params;
//     if (!mongoose.Types.ObjectId.isValid(id)) return badRequest("Invalid ID");

//     const property = await Property.findById(id);
//     if (!property) return notFound();

//     if (
//       role !== Role.ADMIN &&
//       property.sellerId.toString() !== session.user.id
//     ) {
//       return forbidden();
//     }

//     const body = (await req.json()) as Record<string, unknown> & {
//       fileIds?: string[];
//       deletedFileIds?: string[];
//     };

//     const { fileIds, deletedFileIds } = body;
//     const fields = extractPropertyFields(body);

//     // Validate coordinates if provided
//     if (
//       fields.latitude != null &&
//       (isNaN(fields.latitude) || fields.latitude < -90 || fields.latitude > 90)
//     ) {
//       return badRequest("Invalid latitude — must be between -90 and 90");
//     }
//     if (
//       fields.longitude != null &&
//       (isNaN(fields.longitude) ||
//         fields.longitude < -180 ||
//         fields.longitude > 180)
//     ) {
//       return badRequest("Invalid longitude — must be between -180 and 180");
//     }

//     /* ── Handle File Deletions ── */
//     if (deletedFileIds?.length) {
//       for (const fileId of deletedFileIds) {
//         const file = await Files.findById(fileId);
//         if (file && file.propertyId?.toString() === id) {
//           try {
//             await deleteFile(file.storedName);
//           } catch (e) {
//             console.error(e);
//           }
//           await Files.findByIdAndUpdate(fileId, {
//             isDeleted: true,
//             deletedAt: new Date(),
//           });
//         }
//       }
//     }

//     /* ── Link New Files ── */
//     if (fileIds?.length) {
//       for (const fileId of fileIds) {
//         await Files.findByIdAndUpdate(fileId, { propertyId: property._id });
//       }
//     }

//     /* ── Update Property ── */
//     const updated = await Property.findByIdAndUpdate(
//       id,
//       { ...fields },
//       { new: true, runValidators: true },
//     );

//     return NextResponse.json({ success: true, property: updated });
//   } catch (err: any) {
//     console.error(err);
//     return internalServerError(err.message);
//   }
// }

// ── PUT /api/properties/[id] ──────────────────────────────────────────
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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

    if (
      role !== Role.ADMIN &&
      property.sellerId.toString() !== session.user.id
    ) {
      return forbidden();
    }

    const body = (await req.json()) as Record<string, unknown> & {
      fileIds?: string[];
      deletedFileIds?: string[];
    };

    const { fileIds, deletedFileIds } = body;
    const fields = extractPropertyFields(body);

    // Validate GPS coordinates
    if (
      fields.latitude != null &&
      (isNaN(fields.latitude) || fields.latitude < -90 || fields.latitude > 90)
    ) {
      return badRequest("Invalid latitude — must be between -90 and 90");
    }
    if (
      fields.longitude != null &&
      (isNaN(fields.longitude) ||
        fields.longitude < -180 ||
        fields.longitude > 180)
    ) {
      return badRequest("Invalid longitude — must be between -180 and 180");
    }

    // Validate boundary polygon
    if (!validateBoundary(fields.boundaryPoints)) {
      return badRequest(
        "Boundary requires at least 3 valid [lat, lng] coordinate pairs",
      );
    }

    /* ── Handle File Deletions ── */
    if (deletedFileIds?.length) {
      for (const fileId of deletedFileIds) {
        const file = await Files.findById(fileId);
        if (file && file.propertyId?.toString() === id) {
          try {
            await deleteFile(file.storedName);
          } catch (e) {
            console.error(e);
          }
          await Files.findByIdAndUpdate(fileId, {
            isDeleted: true,
            deletedAt: new Date(),
          });
        }
      }
    }

    /* ── Link New Files ── */
    if (fileIds?.length) {
      for (const fileId of fileIds) {
        await Files.findByIdAndUpdate(fileId, { propertyId: property._id });
      }
    }

    /* ── Update Property ── */
    const updated = await Property.findByIdAndUpdate(
      id,
      { ...fields },
      { new: true, runValidators: true },
    );

    return NextResponse.json({ success: true, property: updated });
  } catch (err: any) {
    console.error(err);
    return internalServerError(err.message);
  }
}

// ── DELETE /api/properties/[id] ───────────────────────────────────────
/**
 * Deletes property, all associated R2 files, and all favorites.
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
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

    if (
      role !== Role.ADMIN &&
      property.sellerId.toString() !== session.user.id
    ) {
      return forbidden();
    }

    /* ── Delete Files from R2 + DB ── */
    const files = await Files.find({ propertyId: id, isDeleted: false });
    for (const file of files) {
      try {
        await deleteFile(file.storedName);
        await Files.findByIdAndUpdate(file._id, {
          isDeleted: true,
          deletedAt: new Date(),
        });
      } catch (e) {
        console.error(e);
      }
    }

    /* ── Delete Property & Favorites ── */
    await Property.findByIdAndDelete(id);
    await Favorite.deleteMany({ propertyId: id });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return internalServerError(err.message);
  }
}
