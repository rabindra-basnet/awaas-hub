"use client";

import {
  queryOptions,
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
  useMutation,
  useQueryClient,
  infiniteQueryOptions,
} from "@tanstack/react-query";

const PAGE_LIMIT = 12;

/* ── Query Keys ── */
export const propertyKeys = {
  all:      ["properties"] as const,
  infinite: (filters?: object) => ["properties", "infinite", filters] as const,
  detail:   (id: string)      => ["property", id] as const,
};

/* ── Helpers ── */
async function throwIfError(res: Response) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

/* ── Infinite List ── */
export const infinitePropertiesOptions = (filters?: {
  category?: string;
  status?: string;
  search?: string;
}) =>
  infiniteQueryOptions({
    queryKey: propertyKeys.infinite(filters),
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ limit: String(PAGE_LIMIT) });
      if (pageParam) params.set("cursor", pageParam as string);
      if (filters?.category) params.set("category", filters.category);
      if (filters?.status)   params.set("status",   filters.status);
      if (filters?.search)   params.set("search",   filters.search);
      return throwIfError(await fetch(`/api/properties?${params}`));
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage: any) => lastPage.nextCursor ?? undefined,
  });

export const useInfiniteProperties = (filters?: Parameters<typeof infinitePropertiesOptions>[0]) =>
  useSuspenseInfiniteQuery(infinitePropertiesOptions(filters));

/* ── Single ── */
export const propertyDetailOptions = (id: string) =>
  queryOptions({
    queryKey: propertyKeys.detail(id),
    queryFn: () => throwIfError(fetch(`/api/properties/${id}`)).then((r) => r),
  });

export const useProperty = (id: string) => useSuspenseQuery(propertyDetailOptions(id));

/* ── Toggle Favorite — optimistic ── */
export const useToggleFavorite = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ propertyId, isFav }: { propertyId: string; isFav: boolean }) =>
      throwIfError(
        await fetch(`/api/properties/${propertyId}/favorite`, {
          method: isFav ? "DELETE" : "POST",
        }),
      ),
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
      throwIfError(
        fetch("/api/properties", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: propertyKeys.all }),
  });
};

/* ── Delete ── */
export const useDeleteProperty = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      throwIfError(fetch(`/api/properties/${id}`, { method: "DELETE" })),
    onSuccess: () => qc.invalidateQueries({ queryKey: propertyKeys.all }),
  });
};
