// // import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// // // ─── Types ────────────────────────────────────────────────────────────────────

// // export interface Ad {
// //   _id: string;
// //   title: string;
// //   slot: string;
// //   imageUrl?: string;
// //   htmlContent?: string;
// //   targetUrl: string;
// //   altText?: string;
// //   isActive: boolean;
// //   startDate?: string;
// //   endDate?: string;
// //   impressions: number;
// //   clicks: number;
// //   createdAt: string;
// //   updatedAt: string;
// // }

// // export interface CreateAdInput {
// //   title: string;
// //   slot: string;
// //   imageUrl?: string;
// //   htmlContent?: string;
// //   targetUrl: string;
// //   altText?: string;
// //   isActive?: boolean;
// //   startDate?: string | null;
// //   endDate?: string | null;
// // }

// // // ─── Query Keys ───────────────────────────────────────────────────────────────

// // export const adsKeys = {
// //   all: ["ads"] as const,
// //   list: () => [...adsKeys.all, "list"] as const,
// // };

// // // ─── Hooks ────────────────────────────────────────────────────────────────────

// // /** Fetch all ads for the admin management page */
// // export function useAds() {
// //   return useQuery<Ad[]>({
// //     queryKey: adsKeys.list(),
// //     queryFn: () => fetch("/api/ads/all").then((r) => r.json()),
// //   });
// // }

// // /** Create a new ad */
// // export function useCreateAd() {
// //   const qc = useQueryClient();
// //   return useMutation({
// //     mutationFn: (data: CreateAdInput) =>
// //       fetch("/api/ads", {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify(data),
// //       }).then((r) => r.json()),
// //     onSuccess: () => qc.invalidateQueries({ queryKey: adsKeys.list() }),
// //   });
// // }

// // /** Toggle active state or patch any field */
// // export function useUpdateAd() {
// //   const qc = useQueryClient();
// //   return useMutation({
// //     mutationFn: ({ id, ...data }: Partial<Ad> & { id: string }) =>
// //       fetch(`/api/ads/${id}`, {
// //         method: "PATCH",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify(data),
// //       }).then((r) => r.json()),
// //     onSuccess: () => qc.invalidateQueries({ queryKey: adsKeys.list() }),
// //   });
// // }

// // /** Delete an ad permanently */
// // export function useDeleteAd() {
// //   const qc = useQueryClient();
// //   return useMutation({
// //     mutationFn: (id: string) =>
// //       fetch(`/api/ads/${id}`, { method: "DELETE" }).then((r) => r.json()),
// //     onSuccess: () => qc.invalidateQueries({ queryKey: adsKeys.list() }),
// //   });
// // }

// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// // ─── Types ────────────────────────────────────────────────────────────────────

// export interface Ad {
//   _id: string;
//   title: string;
//   slot: string;
//   imageUrl?: string;
//   htmlContent?: string;
//   targetUrl: string;
//   altText?: string;
//   isActive: boolean;
//   startDate?: string;
//   endDate?: string;
//   impressions: number;
//   clicks: number;
//   createdAt: string;
//   updatedAt: string;
// }

// export interface CreateAdInput {
//   title: string;
//   slot: string;
//   imageUrl?: string;
//   htmlContent?: string;
//   targetUrl: string;
//   altText?: string;
//   isActive?: boolean;
//   startDate?: string | null;
//   endDate?: string | null;
// }

// // ─── Query Keys ───────────────────────────────────────────────────────────────

// export const adsKeys = {
//   all: ["ads"] as const,
//   list: () => [...adsKeys.all, "list"] as const,
// };

// // ─── Hooks ────────────────────────────────────────────────────────────────────

// /** Fetch all ads for the admin management page */
// export function useAds() {
//   return useQuery<Ad[]>({
//     queryKey: adsKeys.list(),
//     queryFn: async () => {
//       const r = await fetch("/api/ads/all");
//       if (!r.ok) return [];
//       const data = await r.json();
//       return Array.isArray(data) ? data : [];
//     },
//   });
// }

// /** Create a new ad */
// export function useCreateAd() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: (data: CreateAdInput) =>
//       fetch("/api/ads", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(data),
//       }).then((r) => r.json()),
//     onSuccess: () => qc.invalidateQueries({ queryKey: adsKeys.list() }),
//   });
// }

// /** Toggle active state or patch any field */
// export function useUpdateAd() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: ({ id, ...data }: Partial<Ad> & { id: string }) =>
//       fetch(`/api/ads/${id}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(data),
//       }).then((r) => r.json()),
//     onSuccess: () => qc.invalidateQueries({ queryKey: adsKeys.list() }),
//   });
// }

// /** Delete an ad permanently */
// export function useDeleteAd() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: (id: string) =>
//       fetch(`/api/ads/${id}`, { method: "DELETE" }).then((r) => r.json()),
//     onSuccess: () => qc.invalidateQueries({ queryKey: adsKeys.list() }),
//   });
// }

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Ad {
  _id: string;
  title: string;
  slot: string;
  imageUrl?: string;
  imageKey?: string;
  htmlContent?: string;
  targetUrl: string;
  altText?: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  impressions: number;
  clicks: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdInput {
  title: string;
  slot: string;
  imageUrl?: string;
  imageKey?: string;
  htmlContent?: string;
  targetUrl: string;
  altText?: string;
  isActive?: boolean;
  startDate?: string | null;
  endDate?: string | null;
}

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const adsKeys = {
  all: ["ads"] as const,
  list: () => [...adsKeys.all, "list"] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useAds() {
  return useQuery<Ad[]>({
    queryKey: adsKeys.list(),
    queryFn: async () => {
      const r = await fetch("/api/ads/all");
      if (!r.ok) return [];
      const data = await r.json();
      return Array.isArray(data) ? data : [];
    },
  });
}

export function useCreateAd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAdInput) =>
      fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json();
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adsKeys.list() });
      toast.success("Ad created successfully");
    },
    onError: () => toast.error("Failed to create ad"),
  });
}

export function useUpdateAd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Ad> & { id: string }) =>
      fetch(`/api/ads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json();
      }),

    // ── Optimistic update — switch flips instantly ──────────────────────────
    onMutate: async ({ id, ...data }) => {
      await qc.cancelQueries({ queryKey: adsKeys.list() });
      const previous = qc.getQueryData<Ad[]>(adsKeys.list());

      qc.setQueryData<Ad[]>(adsKeys.list(), (old = []) =>
        old.map((ad) => (ad._id === id ? { ...ad, ...data } : ad)),
      );

      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      // Roll back on failure
      if (ctx?.previous) {
        qc.setQueryData(adsKeys.list(), ctx.previous);
      }
      toast.error("Failed to update ad");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adsKeys.list() });
    },
  });
}

export function useDeleteAd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/ads/${id}`, { method: "DELETE" }).then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json();
      }),

    // ── Optimistic update — row disappears instantly ────────────────────────
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: adsKeys.list() });
      const previous = qc.getQueryData<Ad[]>(adsKeys.list());

      qc.setQueryData<Ad[]>(adsKeys.list(), (old = []) =>
        old.filter((ad) => ad._id !== id),
      );

      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(adsKeys.list(), ctx.previous);
      }
      toast.error("Failed to delete ad");
    },
    onSuccess: () => {
      toast.success("Ad deleted");
      qc.invalidateQueries({ queryKey: adsKeys.list() });
    },
  });
}
