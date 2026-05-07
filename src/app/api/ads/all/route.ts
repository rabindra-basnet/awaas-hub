import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/shared/lib/db";
import { Ad } from "@/features/ads/models/ad.model";

export async function GET(req: NextRequest) {
  const slot = req.nextUrl.searchParams.get("slot");
  await connectToDatabase();

  const now = new Date();
  const query: Record<string, any> = {
    isActive: true,
    $or: [{ startDate: null }, { startDate: { $lte: now } }],
    $and: [{ $or: [{ endDate: null }, { endDate: { $gte: now } }] }],
  };
  if (slot) query.slot = slot;

  const ads = await Ad.find(query).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ ads: ads.map((a) => ({ ...a, _id: a._id.toString() })) });
}
