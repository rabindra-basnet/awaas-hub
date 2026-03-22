import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/server/db";
import Ads from "@/lib/models/Ads";
import { badRequest, notFound } from "@/lib/error";

/**
 * POST /api/ads/:id/impression  — increments impression count
 * POST /api/ads/:id/click       — increments click count
 * Public — no auth needed (fired from AdBanner/InterstitialAd on the client)
 */
export async function POST(
  _: NextRequest,
  { params }: { params: Promise<{ id: string; event: string }> },
) {
  await getDb();

  const { id, event } = await params;

  if (event !== "impression" && event !== "click") {
    return badRequest("Invalid event type — must be 'impression' or 'click'");
  }

  const field = event === "click" ? "clicks" : "impressions";

  const ad = await Ads.findByIdAndUpdate(
    id,
    { $inc: { [field]: 1 } },
    { new: false }, // we don't need the updated doc back
  );

  if (!ad) return notFound("Ad not found");

  return new NextResponse(null, { status: 204 });
}
