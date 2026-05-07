import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/shared/lib/db";
import { Ad } from "@/features/ads/models/ad.model";
import { badRequest, notFound } from "@/shared/lib/error";

type Params = { params: Promise<{ id: string; event: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const { id, event } = await params;
  if (event !== "impression" && event !== "click") return badRequest("Invalid event");

  await connectToDatabase();
  const ad = await Ad.findByIdAndUpdate(
    id,
    { $inc: { [event === "impression" ? "impressions" : "clicks"]: 1 } },
    { new: true },
  ).lean();

  if (!ad) return notFound();
  return NextResponse.json({ success: true });
}
