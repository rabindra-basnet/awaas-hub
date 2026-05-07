import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/shared/lib/db";
import { Property } from "@/features/properties/models/property.model";
import { notFound } from "@/shared/lib/error";
import { getAuth } from "@/features/auth/server/auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  await connectToDatabase();

  const property = await Property.findById(id).lean();
  if (!property) return notFound();

  const auth = await getAuth();
  const seller = await auth.api.getUser({ query: { userId: property.sellerId.toString() } }).catch(() => null);

  const [totalListings, verifiedListings] = await Promise.all([
    Property.countDocuments({ sellerId: property.sellerId }),
    Property.countDocuments({ sellerId: property.sellerId, verificationStatus: "verified" }),
  ]);

  return NextResponse.json({
    id: property.sellerId.toString(),
    name: (seller as any)?.name || "Unknown",
    email: (seller as any)?.email || "",
    image: (seller as any)?.image || null,
    totalListings,
    verifiedListings,
  });
}
