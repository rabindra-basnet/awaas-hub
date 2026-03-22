// app/api/ads/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { forbidden, notFound, unauthorized } from "@/lib/error";
import { getDb } from "@/lib/server/db";
import Ads from "@/lib/models/Ads";
import { getServerSession } from "@/lib/server/getSession";
import { hasPermission, Permission, Role } from "@/lib/rbac";
import { deleteFile, getSignedUrlForDownload } from "@/lib/server/r2-client";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: RouteContext) {
  await getDb();
  const { id } = await params;

  const session = await getServerSession();
  if (!session?.user?.id) return unauthorized();
  const role = session.user.role as Role;
  if (!hasPermission(role, Permission.MANAGE_ADS)) return forbidden();

  const ad = await Ads.findById(id).lean();
  if (!ad) return notFound("Ad not found");

  if (ad.imageKey) {
    try {
      ad.imageUrl = await getSignedUrlForDownload(ad.imageKey);
    } catch {
      ad.imageKey = undefined;
      ad.imageUrl = undefined;
    }
  }

  return NextResponse.json(ad);
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  await getDb();
  const { id } = await params;

  const session = await getServerSession();
  if (!session?.user?.id) return unauthorized();
  const role = session.user.role as Role;
  if (!hasPermission(role, Permission.MANAGE_ADS)) return forbidden();

  const body = await req.json();

  if (body.startDate) body.startDate = new Date(body.startDate);
  if (body.endDate) body.endDate = new Date(body.endDate);

  if (body.imageKey) {
    const existing = await Ads.findById(id).select("imageKey").lean();
    if (existing?.imageKey && existing.imageKey !== body.imageKey) {
      try {
        await deleteFile(existing.imageKey);
      } catch {
        console.warn("Could not delete old R2 object:", existing.imageKey);
      }
    }
  }

  const ad = (await Ads.findByIdAndUpdate(
    id,
    { $set: body },
    { new: true, runValidators: true },
  ).lean()) as any;

  if (!ad) return notFound("Ad not found");

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

export async function DELETE(_: NextRequest, { params }: RouteContext) {
  await getDb();
  const { id } = await params;

  const session = await getServerSession();
  if (!session?.user?.id) return unauthorized();
  const role = session.user.role as Role;
  if (!hasPermission(role, Permission.MANAGE_ADS)) return forbidden();

  const ad = (await Ads.findByIdAndDelete(id).lean()) as any;
  if (!ad) return notFound("Ad not found");

  if (ad.imageKey) {
    try {
      await deleteFile(ad.imageKey);
    } catch {
      console.warn("Failed to delete R2 object:", ad.imageKey);
    }
  }

  return NextResponse.json({ success: true });
}
