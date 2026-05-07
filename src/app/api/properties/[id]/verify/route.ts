import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/features/auth/server/session";
import { connectToDatabase } from "@/shared/lib/db";
import { Property } from "@/features/properties/models/property.model";
import { badRequest, forbidden, notFound, unauthorized } from "@/shared/lib/error";
import { Role } from "@/features/auth/rbac/access";
import { z } from "zod";

const schema = z.object({
  verificationStatus: z.enum(["verified", "rejected"]),
  reason: z.string().optional(),
  status: z.enum(["available", "booked", "sold"]).optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session) return unauthorized();
  if (session.user.role !== Role.ADMIN) return forbidden("Admin only");

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON");

  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.errors[0]?.message ?? "Validation error");

  await connectToDatabase();
  const property = await Property.findById(id);
  if (!property) return notFound();

  property.verificationStatus = parsed.data.verificationStatus;
  if (parsed.data.verificationStatus === "verified") {
    property.verifiedAt = new Date();
    property.verifiedBy = session.user.id as any;
  }
  if (parsed.data.status) property.status = parsed.data.status;

  await property.save();
  return NextResponse.json({ success: true });
}
