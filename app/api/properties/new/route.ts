import {
  badRequest,
  forbidden,
  internalServerError,
  notFound,
  unauthorized,
} from "@/lib/error";
import { Property } from "@/lib/models/Property";
import Files from "@/lib/models/Files";
import { Favorite } from "@/lib/models/Favorite";
import { hasPermission, Permission, Role } from "@/lib/rbac";
import { getServerSession } from "@/lib/server/getSession";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/server/db";

/** Validates a boundary array — must be empty or have ≥3 [lat,lng] pairs */
function validateBoundary(points: unknown): points is [number, number][] {
  if (!Array.isArray(points)) return true; // undefined/null → skip
  if (points.length === 0) return true; // empty array is valid (no boundary)
  if (points.length < 3) return false; // polygon needs at least 3 points
  return points.every(
    (p) =>
      Array.isArray(p) &&
      p.length === 2 &&
      typeof p[0] === "number" &&
      typeof p[1] === "number" &&
      p[0] >= -90 &&
      p[0] <= 90 && // lat range
      p[1] >= -180 &&
      p[1] <= 180, // lng range
  );
}

/** Extracts all saveable property fields from a request body */
export function extractPropertyFields(body: Record<string, unknown>) {
  return {
    // Core
    title: body.title,
    price: body.price,
    location: body.location,
    description: body.description,
    status: body.status,

    // Property details
    category: body.category,
    area: body.area,
    bedrooms: body.bedrooms,
    bathrooms: body.bathrooms,
    face: body.face,
    roadType: body.roadType,
    roadAccess: body.roadAccess,
    negotiable: body.negotiable,

    // Location details
    municipality: body.municipality,
    wardNo: body.wardNo,
    ringRoad: body.ringRoad,

    // GPS pin — coerce to number, fall back to null
    latitude: body.latitude != null ? Number(body.latitude) : null,
    longitude: body.longitude != null ? Number(body.longitude) : null,

    // Boundary polygon — array of [lat, lng] pairs drawn on the map
    // Store as-is; validated below before hitting DB
    boundaryPoints: Array.isArray(body.boundaryPoints)
      ? body.boundaryPoints
      : [],

    // Nearby facilities
    nearHospital: body.nearHospital,
    nearAirport: body.nearAirport,
    nearSupermarket: body.nearSupermarket,
    nearSchool: body.nearSchool,
    nearGym: body.nearGym,
    nearTransport: body.nearTransport,
    nearAtm: body.nearAtm,
    nearRestaurant: body.nearRestaurant,
  };
}

// ── POST /api/properties/new ──────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    await getDb();

    const session = await getServerSession();
    if (!session?.user?.id) return unauthorized();

    const role = session.user.role as Role;
    if (!hasPermission(role, Permission.MANAGE_PROPERTIES)) return forbidden();

    const userId = session.user.id;
    const body = (await req.json()) as Record<string, unknown> & {
      fileIds?: string[];
    };
    const { fileIds } = body;

    const fields = extractPropertyFields(body);

    // Required fields
    if (
      !fields.title ||
      !fields.price ||
      !fields.location ||
      !fields.category
    ) {
      return badRequest("Title, price, location and category are required");
    }

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

    /* ── Create Property ── */
    const property = await Property.create({
      ...fields,
      sellerId: new mongoose.Types.ObjectId(userId),
    });

    /* ── Link Files to Property ── */
    const uploadedFiles = [];
    if (fileIds?.length) {
      for (const fileId of fileIds) {
        const file = await Files.findByIdAndUpdate(
          fileId,
          { propertyId: property._id },
          { new: true },
        );
        if (file) uploadedFiles.push(file);
      }
    }

    return NextResponse.json(
      { success: true, property, files: uploadedFiles },
      { status: 201 },
    );
  } catch (err: any) {
    console.error(err);
    return internalServerError(err.message);
  }
}
