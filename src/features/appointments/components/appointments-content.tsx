"use client";

import { useAppointments } from "@/features/appointments/queries/appointments.queries";
import { useUpdateAppointmentStatus, useDeleteAppointment } from "@/features/appointments/queries/appointments.queries";
import { Calendar, Clock, CheckCircle2, XCircle, Plus, AlertCircle } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";

const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  scheduled: { label: "Scheduled", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400", icon: Clock },
  approved:  { label: "Approved",  className: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400", icon: CheckCircle2 },
  completed: { label: "Completed", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400", icon: XCircle },
};

export default function AppointmentsContent() {
  const { data: appointments } = useAppointments();
  const updateStatus = useUpdateAppointmentStatus();
  const deleteAppt = useDeleteAppointment();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your property viewings and inspections</p>
        </div>
        <Button size="sm" render={<Link href="/appointments/new" />} nativeButton={false}><Plus className="w-4 h-4 mr-1.5" /> New Appointment</Button>
      </div>

      {appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20 gap-4 text-muted-foreground">
          <Calendar className="w-12 h-12 opacity-20" />
          <p className="text-sm">No appointments yet</p>
          <Button variant="outline" size="sm" render={<Link href="/appointments/new" />} nativeButton={false}>Schedule one</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appt: any) => {
            const status = appt.currentStatus || "scheduled";
            const cfg = statusConfig[status] || statusConfig.scheduled;
            const StatusIcon = cfg.icon;

            return (
              <div key={appt._id} className="rounded-xl border border-border bg-card p-5 flex flex-col sm:flex-row gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm truncate">{appt.title}</h3>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${cfg.className}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{appt.type}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(appt.date), "PPp")}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0 self-start">
                  {status === "scheduled" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-200 hover:bg-green-50"
                      onClick={() =>
                        updateStatus.mutate({ id: appt._id, status: "approved" }, {
                          onSuccess: () => toast.success("Appointment approved"),
                          onError: (e) => toast.error(e.message),
                        })
                      }
                      disabled={updateStatus.isPending}
                    >
                      Approve
                    </Button>
                  )}
                  {(status === "scheduled" || status === "approved") && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-purple-600 border-purple-200 hover:bg-purple-50"
                      onClick={() =>
                        updateStatus.mutate({ id: appt._id, status: "completed" }, {
                          onSuccess: () => toast.success("Marked as completed"),
                          onError: (e) => toast.error(e.message),
                        })
                      }
                      disabled={updateStatus.isPending}
                    >
                      Complete
                    </Button>
                  )}
                  {status !== "cancelled" && status !== "completed" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() =>
                        deleteAppt.mutate(appt._id, {
                          onSuccess: () => toast.success("Appointment cancelled"),
                          onError: (e) => toast.error(e.message),
                        })
                      }
                      disabled={deleteAppt.isPending}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
