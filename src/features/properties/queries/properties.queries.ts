"use client";

import {
  queryOptions,
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
  useMutation,
  useQueryClient,
  infiniteQueryOptions,
} from "@tanstack/react-query";
import { propertyKeys, PAGE_LIMIT } from "@/features/properties/lib/property-keys";

export { propertyKeys };

/* ── Helpers ── */
async function throwIfError(res: Response | Promise<Response>) {
  const r = await res;
  if (!r.ok) {
    const body = await r.json().catch(() => ({}));
    throw new Error(body.message || `Request failed: ${r.status}`);
  }
  return r.json();
}

export type PropertiesFilters = {
  category?: string;
  status?: string;
  search?: string;
};

/* ── Infinite List ── */
export const infinitePropertiesOptions = (filters?: PropertiesFilters) =>
  infiniteQueryOptions({
    queryKey: propertyKeys.infinite(filters),
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ limit: String(PAGE_LIMIT) });
      if (pageParam) params.set("cursor", pageParam as string);
      if (filters?.category) params.set("category", filters.category);
      if (filters?.status)   params.set("status",   filters.status);
      if (filters?.search)   params.set("search",   filters.search);
      return throwIfError(fetch(`/api/properties?${params}`));
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage: any) => lastPage.nextCursor ?? undefined,
  });

export const useInfiniteProperties = (filters?: PropertiesFilters) =>
  useSuspenseInfiniteQuery(infinitePropertiesOptions(filters));

/* ── Single ── */
export const propertyDetailOptions = (id: string) =>
  queryOptions({
    queryKey: propertyKeys.detail(id),
    queryFn: () => throwIfError(fetch(`/api/properties/${id}`)),
  });

export const useProperty = (id: string) => useSuspenseQuery(propertyDetailOptions(id));

/* ── Toggle Favorite ── */
export const useToggleFavorite = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ propertyId, isFav }: { propertyId: string; isFav: boolean }) =>
      throwIfError(fetch(`/api/properties/${propertyId}/favorite`, { method: isFav ? "DELETE" : "POST" })),
    onMutate: async ({ propertyId, isFav }) => {
      await qc.cancelQueries({ queryKey: propertyKeys.detail(propertyId) });
      const snap = qc.getQueryData(propertyKeys.detail(propertyId));
      qc.setQueryData(propertyKeys.detail(propertyId), (old: any) =>
        old ? { ...old, isFavorite: !isFav } : old,
      );
      return { snap };
    },
    onError: (_err, { propertyId }, ctx) => {
      if (ctx?.snap) qc.setQueryData(propertyKeys.detail(propertyId), ctx.snap);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: propertyKeys.all }),
  });
};

/* ── Create ── */
export const useCreateProperty = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: object) =>
      throwIfError(fetch("/api/properties/new", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })),
    onSuccess: () => qc.invalidateQueries({ queryKey: propertyKeys.all }),
  });
};

/* ── Update ── */
export const useUpdateProperty = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: object) =>
      throwIfError(fetch(`/api/properties/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: propertyKeys.detail(id) });
      qc.invalidateQueries({ queryKey: propertyKeys.all });
    },
  });
};

/* ── Delete ── */
export const useDeleteProperty = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => throwIfError(fetch(`/api/properties/${id}`, { method: "DELETE" })),
    onSuccess: () => qc.invalidateQueries({ queryKey: propertyKeys.all }),
  });
};
