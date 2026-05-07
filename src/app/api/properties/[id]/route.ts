import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/features/auth/server/session";
import { fetchPropertyById } from "@/features/properties/server/properties.fetcher";
import { connectToDatabase } from "@/shared/lib/db";
import { Property } from "@/features/properties/models/property.model";
import { File } from "@/features/files/models/file.model";
import { deleteFile } from "@/features/files/server/r2";
import { badRequest, forbidden, notFound, unauthorized } from "@/shared/lib/error";
import { Role } from "@/features/auth/rbac/access";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession();
  const property = await fetchPropertyById(id, session?.user.id, session?.user.role);
  if (!property) return notFound();
  return NextResponse.json(property);
}

const updateSchema = z.object({
  title:       z.string().min(1).max(200).optional(),
  price:       z.number().min(0).optional(),
  location:    z.string().min(1).max(100).optional(),
  category:    z.enum(["House", "Apartment", "Land", "Colony"]).optional(),
  description: z.string().max(2000).optional(),
  area:        z.string().optional(),
  bedrooms:    z.number().min(0).max(20).optional(),
  bathrooms:   z.number().min(0).max(20).optional(),
  face:        z.string().optional(),
  roadType:    z.string().optional(),
  roadAccess:  z.string().optional(),
  negotiable:  z.boolean().optional(),
  municipality: z.string().optional(),
  wardNo:      z.string().optional(),
  ringRoad:    z.string().optional(),
  latitude:    z.number().min(-90).max(90).nullable().optional(),
  longitude:   z.number().min(-180).max(180).nullable().optional(),
  boundaryPoints: z.array(z.tuple([z.number(), z.number()])).optional(),
  nearHospital:    z.string().optional(),
  nearAirport:     z.string().optional(),
  nearSupermarket: z.string().optional(),
  nearSchool:      z.string().optional(),
  nearGym:         z.string().optional(),
  nearTransport:   z.string().optional(),
  nearAtm:         z.string().optional(),
  nearRestaurant:  z.string().optional(),
  videoUrl:    z.union([z.literal(""), z.string().url()]).optional(),
  status:      z.enum(["available", "booked", "sold"]).optional(),
});

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session) return unauthorized();

  await connectToDatabase();
  const property = await Property.findById(id).lean();
  if (!property) return notFound();

  const isOwner = property.sellerId.toString() === session.user.id;
  const isAdmin = session.user.role === Role.ADMIN;
  if (!isAdmin && !isOwner) return forbidden();

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON");

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.errors[0]?.message ?? "Validation error");

  const { boundaryPoints, ...data } = parsed.data;
  if (boundaryPoints !== undefined && boundaryPoints.length > 0 && boundaryPoints.length < 3)
    return badRequest("Boundary must have at least 3 points or be empty");

  await Property.findByIdAndUpdate(id, { ...data, ...(boundaryPoints !== undefined ? { boundaryPoints } : {}) });
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session) return unauthorized();

  await connectToDatabase();
  const property = await Property.findById(id).lean();
  if (!property) return notFound();

  const isOwner = property.sellerId.toString() === session.user.id;
  const isAdmin = session.user.role === Role.ADMIN;
  if (!isAdmin && !isOwner) return forbidden();

  const files = await File.find({ propertyId: id, isDeleted: false }).lean();
  await Promise.all(files.map((f) => deleteFile(f.storedName).catch(() => {})));
  await File.updateMany({ propertyId: id }, { isDeleted: true, deletedAt: new Date() });
  await Property.findByIdAndDelete(id);

  return NextResponse.json({ success: true });
}
