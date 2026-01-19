"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useAppointment,
  useDeleteAppointment,
  useUpdateAppointmentStatus,
} from "@/hooks/services/useAppointments";
import { useProperties } from "@/hooks/services/useProperties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Loading from "@/components/loading";

// Badge component for status
const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    scheduled: "bg-blue-100 text-blue-800",
    approved: "bg-green-100 text-green-800",
    completed: "bg-gray-200 text-gray-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: appointment, isLoading: loadingAppointment } =
    useAppointment(id);
  const { data: properties = [], isLoading: loadingProperties } =
    useProperties();

  const del = useDeleteAppointment();
  const updateStatus = useUpdateAppointmentStatus();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState<
    "approved" | "cancelled" | null
  >(null);
  const [note, setNote] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);

  if (loadingAppointment || loadingProperties)
    return <Loading message="Fetching data..." />;
  if (!appointment) return <p>Appointment not found</p>;

  const property = properties.find((p: any) => p._id === appointment.propertyId);

  const isScheduled = appointment.status === "scheduled";
  const isApproved = appointment.status === "approved";
  const isCancelled = appointment.status === "cancelled";
  const isCompleted = appointment.status === "completed";

  const handleOpenDialog = (status: "approved" | "cancelled") => {
    setStatusToUpdate(status);
    setDialogOpen(true);
  };

  const handleSubmitStatus = () => {
    if (!statusToUpdate) return;

    updateStatus.mutate(
      { id, status: statusToUpdate, notes: note },
      {
        onSuccess: () => {
          toast.success(`Appointment ${statusToUpdate} successfully!`);
          setDialogOpen(false);
          setNote("");
        },
        onError: (err: any) =>
          toast.error(err?.message || "Failed to update status"),
      },
    );
  };

  const handleDelete = () => {
    del.mutate(id, {
      onSuccess: () => router.push("/dashboard"),
      onError: (err: any) =>
        toast.error(err?.message || "Failed to delete appointment"),
    });
  };

  return (
    <div className="max-w-xl mx-auto py-10">
      {/* Card */}
      <div className="border rounded-lg shadow-md p-6 space-y-4 bg-white">
        {/* Header */}
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold">{appointment.title}</h1>
          <StatusBadge status={appointment.status} />
        </div>

        {/* Property Image */}
        <div className="h-48 w-full rounded overflow-hidden border">
          {property?.images?.[0] ? (
            <img
              src={property.images[0]}
              alt={property.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full w-full text-gray-400">
              No Image
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-1">
          <p>
            <span className="font-medium">Date:</span>{" "}
            {new Date(appointment.date).toLocaleString()}
          </p>
          <p>
            <span className="font-medium">Notes:</span>{" "}
            {appointment.notes || "-"}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mt-4">
          {!isCompleted && !isCancelled && (
            <>
              {isScheduled && (
                <>
                  <Button onClick={() => handleOpenDialog("approved")}>
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleOpenDialog("cancelled")}
                  >
                    Cancel
                  </Button>
                  <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
                    <Button
                      variant="outline"
                      onClick={() => setAlertOpen(true)}
                    >
                      Delete
                    </Button>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <p>
                          This action will permanently delete the appointment.
                        </p>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}

              {isApproved && (
                <Button
                  onClick={() =>
                    updateStatus.mutate(
                      { id, status: "completed", notes: appointment.notes },
                      {
                        onSuccess: () =>
                          toast.success("Appointment completed!"),
                        onError: (err: any) =>
                          toast.error(err?.message || "Failed"),
                      },
                    )
                  }
                >
                  Complete
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Dialog for adding notes */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader className="flex items-center gap-4">
            <div className="h-16 w-16 border rounded overflow-hidden shrink-0">
              {property?.images?.[0] ? (
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full text-gray-400">
                  No Image
                </div>
              )}
            </div>
            <DialogTitle className="text-lg font-bold">
              {appointment.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2 mt-4">
            <label className="block font-medium">Add Note</label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note for this action"
            />
          </div>

          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitStatus}>
              {statusToUpdate === "approved" ? "Approve" : "Cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
