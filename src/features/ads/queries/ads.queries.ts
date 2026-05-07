"use client";

import { queryOptions, useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AdSlot } from "@/features/ads/models/ad.model";

export const adKeys = {
  all:   ["ads"] as const,
  slot:  (slot: string) => ["ads", "slot", slot] as const,
  admin: () => ["ads", "admin"] as const,
  detail: (id: string) => ["ads", "detail", id] as const,
};

async function throwIfError(res: Response | Promise<Response>) {
  const r = await res;
  if (!r.ok) {
    const body = await r.json().catch(() => ({}));
    throw new Error(body.message || `Request failed: ${r.status}`);
  }
  return r.json();
}

export const adsBySlotOptions = (slot: AdSlot) =>
  queryOptions({
    queryKey: adKeys.slot(slot),
    queryFn: () => throwIfError(fetch(`/api/ads/all?slot=${slot}`)),
    staleTime: 5 * 60 * 1000,
  });

export const useAdsBySlot = (slot: AdSlot) => useSuspenseQuery(adsBySlotOptions(slot));

export const adminAdsOptions = () =>
  queryOptions({
    queryKey: adKeys.admin(),
    queryFn: () => throwIfError(fetch("/api/ads")),
  });

export const useAdminAds = () => useSuspenseQuery(adminAdsOptions());

export const useCreateAd = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: object) =>
      throwIfError(fetch("/api/ads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })),
    onSuccess: () => qc.invalidateQueries({ queryKey: adKeys.admin() }),
  });
};

export const useUpdateAd = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      throwIfError(fetch(`/api/ads/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })),
    onSuccess: () => qc.invalidateQueries({ queryKey: adKeys.admin() }),
  });
};

export const useDeleteAd = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => throwIfError(fetch(`/api/ads/${id}`, { method: "DELETE" })),
    onSuccess: () => qc.invalidateQueries({ queryKey: adKeys.admin() }),
  });
};

export const useTrackAd = () =>
  useMutation({
    mutationFn: ({ id, event }: { id: string; event: "impression" | "click" }) =>
      fetch(`/api/ads/${id}/${event}`, { method: "POST" }),
  });
