// import { NextResponse } from "next/server";
// import Ad from "@/lib/models/Ads";
// import { getDb } from "@/lib/server/db";
// import { getServerSession } from "@/lib/server/getSession";
// import { forbidden, unauthorized } from "@/lib/error";
// import { hasPermission, Permission, Role } from "@/lib/rbac";
// import Ads from "@/lib/models/Ads";

// /**
//  * GET /api/ads/all
//  * Returns all ads sorted by newest first.
//  * Used by the admin management page.
//  */
// export async function GET() {
//   await getDb();
//   const session = await getServerSession();
//   if (!session?.user?.id) return unauthorized();

//   const role = session.user.role as Role;
//   if (!hasPermission(role, Permission.MANAGE_ADS)) return forbidden();

//   const ads = await Ads.find().sort({ createdAt: -1 }).lean();
//   return NextResponse.json(ads);
// }

// app/api/ads/all/route.ts
import { NextResponse } from "next/server";
import Ads from "@/lib/models/Ads";
import { getDb } from "@/lib/server/db";
import { getServerSession } from "@/lib/server/getSession";
import { forbidden, unauthorized } from "@/lib/error";
import { hasPermission, Permission, Role } from "@/lib/rbac";
import { getSignedUrlForDownload } from "@/lib/server/r2-client";
// import { getSignedUrlForDownload } from "@/lib/r2";

/**
 * GET /api/ads/all
 * Admin only — returns all ads with fresh signed image URLs for R2-hosted images.
 */
export async function GET() {
  await getDb();

  const session = await getServerSession();
  if (!session?.user?.id) return unauthorized();
  const role = session.user.role as Role;
  if (!hasPermission(role, Permission.MANAGE_ADS)) return forbidden();

  const ads = await Ads.find().sort({ createdAt: -1 }).lean();

  // Refresh signed URLs in parallel for any R2-hosted images
  const adsWithUrls = await Promise.all(
    ads.map(async (ad: any) => {
      if (ad.imageKey) {
        try {
          ad.imageUrl = await getSignedUrlForDownload(ad.imageKey);
        } catch {
          // Object no longer in R2 — clear stale reference
          ad.imageKey = null;
          ad.imageUrl = null;
        }
      }
      return ad;
    }),
  );

  return NextResponse.json(adsWithUrls);
}
