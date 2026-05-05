import { NextResponse } from "next/server";
import { requirePermission, Permission, Role } from "@/lib/rbac";
import { getServerSession } from "@/lib/server/getSession";
import { Appointment } from "@/lib/models/Appointment";
import { unauthorized } from "@/lib/error";
import { getSignedUrlForDownload } from "@/lib/server/r2-client";
import Files from "@/lib/models/Files";

export async function GET() {
  const session = await getServerSession();
  if (!session) return unauthorized();

  requirePermission(session.user.role as Role, Permission.MANAGE_APPOINTMENTS);

  const appointments = await Appointment.find({
    participants: session.user.id,
  })
    .sort({ date: 1 })
    .lean();

  const enrichedAppointments = await Promise.all(
    appointments.map(async (appointment: any) => {
      const propertyId = appointment.property;
      let imageUrl: string | null = null;

      if (propertyId) {
        const file = await Files.findOne({ propertyId })
          .sort({ createdAt: 1 })
          .lean();
        if (file?.storedName) {
          imageUrl = await getSignedUrlForDownload(file.storedName);
        }
      }

      return { ...appointment, imageUrl };
    }),
  );

  return NextResponse.json({
    message: "Appointments fetched successfully",
    data: enrichedAppointments,
  });
}
