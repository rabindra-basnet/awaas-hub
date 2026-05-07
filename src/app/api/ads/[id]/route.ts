import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/features/auth/server/session";
import { connectToDatabase } from "@/shared/lib/db";
import { Ad } from "@/features/ads/models/ad.model";
import { badRequest, forbidden, notFound, unauthorized } from "@/shared/lib/error";
import { Role } from "@/features/auth/rbac/access";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session) return unauthorized();
  if (session.user.role !== Role.ADMIN) return forbidden();

  await connectToDatabase();
  const ad = await Ad.findById(id).lean();
  if (!ad) return notFound();
  return NextResponse.json({ ...ad, _id: ad._id.toString() });
}

const updateSchema = z.object({
  title:       z.string().min(1).optional(),
  slot:        z.string().min(1).optional(),
  imageUrl:    z.string().optional(),
  imageKey:    z.string().optional(),
  htmlContent: z.string().optional(),
  targetUrl:   z.string().url().optional(),
  altText:     z.string().optional(),
  isActive:    z.boolean().optional(),
  startDate:   z.string().datetime().nullable().optional(),
  endDate:     z.string().datetime().nullable().optional(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session) return unauthorized();
  if (session.user.role !== Role.ADMIN) return forbidden();

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON");

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.errors[0]?.message ?? "Validation error");

  await connectToDatabase();
  const ad = await Ad.findByIdAndUpdate(id, parsed.data, { new: true }).lean();
  if (!ad) return notFound();
  return NextResponse.json({ ...ad, _id: ad._id.toString() });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session) return unauthorized();
  if (session.user.role !== Role.ADMIN) return forbidden();

  await connectToDatabase();
  const ad = await Ad.findByIdAndDelete(id).lean();
  if (!ad) return notFound();
  return NextResponse.json({ success: true });
}
