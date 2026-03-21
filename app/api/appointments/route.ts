import { NextResponse } from "next/server";
import { requirePermission, Permission, Role } from "@/lib/rbac";
import { getServerSession } from "@/lib/server/getSession";
import { Appointment } from "@/lib/models/Appointment";
import { unauthorized } from "@/lib/error";
import { getSignedUrlForDownload } from "@/lib/server/r2-client";
import Files from "@/lib/models/Files";
// import { getSignedUrlForDownload } from "@/lib/server/storage";

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
      const propertyId = appointment.property; // 👈 assuming this exists

      let imageUrl: string | null = null;

      if (propertyId) {
        // 🔥 find first file linked to this property
        const file = await Files.findOne({
          attached_to_id: propertyId, // 👈 adjust field if needed
        })
          .sort({ createdAt: 1 }) // first image
          .lean();

        if (file?.storedName) {
          imageUrl = await getSignedUrlForDownload(file.storedName);
        }
      }

      return {
        ...appointment,
        imageUrl, // 👈 directly usable in frontend
      };
    }),
  );

  return NextResponse.json({
    message: "Appointments fetched successfully",
    data: enrichedAppointments,
  });
}

// // export async function POST(req: Request) {
// //   const session = await getServerSession();
// //   if (!session) return unauthorized();

// //   requirePermission(session.user.role as Role, Permission.MANAGE_APPOINTMENTS);
// //   const body = await req.json();

// //   console.log(`Body from the post ${body}`);

// //   const appointment = await Appointment.create({
// //     ...body,
// //     createdBy: session.user.id,
// //     participants: [session.user.id, body.buyerId],
// //   });

// //   return NextResponse.json(appointment);
// // }
