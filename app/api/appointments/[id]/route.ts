import { NextResponse } from "next/server";
import { Permission, requirePermission, Role } from "@/lib/rbac";
import { Types } from "mongoose";
import { badRequest, forbidden, notFound, unauthorized } from "@/lib/error";
import { getServerSession } from "@/lib/server/getSession";
import { Appointment } from "@/lib/models/Appointment";

/* =========================
   READ (single)
========================= */
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession();
  if (!session) {
    return unauthorized();
  }

  requirePermission(session.user.role as Role, Permission.MANAGE_APPOINTMENTS);

  const { id } = await params;

  if (!Types.ObjectId.isValid(id)) {
    return badRequest("Invalid ID");
  }

  const appointment = await Appointment.findById(id);
  if (!appointment) return notFound();

  // Only participants or admin can view
  const userId = session?.user.id.toString();
  const isParticipant = appointment.participants
    .filter(Boolean)
    .some((_id: any) => _id.toString() === userId);

  if (!isParticipant && session.user.role !== Role.ADMIN) {
    return forbidden();
  }
  console.log(appointment);
  return NextResponse.json(appointment);
}

/* =========================
   UPDATE (full)
========================= */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession();
  if (!session) {
    return unauthorized();
  }

  requirePermission(session?.user.role as Role, Permission.MANAGE_APPOINTMENTS);
  const { id } = await params;

  const body = await req.json();

  const appointment = await Appointment.findById(id);
  if (!appointment) {
    return notFound();
  }

  // Only creator or admin can edit
  if (
    appointment.createdBy.toString() !== session.user.id &&
    session.user.role !== Role.ADMIN
  ) {
    return forbidden();
  }

  const updated = await Appointment.findByIdAndUpdate(id, body, {
    new: true,
  });

  return NextResponse.json(updated);
}

/* =========================
   UPDATE (status)
========================= */
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

  // Prevent changing status if appointment is already completed or cancelled
  if (
    appointment.status === "completed" ||
    appointment.status === "cancelled"
  ) {
    return forbidden("Cannot modify a completed or cancelled appointment");
  }

  const userId = session.user.id;

  // SELLER: can approve or cancel
  // BUYER: can cancel only
  if (session.user.role === Role.BUYER && status === "completed") {
    return forbidden("Buyer cannot mark appointment as completed");
  }

  const isParticipant = appointment.participants
    .filter(Boolean)
    .some((id: any) => id.toString() === userId);

  if (!isParticipant && session.user.role !== Role.ADMIN) {
    return forbidden();
  }
  appointment.participants = appointment.participants.filter(Boolean);
  appointment.status = status;
  appointment.notes = notes;
  await appointment.save();

  return NextResponse.json(appointment);
}


/* =========================
   DELETE
========================= */
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

  // Cannot delete if appointment is completed
  if (appointment.status === "completed") {
    return forbidden("Cannot delete a completed appointment");
  }

  // Only creator or admin can delete
  if (
    appointment.createdBy.toString() !== session.user.id &&
    session.user.role !== Role.ADMIN
  ) {
    return forbidden();
  }

  await Appointment.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
