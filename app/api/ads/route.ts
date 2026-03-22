// import { badRequest, forbidden, unauthorized } from "@/lib/error";
// import Ads from "@/lib/models/Ads";
// import { hasPermission, Permission, Role } from "@/lib/rbac";
// import { getDb } from "@/lib/server/db";
// import { getServerSession } from "@/lib/server/getSession";
// import { NextRequest, NextResponse } from "next/server";
// /**
//  * GET /api/ads?slot=<slot-name>
//  * Returns one active, in-schedule ad for the given slot.
//  * Used by AdBanner and InterstitialAd components.
//  */
// export async function GET(req: NextRequest) {
//   await getDb();

//   const session = await getServerSession();
//   if (!session?.user?.id) return unauthorized();

//   const role = session.user.role as Role;
//   if (!hasPermission(role, Permission.MANAGE_ADS)) return forbidden();

//   const slot = req.nextUrl.searchParams.get("slot") ?? "default";
//   const now = new Date();

//   const ad = await Ads.findOne({
//     slot,
//     isActive: true,
//     $or: [
//       // Scheduled and currently within range
//       { startDate: { $lte: now }, endDate: { $gte: now } },
//       // No schedule set — always show
//       { startDate: null, endDate: null },
//       // Started but no end date
//       { startDate: { $lte: now }, endDate: null },
//     ],
//   })
//     .sort({ createdAt: -1 })
//     .lean();

//   if (!ad) return new NextResponse(null, { status: 204 });
//   return NextResponse.json(ad);
// }

// /**
//  * POST /api/ads
//  * Creates a new ad. Should be protected by your auth middleware / RBAC.
//  */
// export async function POST(req: NextRequest) {
//   await getDb();
//   // const session = await getServerSession();
//   // if (!session?.user?.id) return unauthorized();

//   // const role = session.user.role as Role;
//   // if (hasPermission(role, Permission.MANAGE_ADS)) return forbidden();

//   const body = await req.json();

//   // Basic validation
//   if (!body.title || !body.targetUrl || !body.slot) {
//     return badRequest("title, targetUrl, and slot are required");
//   }

//   const ad = await Ads.create({
//     ...body,
//     startDate: body.startDate ? new Date(body.startDate) : null,
//     endDate: body.endDate ? new Date(body.endDate) : null,
//   });

//   return NextResponse.json(ad, { status: 201 });
// }

// app/api/ads/route.ts
import { NextRequest, NextResponse } from "next/server";
import { badRequest, forbidden, unauthorized } from "@/lib/error";
import Ads from "@/lib/models/Ads";
import { hasPermission, Permission, Role } from "@/lib/rbac";
import { getDb } from "@/lib/server/db";
import { getServerSession } from "@/lib/server/getSession";
import {
  getSignedUrlForDownload,
  getSignedUrlForUpload,
} from "@/lib/server/r2-client";
// import { getSignedUrlForDownload, getSignedUrlForUpload } from "@/lib/r2";

/**
 * GET /api/ads?slot=<slot-name>
 * Public — returns one active in-schedule ad for the given slot.
 * Refreshes signed image URL if ad uses an R2 uploaded image.
 */
export async function GET(req: NextRequest) {
  await getDb();

  const slot = req.nextUrl.searchParams.get("slot") ?? "default";
  const now = new Date();

  const ad = (await Ads.findOne({
    slot,
    isActive: true,
    $or: [
      { startDate: { $lte: now }, endDate: { $gte: now } },
      { startDate: null, endDate: null },
      { startDate: { $lte: now }, endDate: null },
    ],
  })
    .sort({ createdAt: -1 })
    .lean()) as any;

  if (!ad) return new NextResponse(null, { status: 204 });

  // Always return a valid image URL — refresh signed URL if R2-hosted
  if (ad.imageKey) {
    try {
      ad.imageUrl = await getSignedUrlForDownload(ad.imageKey);
    } catch {
      ad.imageKey = null;
      ad.imageUrl = null;
    }
  }

  return NextResponse.json(ad);
}

/**
 * POST /api/ads
 * Admin only — creates a new ad.
 */
export async function POST(req: NextRequest) {
  await getDb();

  const session = await getServerSession();
  if (!session?.user?.id) return unauthorized();
  const role = session.user.role as Role;
  if (!hasPermission(role, Permission.MANAGE_ADS)) return forbidden();

  const body = await req.json();

  if (!body.title || !body.targetUrl || !body.slot) {
    return badRequest("title, targetUrl, and slot are required");
  }

  const ad = await Ads.create({
    ...body,
    startDate: body.startDate ? new Date(body.startDate) : null,
    endDate: body.endDate ? new Date(body.endDate) : null,
  });

  return NextResponse.json(ad, { status: 201 });
}

/**
 * PUT /api/ads
 * Admin only — returns a presigned R2 URL for direct image upload.
 * Body: { filename: string, contentType: string }
 * Returns: { uploadUrl, publicUrl, key }
 */
export async function PUT(req: NextRequest) {
  await getDb();

  const session = await getServerSession();
  if (!session?.user?.id) return unauthorized();
  const role = session.user.role as Role;
  if (!hasPermission(role, Permission.MANAGE_ADS)) return forbidden();

  const { filename, contentType } = await req.json();

  if (!filename || !contentType) {
    return badRequest("filename and contentType are required");
  }

  if (!contentType.startsWith("image/")) {
    return badRequest("Only image uploads are allowed");
  }

  // Sanitise filename — strip non-safe characters
  const safeFilename = filename.replace(/[^a-zA-Z0-9.\-_]/g, "");
  const key = `ads/${Date.now()}-${safeFilename}`;

  const uploadUrl = await getSignedUrlForUpload(key, contentType, {
    uploadedBy: session.user.id,
    purpose: "ad-image",
  });

  // After upload succeeds the client needs a download URL for preview;
  // generate one immediately so the UI can show a signed preview URL
  const previewUrl = await getSignedUrlForDownload(key);

  return NextResponse.json({ uploadUrl, previewUrl, key });
}
