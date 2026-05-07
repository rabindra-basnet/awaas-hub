import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/features/auth/server/session";
import { connectToDatabase } from "@/shared/lib/db";
import { Appointment } from "@/features/appointments/models/appointment.model";
import { badRequest, unauthorized } from "@/shared/lib/error";
import { z } from "zod";
import { Types } from "mongoose";

const schema = z.object({
  title:       z.string().min(1).max(200),
  type:        z.enum(["Property Viewing", "Inspection", "Legal Review"]),
  date:        z.string().datetime(),
  propertyId:  z.string().nullable().optional(),
  participants: z.array(z.string()).default([]),
  image:       z.string().nullable().optional(),
  status:      z.enum(["scheduled", "approved", "completed", "cancelled"]).default("scheduled"),
  notes:       z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return unauthorized();

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON");

  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.errors[0]?.message ?? "Validation error");

  const { status, notes, participants, propertyId, ...data } = parsed.data;

  await connectToDatabase();

  const appointment = await Appointment.create({
    ...data,
    propertyId: propertyId ? new Types.ObjectId(propertyId) : null,
    participants: [
      new Types.ObjectId(session.user.id),
      ...participants.map((p) => new Types.ObjectId(p)),
    ],
    createdBy: new Types.ObjectId(session.user.id),
    activityHistory: [{ status, note: notes || "Appointment created", changedAt: new Date() }],
  });

  return NextResponse.json({ _id: appointment._id.toString() }, { status: 201 });
}
