import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/features/auth/server/session";
import { connectToDatabase } from "@/shared/lib/db";
import { Property } from "@/features/properties/models/property.model";
import { badRequest, unauthorized } from "@/shared/lib/error";
import { z } from "zod";

const schema = z.object({
  title:       z.string().min(1).max(200),
  price:       z.number().min(0),
  location:    z.string().min(1).max(100),
  category:    z.enum(["House", "Apartment", "Land", "Colony"]),
  description: z.string().max(2000).optional(),
  area:        z.string().optional(),
  bedrooms:    z.number().min(0).max(20).optional(),
  bathrooms:   z.number().min(0).max(20).optional(),
  face:        z.string().optional(),
  roadType:    z.string().optional(),
  roadAccess:  z.string().optional(),
  negotiable:  z.boolean().default(false),
  municipality: z.string().optional(),
  wardNo:      z.string().optional(),
  ringRoad:    z.string().optional(),
  latitude:    z.number().min(-90).max(90).nullable().optional(),
  longitude:   z.number().min(-180).max(180).nullable().optional(),
  boundaryPoints: z.array(z.tuple([z.number(), z.number()])).default([]),
  nearHospital:    z.string().optional(),
  nearAirport:     z.string().optional(),
  nearSupermarket: z.string().optional(),
  nearSchool:      z.string().optional(),
  nearGym:         z.string().optional(),
  nearTransport:   z.string().optional(),
  nearAtm:         z.string().optional(),
  nearRestaurant:  z.string().optional(),
  videoUrl:    z.union([z.literal(""), z.string().url()]).optional(),
  status:      z.enum(["available", "booked", "sold"]).default("available"),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return unauthorized();

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON");

  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.errors[0]?.message ?? "Validation error");

  const { boundaryPoints, ...data } = parsed.data;
  if (boundaryPoints.length > 0 && boundaryPoints.length < 3)
    return badRequest("Boundary must have at least 3 points or be empty");

  await connectToDatabase();

  const property = await Property.create({
    ...data,
    boundaryPoints,
    sellerId: session.user.id,
    verificationStatus: "pending",
  });

  return NextResponse.json({ _id: property._id.toString() }, { status: 201 });
}
