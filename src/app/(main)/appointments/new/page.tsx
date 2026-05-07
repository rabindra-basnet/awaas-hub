import { redirect } from "next/navigation";
import { getServerSession, isRealSession } from "@/features/auth/server/session";
import { Suspense } from "react";
import AppointmentForm from "@/features/appointments/components/appointment-form";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default async function NewAppointmentPage() {
  const session = await getServerSession();
  if (!isRealSession(session)) redirect("/login");

  return (
    <div className="h-full overflow-hidden p-6">
      <div className="h-full rounded-2xl overflow-hidden border border-border shadow-sm">
        <Suspense fallback={<Skeleton className="h-full w-full" />}>
          <AppointmentForm />
        </Suspense>
      </div>
    </div>
  );
}
