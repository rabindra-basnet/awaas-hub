// app/api/properties/route.ts
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { Property } from "@/lib/models/Property";
import { Role, Permission, hasPermission } from "@/lib/rbac";
import { getServerSession } from "@/lib/server/getSession";
import { forbidden, internalServerError, unauthorized } from "@/lib/error";
import Files from "@/lib/models/Files";
import { getSignedUrlForDownload } from "@/lib/server/r2-client";
import { getDb } from "@/lib/server/db";
/**
 * GET /api/properties
 * - Admin, Seller, Buyer can view properties
 * - Seller sees only their own, others see all
 */
// export async function GET() {
//   try {
//     await getDb();

//     const session = await getServerSession();
//     if (!session?.user) return unauthorized();

//     const role = (session.user.role as Role) ?? Role.GUEST;

//     // Anyone with view_properties can see
//     if (!hasPermission(role, Permission.VIEW_PROPERTIES)) return forbidden();

//     const userId = session.user.id;
//     const query =
//       role === Role.SELLER && mongoose.Types.ObjectId.isValid(userId)
//         ? { sellerId: new mongoose.Types.ObjectId(userId) }
//         : {}; // Admin / Buyer see all

//     const properties = await Property.find(query)
//       .sort({ createdAt: -1 })
//       .lean();

//     if (!properties.length) return NextResponse.json([]);

//     const propertiesIds = properties.map((p) => p._id);

//     const files = await Files.find({
//       propertyId: { $in: propertiesIds },
//       isDeleted: false,
//     })
//       .sort({ createdAt: 1 })
//       .lean();

//     const firstFileByProperty = new Map<string, any>();

//     for (const file of files) {
//       const propertyId = file.propertyId?.toString();
//       if (propertyId && !firstFileByProperty.has(propertyId)) {
//         firstFileByProperty.set(propertyId, file);
//       }
//     }

//     const propertiesWithImages = await Promise.all(
//       properties.map(async (property: any) => {
//         const propertyId = property._id.toString();
//         const firstFile = firstFileByProperty.get(propertyId);

//         if (!firstFile?.storedName) {
//           return { ...property, images: [] };
//         }

//         const imageUrl = await getSignedUrlForDownload(firstFile.storedName);

//         return { ...property, images: [imageUrl] };
//       }),
//     );

//     return NextResponse.json(propertiesWithImages);
//   } catch (err) {
//     console.error(err);
//     return internalServerError();
//   }
// }

/**
 * GET /api/properties
 * - Unauthenticated / Guest → sees all properties (public)
 * - Seller → sees only their own properties
 * - Admin / Buyer → sees all properties
 */
export async function GET() {
  try {
    await getDb();

    const session = await getServerSession();
    const role = (session?.user?.role as Role) ?? Role.GUEST;
    const userId = session?.user?.id;

    // ✅ Build query based on role
    // Sellers only see their own; everyone else (including guests) sees all
    const query =
      role === Role.SELLER && userId && mongoose.Types.ObjectId.isValid(userId)
        ? { sellerId: new mongoose.Types.ObjectId(userId) }
        : {};

    const properties = await Property.find(query)
      .sort({ createdAt: -1 })
      .lean();

    if (!properties.length) return NextResponse.json([]);

    const propertiesIds = properties.map((p) => p._id);
    const files = await Files.find({
      propertyId: { $in: propertiesIds },
      isDeleted: false,
    })
      .sort({ createdAt: 1 })
      .lean();

    const firstFileByProperty = new Map<string, any>();
    for (const file of files) {
      const propertyId = file.propertyId?.toString();
      if (propertyId && !firstFileByProperty.has(propertyId)) {
        firstFileByProperty.set(propertyId, file);
      }
    }

    const propertiesWithImages = await Promise.all(
      properties.map(async (property: any) => {
        const propertyId = property._id.toString();
        const firstFile = firstFileByProperty.get(propertyId);
        if (!firstFile?.storedName) {
          return { ...property, images: [] };
        }
        const imageUrl = await getSignedUrlForDownload(firstFile.storedName);
        return { ...property, images: [imageUrl] };
      }),
    );

    return NextResponse.json(propertiesWithImages);
  } catch (err) {
    console.error(err);
    return internalServerError();
  }
}
