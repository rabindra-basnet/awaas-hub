"use client";

import { queryOptions, useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const supportKeys = {
  all:           ["support"] as const,
  thread:        (propertyId?: string) => ["support", "thread", propertyId ?? ""] as const,
  inbox:         () => ["support", "inbox"] as const,
  notifications: () => ["support", "notifications"] as const,
};

async function throwIfError(res: Response | Promise<Response>) {
  const r = await res;
  if (!r.ok) {
    const body = await r.json().catch(() => ({}));
    throw new Error(body.message || `Request failed: ${r.status}`);
  }
  return r.json();
}

export const supportThreadOptions = (propertyId?: string) =>
  queryOptions({
    queryKey: supportKeys.thread(propertyId),
    queryFn: () => throwIfError(fetch(`/api/support${propertyId ? `?propertyId=${propertyId}` : ""}`)),
  });

export const useSupportThread = (propertyId?: string) => useSuspenseQuery(supportThreadOptions(propertyId));

export const supportInboxOptions = () =>
  queryOptions({
    queryKey: supportKeys.inbox(),
    queryFn: () => throwIfError(fetch("/api/support/inbox")),
  });

export const useSupportInbox = () => useSuspenseQuery(supportInboxOptions());

export const supportNotificationsOptions = () =>
  queryOptions({
    queryKey: supportKeys.notifications(),
    queryFn: () => throwIfError(fetch("/api/support/user-notifications")),
    refetchInterval: 30_000,
  });

export const useSupportNotifications = () => useSuspenseQuery(supportNotificationsOptions());

export const useSendSupportMessage = (propertyId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      throwIfError(fetch("/api/support", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content, propertyId: propertyId ?? "" }) })),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: supportKeys.thread(propertyId) });
      qc.invalidateQueries({ queryKey: supportKeys.inbox() });
    },
  });
};

export const useAdminSupportReply = (conversationId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      throwIfError(fetch(`/api/support/${conversationId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content }) })),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: supportKeys.inbox() });
    },
  });
};
