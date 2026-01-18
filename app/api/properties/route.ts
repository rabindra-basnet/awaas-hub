// app/api/properties/route.ts
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { Property } from "@/lib/models/Property";
import { Role, Permission, hasPermission } from "@/lib/rbac";
import { getServerSession } from "@/lib/server/getSession";

/**
 * GET /api/properties
 * - Admin, Seller, Buyer can view properties
 * - Seller sees only their own, others see all
 */
export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const role = session.user.role as Role;

    // Anyone with view_properties can see
    if (!hasPermission(role, Permission.VIEW_PROPERTIES)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const userId = session.user.id;
    const query =
      role === Role.SELLER
        ? { sellerId: new mongoose.Types.ObjectId(userId) }
        : {}; // Admin / Buyer see all

    const properties = await Property.find(query).sort({ createdAt: -1 });

    return NextResponse.json(properties);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}