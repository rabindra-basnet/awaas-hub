import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/client/query-client";
import { Appointment, AppointmentForm, AppointmentStatus } from "@/types";
import { toast } from "sonner";

// /* =========================
//    READ (ALL)
// ========================= */
// export function useAppointments() {
//   return useQuery({
//     queryKey: ["appointments"],
//     queryFn: async () => {
//       const res = await fetch("/api/appointments");
//       if (!res.ok) throw new Error("Failed to fetch appointments");
//       return res.json();
//     },

//     onError: (err: any) =>
//       toast.error(err?.message || "Failed to fetch appointments"),
//   });
// }

/* =========================
   READ (SINGLE)
========================= */

export function useAppointment(id: string) {
  return useQuery<any, Error>({
    queryKey: ["appointment", id],
    queryFn: async () => {
      const res = await fetch(`/api/appointments/${id}`);
      if (!res.ok) throw new Error("Failed to fetch appointment");
      return res.json();
    },
    enabled: !!id,
    onError: (err: any) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to fetch appointment",
      );
    },
  } as any);
}

/* =========================
   CREATE
========================= */
export function useCreateAppointment() {
  return useMutation({
    mutationFn: async (data: AppointmentForm) => {
      const res = await fetch("/api/appointments/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create appointment");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Appointment created successfully!");
    },
    onError: (err: any) =>
      toast.error(err?.message || "Failed to create appointment"),
  });
}

/* =========================
   UPDATE (FULL)
========================= */
export function useUpdateAppointment() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AppointmentForm }) => {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update appointment");
      return res.json();
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointment", vars.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Appointment updated successfully!");
    },
    onError: (err: any) =>
      toast.error(err?.message || "Failed to update appointment"),
  });
}

/* =========================
   UPDATE (STATUS)
========================= */
export function useUpdateAppointmentStatus() {
  return useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: AppointmentStatus;
      notes: string;
    }) => {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointment", vars.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Appointment status updated!");
    },
    onError: (err: any) =>
      toast.error(err?.message || "Failed to update status"),
  });
}

/* =========================
   DELETE
========================= */
export function useDeleteAppointment() {
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete appointment");
      return res.json();
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.removeQueries({ queryKey: ["appointment", id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Appointment deleted successfully!");
    },
    onError: (err: any) =>
      toast.error(err?.message || "Failed to delete appointment"),
  });
}
