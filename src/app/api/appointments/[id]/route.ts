import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/features/auth/server/session";
import { connectToDatabase } from "@/shared/lib/db";
import { Appointment } from "@/features/appointments/models/appointment.model";
import { badRequest, forbidden, notFound, unauthorized } from "@/shared/lib/error";
import { Role } from "@/features/auth/rbac/access";
import { z } from "zod";
import mongoose, { Types } from "mongoose";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session) return unauthorized();

  await connectToDatabase();
  const appointment = await Appointment.collection.findOne({ _id: new Types.ObjectId(id) });
  if (!appointment) return notFound();

  const isAdmin = session.user.role === Role.ADMIN;
  const isParticipant = appointment.participants?.some(
    (p: any) => p.toString() === session.user.id,
  );
  const isCreator = appointment.createdBy?.toString() === session.user.id;

  if (!isAdmin && !isParticipant && !isCreator) return forbidden();

  return NextResponse.json({
    ...appointment,
    _id: appointment._id.toString(),
    propertyId: appointment.propertyId?.toString() ?? null,
    participants: (appointment.participants ?? []).map((p: any) => p.toString()),
    createdBy: appointment.createdBy?.toString() ?? "",
    currentStatus: appointment.activityHistory?.at(-1)?.status ?? "scheduled",
    createdAt: new Date(appointment.createdAt).toISOString(),
  });
}

const patchSchema = z.object({
  status: z.enum(["scheduled", "approved", "completed", "cancelled"]),
  notes:  z.string().max(500).optional(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session) return unauthorized();

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON");

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.errors[0]?.message ?? "Validation error");

  await connectToDatabase();
  const appointment = await Appointment.collection.findOne({ _id: new Types.ObjectId(id) });
  if (!appointment) return notFound();

  const isAdmin = session.user.role === Role.ADMIN;
  const isCreator = appointment.createdBy?.toString() === session.user.id;
  if (!isAdmin && !isCreator) return forbidden();

  const currentStatus = appointment.activityHistory?.at(-1)?.status;
  if (currentStatus === "completed" || currentStatus === "cancelled")
    return forbidden("Cannot update a completed or cancelled appointment");

  const mongoSession = await mongoose.startSession();
  try {
    await mongoSession.withTransaction(async () => {
      await Appointment.collection.findOneAndUpdate(
        { _id: new Types.ObjectId(id) },
        { $push: { activityHistory: { status: parsed.data.status, note: parsed.data.notes || "", changedAt: new Date() } } },
        { returnDocument: "after", session: mongoSession },
      );
    });
  } finally {
    await mongoSession.endSession();
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session) return unauthorized();

  await connectToDatabase();
  const appointment = await Appointment.collection.findOne({ _id: new Types.ObjectId(id) });
  if (!appointment) return notFound();

  const isAdmin = session.user.role === Role.ADMIN;
  const isCreator = appointment.createdBy?.toString() === session.user.id;
  if (!isAdmin && !isCreator) return forbidden();

  const currentStatus = appointment.activityHistory?.at(-1)?.status;
  if (currentStatus === "completed") return forbidden("Cannot delete a completed appointment");

  await Appointment.deleteOne({ _id: new Types.ObjectId(id) });
  return NextResponse.json({ success: true });
}
