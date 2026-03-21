import {
  badRequest,
  forbidden,
  internalServerError,
  unauthorized,
} from "@/lib/error";
import { Property } from "@/lib/models/Property";
import Files from "@/lib/models/Files";
import { hasPermission, Permission, Role } from "@/lib/rbac";
import { getServerSession } from "@/lib/server/getSession";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/server/db";

/**
 * POST /api/properties/new
 * - Creates property with already-uploaded file IDs
 * - Files are uploaded separately via /api/files/upload
 */
// export async function POST(req: NextRequest) {
//   try {
//     await getDb();

//     const session = await getServerSession();
//     if (!session?.user?.id) return unauthorized();

//     const role = session.user.role as Role;
//     if (!hasPermission(role, Permission.MANAGE_PROPERTIES)) {
//       return forbidden();
//     }

//     const userId = session.user.id;
//     const body = await req.json();

//     const {
//       // Core
//       title,
//       price,
//       location,
//       description,
//       status,
//       fileIds,

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

//     if (!title || !price || !location || !category) {
//       return badRequest("Title, price, location and category are required");
//     }

//     /* ---------------- Create Property ---------------- */
//     const property = await Property.create({
//       // Core
//       title,
//       price,
//       location,
//       description,
//       status: status || "available",
//       sellerId: new mongoose.Types.ObjectId(userId),

//       // Property details
//       category,
//       area,
//       bedrooms,
//       bathrooms,
//       face,
//       roadType,
//       roadAccess,
//       negotiable: negotiable ?? false,

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
//     });

//     /* ---------------- Link Files to Property ---------------- */
//     const uploadedFiles = [];

//     if (fileIds?.length > 0) {
//       for (const fileId of fileIds) {
//         const file = await Files.findByIdAndUpdate(
//           fileId,
//           { propertyId: property._id },
//           { new: true },
//         );
//         if (file) uploadedFiles.push(file);
//       }
//     }

//     return NextResponse.json(
//       { success: true, property, files: uploadedFiles },
//       { status: 201 },
//     );
//   } catch (err: any) {
//     console.error(err);
//     return internalServerError(err.message);
//   }
// }
//
//
