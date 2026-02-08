// "use client";

// import { useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { toast } from "sonner";

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";

// import Loading from "@/components/loading";
// import {
//   useAppointment,
//   useDeleteAppointment,
//   useUpdateAppointmentStatus,
// } from "@/lib/client/queries/appointments.queries";
// import { Badge, badgeVariants } from "@/components/ui/badge";
// import { VariantProps } from "class-variance-authority";
// import { usePropertyImages } from "@/lib/client/queries/properties.queries";

// type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

// const StatusBadge = ({ status }: { status: string }) => {
//   const variantMap: Record<string, BadgeVariant> = {
//     scheduled: "default",
//     approved: "success",
//     completed: "secondary",
//     cancelled: "destructive",
//   };

//   return (
//     <Badge variant={variantMap[status] || "outline"} className="capitalize">
//       {status}
//     </Badge>
//   );
// };

// export default function AppointmentDetailPage() {
//   const { id } = useParams<{ id: string }>();
//   const router = useRouter();

//   const { data: appointment, isLoading: loadingAppointment } =
//     useAppointment(id);
//   const { data: images = [] } = usePropertyImages(appointment?.propertyId);

//   const del = useDeleteAppointment();
//   const updateStatus = useUpdateAppointmentStatus();

//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [statusToUpdate, setStatusToUpdate] = useState<
//     "approved" | "cancelled" | null
//   >(null);
//   const [note, setNote] = useState("");
//   const [alertOpen, setAlertOpen] = useState(false);

//   if (loadingAppointment) return <Loading message="Fetching data..." />;
//   if (!appointment) return <p>Appointment not found</p>;

//   const firstImage = images.length > 0 ? images[0].url : null;

//   const isScheduled = appointment.status === "scheduled";
//   const isApproved = appointment.status === "approved";
//   const isCancelled = appointment.status === "cancelled";
//   const isCompleted = appointment.status === "completed";

//   const handleOpenDialog = (status: "approved" | "cancelled") => {
//     setStatusToUpdate(status);
//     setDialogOpen(true);
//   };

//   const handleSubmitStatus = () => {
//     if (!statusToUpdate) return;
//     updateStatus.mutate(
//       { id, status: statusToUpdate, notes: note },
//       {
//         onSuccess: () => {
//           toast.success(`Appointment ${statusToUpdate} successfully!`);
//           setDialogOpen(false);
//           setNote("");
//         },
//         onError: (err: any) =>
//           toast.error(err?.message || "Failed to update status"),
//       },
//     );
//   };

//   const handleDelete = () => {
//     del.mutate(id, {
//       onSuccess: () => router.push("/dashboard"),
//       onError: (err: any) =>
//         toast.error(err?.message || "Failed to delete appointment"),
//     });
//   };

//   return (
//     <div className="max-w-xl mx-auto py-10 space-y-6">
//       {/* Card */}
//       <div className="border rounded-lg shadow-md p-6 space-y-4 bg-card">
//         {/* Header */}
//         <div className="flex justify-between items-start">
//           <h1 className="text-2xl font-bold">{appointment.title}</h1>
//           <StatusBadge status={appointment.status} />
//         </div>

//         {/* Property Image */}
//         <div className="h-48 w-full rounded overflow-hidden border border-border bg-muted flex items-center justify-center">
//           {firstImage ? (
//             <img
//               src={firstImage}
//               alt="Property"
//               className="h-full w-full object-cover"
//             />
//           ) : (
//             <span className="text-muted-foreground">No Image</span>
//           )}
//         </div>

//         {/* Details */}
//         <div className="space-y-1">
//           <p>
//             <span className="font-medium">Date:</span>{" "}
//             {new Date(appointment.date).toLocaleString()}
//           </p>
//           <p>
//             <span className="font-medium">Notes:</span>{" "}
//             {appointment.notes || "-"}
//           </p>
//         </div>

//         {/* Actions */}
//         <div className="flex flex-wrap gap-2 mt-4">
//           {!isCompleted && !isCancelled && (
//             <>
//               {isScheduled && (
//                 <>
//                   <Button onClick={() => handleOpenDialog("approved")}>
//                     Approve
//                   </Button>
//                   <Button
//                     variant="destructive"
//                     onClick={() => handleOpenDialog("cancelled")}
//                   >
//                     Cancel
//                   </Button>

//                   <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
//                     <Button
//                       variant="outline"
//                       onClick={() => setAlertOpen(true)}
//                     >
//                       Delete
//                     </Button>
//                     <AlertDialogContent>
//                       <AlertDialogHeader>
//                         <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//                         <p>
//                           This action will permanently delete the appointment.
//                         </p>
//                       </AlertDialogHeader>
//                       <AlertDialogFooter>
//                         <AlertDialogCancel>Cancel</AlertDialogCancel>
//                         <AlertDialogAction onClick={handleDelete}>
//                           Delete
//                         </AlertDialogAction>
//                       </AlertDialogFooter>
//                     </AlertDialogContent>
//                   </AlertDialog>
//                 </>
//               )}
//               {isApproved && (
//                 <Button
//                   onClick={() =>
//                     updateStatus.mutate(
//                       { id, status: "completed", notes: appointment.notes },
//                       {
//                         onSuccess: () =>
//                           toast.success("Appointment completed!"),
//                         onError: (err: any) =>
//                           toast.error(err?.message || "Failed"),
//                       },
//                     )
//                   }
//                 >
//                   Complete
//                 </Button>
//               )}
//             </>
//           )}
//         </div>
//       </div>

//       {/* Dialog for Notes */}
//       <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//         <DialogContent className="max-w-md">
//           <DialogHeader className="flex items-center gap-4">
//             <div className="h-16 w-16 border rounded overflow-hidden shrink-0">
//               {firstImage ? (
//                 <img
//                   src={firstImage}
//                   alt="Property"
//                   className="h-full w-full object-cover"
//                 />
//               ) : (
//                 <span className="flex items-center justify-center h-full w-full text-muted-foreground">
//                   No Image
//                 </span>
//               )}
//             </div>
//             <DialogTitle className="text-lg font-bold">
//               {appointment.title}
//             </DialogTitle>
//           </DialogHeader>

//           <div className="space-y-2 mt-4">
//             <label className="block font-medium">Add Note</label>
//             <Input
//               value={note}
//               onChange={(e) => setNote(e.target.value)}
//               placeholder="Add a note for this action"
//             />
//           </div>

//           <DialogFooter className="mt-4 flex justify-end gap-2">
//             <Button variant="outline" onClick={() => setDialogOpen(false)}>
//               Cancel
//             </Button>
//             <Button onClick={handleSubmitStatus}>
//               {statusToUpdate === "approved" ? "Approve" : "Cancel"}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  MessageSquare,
  Trash2,
  CheckCircle2,
  ChevronRight,
  X,
} from "lucide-react";

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
import {
  useAppointment,
  useDeleteAppointment,
  useUpdateAppointmentStatus,
} from "@/lib/client/queries/appointments.queries";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { VariantProps } from "class-variance-authority";
import { usePropertyImages } from "@/lib/client/queries/properties.queries";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

const StatusBadge = ({ status }: { status: string }) => {
  const variantMap: Record<string, BadgeVariant> = {
    scheduled: "default",
    approved: "success",
    completed: "secondary",
    cancelled: "destructive",
  };

  return (
    <Badge
      variant={variantMap[status] || "outline"}
      className="capitalize px-3 py-1"
    >
      {status}
    </Badge>
  );
};

export default function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: appointment, isLoading: loadingAppointment } =
    useAppointment(id);
  const { data: images = [] } = usePropertyImages(appointment?.propertyId);

  const del = useDeleteAppointment();
  const updateStatus = useUpdateAppointmentStatus();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState<
    "approved" | "cancelled" | null
  >(null);
  const [note, setNote] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);

  if (loadingAppointment) return <Loading message="Fetching data..." />;
  if (!appointment)
    return <p className="text-center py-20">Appointment not found</p>;

  const firstImage = images.length > 0 ? images[0].url : null;
  const isScheduled = appointment.status === "scheduled";
  const isApproved = appointment.status === "approved";
  const isCancelled = appointment.status === "cancelled";
  const isCompleted = appointment.status === "completed";

  const handleDelete = () => {
    del.mutate(id, {
      onSuccess: () => router.push("/dashboard"),
      onError: (err: any) =>
        toast.error(err?.message || "Failed to delete appointment"),
    });
  };
  // Mock data for timeline
  const timeline = [
    {
      date: appointment?.createdAt,
      label: "Created",
      note: "Initial request sent.",
    },
    appointment.notes && {
      date: appointment?.createdAt,
      label: "Updated",
      note: appointment.notes,
    },
  ].filter(Boolean);

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
        onError: (err: any) => toast.error(err?.message || "Failed"),
      },
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Main Details (Takes 2/3 space) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border rounded-xl shadow-sm overflow-hidden bg-card">
            <div className="relative h-72 w-full bg-muted">
              {firstImage ? (
                <Image
                  src={firstImage}
                  alt="Property"
                  fill
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No Image
                </div>
              )}
              <div className="absolute top-4 right-4">
                <StatusBadge status={appointment.status} />
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    {appointment.title}
                  </h1>
                  <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {new Date(appointment.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {new Date(appointment.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                {isScheduled && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setAlertOpen(true)}
                    className=" text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                )}
              </div>

              <Separator />

              <div className="flex flex-wrap gap-3">
                {!isCompleted && !isCancelled && (
                  <>
                    {isScheduled && (
                      <>
                        <Button onClick={() => handleOpenDialog("approved")}>
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleOpenDialog("cancelled")}
                          className="text-red-500 border-red-200 hover:bg-red-50"
                        >
                          <X /> Cancel
                        </Button>
                      </>
                    )}
                    {isApproved && (
                      <Button
                        className="w-full"
                        onClick={() =>
                          updateStatus.mutate({
                            id,
                            status: "completed",
                            notes: appointment.notes,
                          })
                        }
                      >
                        Complete
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Timeline (Takes 1/3 space) */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> Activity History
          </h3>

          <div className="relative space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
            {timeline &&
              timeline.map((item, idx) => (
                <div key={idx} className="relative pl-8">
                  {/* Dot */}
                  <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-background bg-primary" />

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">
                        {item && item?.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(item! && item?.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-md border border-border/50">
                      {item && item?.note}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Reusable Dialogs stay here */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Appointment?</AlertDialogTitle>
            <p className="text-sm text-muted-foreground">
              This action is permanent.
            </p>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Status</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Back
            </Button>
            <Button
              onClick={handleSubmitStatus}
              variant={
                statusToUpdate === "approved" ? "default" : "destructive"
              }
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
