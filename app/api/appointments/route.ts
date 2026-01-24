import { NextResponse } from "next/server";
import { requirePermission, Permission, Role } from "@/lib/rbac";
import { getServerSession } from "@/lib/server/getSession";
import { Appointment } from "@/lib/models/Appointment";
import { unauthorized } from "@/lib/error";

export async function GET() {
  const session = await getServerSession();
  if (!session) return unauthorized();

  requirePermission(session.user.role as Role, Permission.MANAGE_APPOINTMENTS);

  const d = await Appointment.find({ participants: session.user.id }).sort({
    date: 1,
  });

  return NextResponse.json({ message: "response" });
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
