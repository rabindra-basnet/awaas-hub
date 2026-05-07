"use client";

import { queryOptions, useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const fileKeys = {
  all:  ["files"] as const,
  list: () => [...fileKeys.all, "list"] as const,
  key:  (key: string) => [...fileKeys.all, key] as const,
};

async function throwIfError(res: Response | Promise<Response>) {
  const r = await res;
  if (!r.ok) {
    const body = await r.json().catch(() => ({}));
    throw new Error(body.message || `Request failed: ${r.status}`);
  }
  return r.json();
}

export const filesOptions = () =>
  queryOptions({
    queryKey: fileKeys.list(),
    queryFn: () => throwIfError(fetch("/api/files")),
  });

export const useFiles = () => useSuspenseQuery(filesOptions());

export const useRequestUpload = () =>
  useMutation({
    mutationFn: (data: { filename: string; mimetype: string; size: number; propertyId?: string; isPrivate?: boolean }) =>
      throwIfError(fetch("/api/files/upload", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })),
  });

export const useDeleteFile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (key: string) => throwIfError(fetch(`/api/files/${key}`, { method: "DELETE" })),
    onSuccess: () => qc.invalidateQueries({ queryKey: fileKeys.list() }),
  });
};
