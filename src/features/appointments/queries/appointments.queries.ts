"use client";

import { queryOptions, useSuspenseQuery, useMutation, useQueryClient, infiniteQueryOptions } from "@tanstack/react-query";

import { appointmentKeys } from "@/features/appointments/lib/appointment-keys";
export { appointmentKeys };

async function throwIfError(res: Response | Promise<Response>) {
  const r = await res;
  if (!r.ok) {
    const body = await r.json().catch(() => ({}));
    throw new Error(body.message || `Request failed: ${r.status}`);
  }
  return r.json();
}

export const appointmentsOptions = () =>
  queryOptions({
    queryKey: appointmentKeys.list(),
    queryFn: () => throwIfError(fetch("/api/appointments")),
  });

export const useAppointments = () => useSuspenseQuery(appointmentsOptions());

export const appointmentDetailOptions = (id: string) =>
  queryOptions({
    queryKey: appointmentKeys.detail(id),
    queryFn: () => throwIfError(fetch(`/api/appointments/${id}`)),
  });

export const useAppointment = (id: string) => useSuspenseQuery(appointmentDetailOptions(id));

export const useCreateAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: object) =>
      throwIfError(fetch("/api/appointments/new", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })),
    onSuccess: () => qc.invalidateQueries({ queryKey: appointmentKeys.all }),
  });
};

export const useUpdateAppointmentStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) =>
      throwIfError(fetch(`/api/appointments/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, notes }) })),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: appointmentKeys.detail(id) });
      qc.invalidateQueries({ queryKey: appointmentKeys.list() });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

export const useDeleteAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => throwIfError(fetch(`/api/appointments/${id}`, { method: "DELETE" })),
    onSuccess: () => qc.invalidateQueries({ queryKey: appointmentKeys.all }),
  });
};
