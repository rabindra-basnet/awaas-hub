import { connectToDatabase } from "@/shared/lib/db";
import { Appointment } from "@/features/appointments/models/appointment.model";
import { Role } from "@/features/auth/rbac/access";
import { Types } from "mongoose";

export type AppointmentListItem = {
  _id: string;
  title: string;
  type: string;
  date: string;
  propertyId: string | null;
  createdBy: string;
  image: string | null;
  currentStatus: string;
  createdAt: string;
};

export async function fetchAppointments(userId: string, role: Role): Promise<AppointmentListItem[]> {
  await connectToDatabase();

  const query = role === Role.ADMIN ? {} : {
    $or: [
      { createdBy: new Types.ObjectId(userId) },
      { participants: new Types.ObjectId(userId) },
    ],
  };

  const appointments = await Appointment.collection
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();

  return appointments.map((a) => ({
    _id: a._id.toString(),
    title: a.title,
    type: a.type,
    date: new Date(a.date).toISOString(),
    propertyId: a.propertyId?.toString() ?? null,
    createdBy: a.createdBy?.toString() ?? "",
    image: a.image ?? null,
    currentStatus: a.activityHistory?.at(-1)?.status ?? "scheduled",
    createdAt: new Date(a.createdAt).toISOString(),
  }));
}

export async function fetchAppointmentById(id: string) {
  await connectToDatabase();
  const a = await Appointment.collection.findOne({ _id: new Types.ObjectId(id) });
  if (!a) return null;
  return {
    _id: a._id.toString(),
    title: a.title,
    type: a.type,
    date: new Date(a.date).toISOString(),
    propertyId: a.propertyId?.toString() ?? null,
    participants: (a.participants ?? []).map((p: any) => p.toString()),
    createdBy: a.createdBy?.toString() ?? "",
    image: a.image ?? null,
    activityHistory: a.activityHistory ?? [],
    currentStatus: a.activityHistory?.at(-1)?.status ?? "scheduled",
    createdAt: new Date(a.createdAt).toISOString(),
  };
}
