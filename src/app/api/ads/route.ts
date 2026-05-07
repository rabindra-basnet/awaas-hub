import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/features/auth/server/session";
import { connectToDatabase } from "@/shared/lib/db";
import { Ad } from "@/features/ads/models/ad.model";
import { badRequest, forbidden, unauthorized } from "@/shared/lib/error";
import { Role } from "@/features/auth/rbac/access";
import { z } from "zod";

const schema = z.object({
  title:       z.string().min(1),
  slot:        z.string().min(1),
  imageUrl:    z.string().optional(),
  imageKey:    z.string().optional(),
  htmlContent: z.string().optional(),
  targetUrl:   z.string().url(),
  altText:     z.string().optional(),
  isActive:    z.boolean().default(true),
  startDate:   z.string().datetime().nullable().optional(),
  endDate:     z.string().datetime().nullable().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return unauthorized();
  if (session.user.role !== Role.ADMIN) return forbidden();

  await connectToDatabase();
  const ads = await Ad.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ ads: ads.map((a) => ({ ...a, _id: a._id.toString() })) });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return unauthorized();
  if (session.user.role !== Role.ADMIN) return forbidden();

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON");

  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.errors[0]?.message ?? "Validation error");

  await connectToDatabase();
  const ad = await Ad.create(parsed.data);
  return NextResponse.json({ _id: ad._id.toString() }, { status: 201 });
}
