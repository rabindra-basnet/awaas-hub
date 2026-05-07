import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { getQueryClient } from "@/shared/lib/query-client";
import { getServerSession, isRealSession } from "@/features/auth/server/session";
import { fetchAppointments } from "@/features/appointments/server/appointments.fetcher";
import { Role } from "@/features/auth/rbac/access";
import AppointmentsContent from "@/features/appointments/components/appointments-content";

export default async function AppointmentsPage() {
  const session = await getServerSession();
  if (!isRealSession(session)) redirect("/login");

  const qc = getQueryClient();
  await qc.prefetchQuery({
    queryKey: ["appointments", "list"],
    queryFn:  () => fetchAppointments(session.user.id, session.user.role as Role),
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <AppointmentsContent />
    </HydrationBoundary>
  );
}
