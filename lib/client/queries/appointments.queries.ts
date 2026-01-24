import { queryOptions, useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/client/query-client";
import { Appointment, AppointmentForm, AppointmentStatus } from "@/types";
import { toast } from "sonner";

/* =========================
   QUERY KEYS
========================= */
export const appointmentKeys = {
  all: ["appointments"] as const,
  lists: () => [...appointmentKeys.all] as const,
  detail: (id: string) => ["appointment", id] as const,
};

/* =========================
   READ (SINGLE)
========================= */
export const appointmentQuery = (id: string) =>
  queryOptions<Appointment>({
    queryKey: appointmentKeys.detail(id),
    queryFn: async () => {
      const res = await fetch(`/api/appointments/${id}`);
      if (!res.ok) throw new Error("Failed to fetch appointment");
      return res.json();
    },
    enabled: !!id,
  });

export const useAppointment = (id: string) =>
  useQuery({
    ...appointmentQuery(id),
    // onError: (err: Error) =>
    //   toast.error(err.message || "Failed to fetch appointment"),
  });

/* =========================
   CREATE
========================= */
export const useCreateAppointment = () =>
  useMutation({
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
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.lists(),
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Appointment created successfully!");
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to create appointment"),
  });

/* =========================
   UPDATE (FULL)
========================= */
export const useUpdateAppointment = () =>
  useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AppointmentForm }) => {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to update appointment");
      return res.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Appointment updated successfully!");
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to update appointment"),
  });

/* =========================
   UPDATE (STATUS)
========================= */
export const useUpdateAppointmentStatus = () =>
  useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: AppointmentStatus;
      notes: string | undefined;
    }) => {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Appointment status updated!");
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to update status"),
  });

/* =========================
   DELETE
========================= */
export const useDeleteAppointment = () =>
  useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete appointment");
      return res.json();
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.lists(),
      });
      queryClient.removeQueries({
        queryKey: appointmentKeys.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Appointment deleted successfully!");
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to delete appointment"),
  });
