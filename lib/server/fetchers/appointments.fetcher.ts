import { Appointment } from "@/lib/models/Appointment";
import Files from "@/lib/models/Files";
import { getSignedUrlForDownload } from "@/lib/server/r2-client";
import { getDb } from "@/lib/server/db";
import type { Session } from "@/lib/server/auth";

export async function fetchAppointments(session: Session): Promise<any[]> {
  await getDb();

  const appointments = await Appointment.find({
    participants: session.user.id,
  })
    .sort({ date: 1 })
    .lean();

  return Promise.all(
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
}
