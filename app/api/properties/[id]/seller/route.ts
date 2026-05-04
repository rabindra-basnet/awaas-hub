import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { Property } from "@/lib/models/Property";
import { PropertyContactAccess } from "@/lib/models/PropertyContactAccess";
import { getServerSession } from "@/lib/server/getSession";
import { getDb } from "@/lib/server/db";
import { Role } from "@/lib/rbac";
import { unauthorized, internalServerError } from "@/lib/error";

/**
 * GET /api/properties/[id]/seller
 * Returns seller profile for the property.
 *
 * Access tiers:
 *   - Admin or the property owner (seller) → full data, no paywall
 *   - User with an existing PropertyContactAccess record → full data
 *   - Everyone else → hasAccess: false, contact fields masked to null
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const db = await getDb();
    const session = await getServerSession();
    if (!session?.user?.id) return unauthorized();

    const { id: propertyId } = await params;
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return NextResponse.json({ message: "Invalid property id" }, { status: 400 });
    }

    const userId = session.user.id;
    const role = session.user.role as Role;
    const isAdmin = role === Role.ADMIN;

    // Load property to get sellerId
    const property = await Property.findById(propertyId)
      .select("sellerId title status verificationStatus")
      .lean();
    if (!property) {
      return NextResponse.json({ message: "Property not found" }, { status: 404 });
    }

    const sellerId = property.sellerId.toString();
    const isOwner = sellerId === userId;

    // Determine access
    let hasAccess = isAdmin || isOwner;

    if (!hasAccess) {
      const existing = await PropertyContactAccess.findOne({
        userId,
        propertyId,
      }).lean();
      hasAccess = !!existing;
    }

    // Fetch seller from the users collection (managed by better-auth)
    const usersCol = db.collection("users");
    const seller = await usersCol.findOne(
      { _id: new mongoose.Types.ObjectId(sellerId) },
      { projection: { name: 1, email: 1, image: 1, role: 1, createdAt: 1 } },
    );

    if (!seller) {
      return NextResponse.json({ message: "Seller not found" }, { status: 404 });
    }

    // Seller stats — count their listings
    const [totalListings, soldCount, bookedCount] = await Promise.all([
      Property.countDocuments({ sellerId }),
      Property.countDocuments({ sellerId, status: "sold" }),
      Property.countDocuments({ sellerId, status: "booked" }),
    ]);

    const memberSince = seller.createdAt
      ? new Date(seller.createdAt).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })
      : "N/A";

    const initials = (seller.name as string)
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "??";

    return NextResponse.json({
      hasAccess,
      isOwner,
      isAdmin,
      seller: {
        id: sellerId,
        name: seller.name as string,
        initials,
        image: (seller.image as string) ?? null,
        // Contact fields — only if access granted
        email: hasAccess ? (seller.email as string) : null,
        memberSince,
        role: seller.role as string,
        totalListings,
        soldCount,
        bookedCount,
        activeListings: totalListings - soldCount - bookedCount,
      },
    });
  } catch (err) {
    console.error(err);
    return internalServerError();
  }
}
