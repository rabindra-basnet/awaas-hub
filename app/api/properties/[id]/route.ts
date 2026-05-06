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

type BoundaryPoint =
  | [number, number]
  | { lat: number; lng: number }
  | { latitude: number; longitude: number };

function validateBoundary(boundaryPoints: unknown): boolean {
  if (boundaryPoints == null) return true; // allow empty / optional boundary

  if (!Array.isArray(boundaryPoints)) return false;
  if (boundaryPoints.length === 0) return true; // no boundary drawn — valid
  if (boundaryPoints.length < 3) return false;

  return boundaryPoints.every((point) => {
    let lat: number | undefined;
    let lng: number | undefined;

    if (Array.isArray(point) && point.length === 2) {
      lat = Number(point[0]);
      lng = Number(point[1]);
    } else if (point && typeof point === "object") {
      const p = point as Record<string, unknown>;

      if ("lat" in p && "lng" in p) {
        lat = Number(p.lat);
        lng = Number(p.lng);
      } else if ("latitude" in p && "longitude" in p) {
        lat = Number(p.latitude);
        lng = Number(p.longitude);
      }
    }

    return (
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat! >= -90 &&
      lat! <= 90 &&
      lng! >= -180 &&
      lng! <= 180
    );
  });
}

// export async function GET(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> },
// ) {
//   try {
//     await getDb();

//     const session = await getServerSession();
//     const role = (session?.user?.role as Role) ?? Role.GUEST;
//     const userId = session?.user?.id;

//     const { id } = await params;
//     if (!mongoose.Types.ObjectId.isValid(id))
//       return badRequest("Invalid property ID");

//     // ── Build query based on role ────────────────────────────────────────────
//     // Filter at DB level so unverified docs are never loaded for guests/buyers
//     let propertyQuery: Record<string, any> = {
//       _id: new mongoose.Types.ObjectId(id),
//     };



//     const isOwner =
//       userId && property?.sellerId?.toString() === userId;

//     if (role === Role.ADMIN) {
//       // Admin sees everything
//     } else if (isOwner) {
//       // Owner sees ONLY their own property (any status)
//       propertyQuery._id = new mongoose.Types.ObjectId(id);
//     } else {
//       // Everyone else sees only verified
//       propertyQuery.verificationStatus = "verified";
//     }

//     const property = await Property.findOne(propertyQuery).lean();
//     if (!property) return notFound("Property not found");

//     // Normalize missing verificationStatus for old docs (always present in response)
//     const verificationStatus = property.verificationStatus ?? "pending";

//     // ── Favorites ────────────────────────────────────────────────────────────
//     const isFavorite = userId
//       ? await Favorite.exists({ userId, propertyId: id })
//       : false;

//     return NextResponse.json({
//       ...property,
//       verificationStatus, // always present in response
//       isFavorite: !!isFavorite,
//     });
//   } catch (err: any) {
//     console.error(err);
//     return internalServerError(err.message);
//   }
// }

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await getDb();

    const session = await getServerSession();
    const role = (session?.user?.role as Role) ?? Role.GUEST;
    const userId = session?.user?.id;

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return badRequest("Invalid property ID");
    }

    // 1. FETCH FIRST
    const property = await Property.findById(id).lean();

    if (!property) {
      return notFound("Property not found");
    }

    // 2. CHECK ACCESS
    const isOwner =
      userId && property.sellerId?.toString() === userId;

    const isAdmin = role === Role.ADMIN;

    const isVerified =
      property.verificationStatus === "verified";

    if (!isAdmin && !isOwner && !isVerified) {
      return notFound("Property not found");
    }

    // 3. FAVORITES
    const isFavorite = userId
      ? await Favorite.exists({ userId, propertyId: id })
      : false;

    return NextResponse.json({
      ...property,
      verificationStatus:
        property.verificationStatus ?? "pending",
      isFavorite: !!isFavorite,
    });
  } catch (err: any) {
    console.error(err);
    return internalServerError(err.message);
  }
}

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
    console.log("Bad request from here")
    if (
      fields.longitude != null &&
      (isNaN(fields.longitude) ||
        fields.longitude < -180 ||
        fields.longitude > 180)
    ) {
      return badRequest("Invalid longitude — must be between -180 and 180");
    }

    console.log("Bad request from here")

    // Validate boundary polygon
    if (fields.boundaryPoints && !validateBoundary(fields.boundaryPoints)) {
      return badRequest(
        "Boundary requires at least 3 valid [lat, lng] coordinate pairs",
      );
    }
    console.log("Bad request from here")

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
