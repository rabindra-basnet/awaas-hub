import { NextResponse } from "next/server";
import { getServerSession } from "@/features/auth/server/session";
import { fetchAppointments } from "@/features/appointments/server/appointments.fetcher";
import { unauthorized } from "@/shared/lib/error";
import { Role } from "@/features/auth/rbac/access";

export async function GET() {
  const session = await getServerSession();
  if (!session) return unauthorized();

  const data = await fetchAppointments(session.user.id, session.user.role as Role);
  return NextResponse.json(data);
}
