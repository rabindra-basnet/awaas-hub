import { NextResponse } from "next/server";
import { requirePermission, Permission, Role } from "@/lib/rbac";
import { getServerSession } from "@/lib/server/getSession";
import { Appointment } from "@/lib/models/Appointment";
import { badRequest, notFound, unauthorized } from "@/lib/error";
import { Property } from "@/lib/models/Property"; // assuming you have a Property model

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) return unauthorized();

  requirePermission(session.user.role as Role, Permission.MANAGE_APPOINTMENTS);

  const body = await req.json();
  const { propertyId } = body;

  if (!propertyId) return badRequest("Property ID is required");

  // Fetch the property to get the sellerId
  const property = await Property.findById(propertyId);
  if (!property) return notFound("Property not found");

  // Participants: buyer is logged-in user, seller from property
  const participants = [session.user.id, property.sellerId].filter(Boolean);

  const appointment = await Appointment.create({
    ...body,
    createdBy: session.user.id, // the user creating the appointment
    participants,
  });

  return NextResponse.json(appointment);
}
