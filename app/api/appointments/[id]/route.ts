import { NextResponse } from "next/server";
import { Permission, requirePermission, Role } from "@/lib/rbac";
import { Types } from "mongoose";
import { badRequest, forbidden, notFound, unauthorized } from "@/lib/error";
import { getServerSession } from "@/lib/server/getSession";
import { Appointment } from "@/lib/models/Appointment";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession();
  if (!session) return unauthorized();

  requirePermission(session.user.role as Role, Permission.MANAGE_APPOINTMENTS);

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) return badRequest("Invalid ID");

  const appointment = await Appointment.findById(id);
  if (!appointment) return notFound();

  const userId = session?.user.id.toString();
  const isParticipant = appointment.participants
    .filter(Boolean)
    .some((_id: any) => _id.toString() === userId);

  if (!isParticipant && session.user.role !== Role.ADMIN) return forbidden();

  return NextResponse.json(appointment);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession();
  if (!session) return unauthorized();

  requirePermission(session?.user.role as Role, Permission.MANAGE_APPOINTMENTS);

  const { id } = await params;
  const body = await req.json();

  const appointment = await Appointment.findById(id);
  if (!appointment) return notFound();

  if (
    appointment.createdBy.toString() !== session.user.id &&
    session.user.role !== Role.ADMIN
  ) {
    return forbidden();
  }

  const updated = await Appointment.findByIdAndUpdate(id, body, { new: true });
  return NextResponse.json(updated);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession();
  if (!session) return unauthorized();

  requirePermission(session.user.role as Role, Permission.MANAGE_APPOINTMENTS);

  const { id } = await params;
  const { status, notes } = await req.json();

  const appointment = await Appointment.findById(id);
  if (!appointment) return notFound();

  if (
    appointment.status === "completed" ||
    appointment.status === "cancelled"
  ) {
    return forbidden("Cannot modify a completed or cancelled appointment");
  }

  if (session.user.role === Role.BUYER && status === "completed") {
    return forbidden("Buyer cannot mark appointment as completed");
  }

  const userId = session.user.id;
  const isParticipant = appointment.participants
    .filter(Boolean)
    .some((pid: any) => pid.toString() === userId);

  if (!isParticipant && session.user.role !== Role.ADMIN) return forbidden();

  appointment.participants = appointment.participants.filter(Boolean);
  appointment.status = status;
  appointment.notes = notes;
  await appointment.save();

  return NextResponse.json(appointment);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession();
  if (!session) return unauthorized();

  requirePermission(session.user.role as Role, Permission.MANAGE_APPOINTMENTS);

  const { id } = await params;
  const appointment = await Appointment.findById(id);
  if (!appointment) return notFound();

  if (appointment.status === "completed") {
    return forbidden("Cannot delete a completed appointment");
  }

  if (
    appointment.createdBy.toString() !== session.user.id &&
    session.user.role !== Role.ADMIN
  ) {
    return forbidden();
  }

  await Appointment.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
