// app/api/properties/route.ts
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { Property } from "@/lib/models/Property";
import { Role } from "@/lib/rbac";
import { getServerSession } from "@/lib/server/getSession";
import { internalServerError } from "@/lib/error";
import Files from "@/lib/models/Files";
import { getSignedUrlForDownload } from "@/lib/server/r2-client";
import { getDb } from "@/lib/server/db";

/**
 * GET /api/properties
 *
 * Role        │ Query
 * ────────────┼──────────────────────────────────────────────────────────────
 * Guest/Buyer │ { verificationStatus: "verified" }  — verified only
 * Seller      │ { sellerId: <their id> }             — all own listings
 * Admin       │ {}                                   — everything
 */
export async function GET() {
  try {
    await getDb();
    const session = await getServerSession();
    const role = (session?.user?.role as Role) ?? Role.GUEST;
    const userId = session?.user?.id;

    // console.debug is suppressed by Next.js — use console.log
    console.log("[GET /api/properties] role:", role, "userId:", userId);

    let query: Record<string, any>;

    if (role === Role.ADMIN) {
      // Admin sees every property regardless of verification status
      query = {};
    } else if (
      role === Role.SELLER &&
      userId &&
      mongoose.Types.ObjectId.isValid(userId)
    ) {
      // Sellers see all of their own listings (any status)
      query = { sellerId: new mongoose.Types.ObjectId(userId) };
    } else {
      // Guests and buyers:
      // Only show explicitly verified docs.
      // Docs where the field is missing/null/pending are excluded
      // by requiring the field to equal "verified" AND exist.
      query = {
        verificationStatus: "verified",
      };
    }

    console.log("[GET /api/properties] query:", JSON.stringify(query));

    const properties = await Property.find(query)
      .sort({ createdAt: -1 })
      .lean();

    console.log("[GET /api/properties] found:", properties.length);

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
          return {
            ...property,
            // Normalize missing field so frontend always gets a value
            verificationStatus: property.verificationStatus ?? "pending",
            images: [],
          };
        }
        const imageUrl = await getSignedUrlForDownload(firstFile.storedName);
        return {
          ...property,
          verificationStatus: property.verificationStatus ?? "pending",
          images: [imageUrl],
        };
      }),
    );

    return NextResponse.json(propertiesWithImages);
  } catch (err) {
    console.error("[GET /api/properties] error:", err);
    return internalServerError();
  }
}
