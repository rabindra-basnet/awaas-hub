"use client";

import { queryOptions, useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const chatKeys = {
  all:         ["chat"] as const,
  property:    (propertyId: string) => ["chat", "property", propertyId] as const,
  conversation: (id: string) => ["chat", "conversation", id] as const,
  inbox:       () => ["chat", "inbox"] as const,
};

async function throwIfError(res: Response | Promise<Response>) {
  const r = await res;
  if (!r.ok) {
    const body = await r.json().catch(() => ({}));
    throw new Error(body.message || `Request failed: ${r.status}`);
  }
  return r.json();
}

export const propertyChatOptions = (propertyId: string) =>
  queryOptions({
    queryKey: chatKeys.property(propertyId),
    queryFn: () => throwIfError(fetch(`/api/property-chat?propertyId=${propertyId}`)),
  });

export const usePropertyChat = (propertyId: string) => useSuspenseQuery(propertyChatOptions(propertyId));

export const conversationOptions = (id: string) =>
  queryOptions({
    queryKey: chatKeys.conversation(id),
    queryFn: () => throwIfError(fetch(`/api/property-chat/${id}`)),
  });

export const useConversation = (id: string) => useSuspenseQuery(conversationOptions(id));

export const sellerInboxOptions = () =>
  queryOptions({
    queryKey: chatKeys.inbox(),
    queryFn: () => throwIfError(fetch("/api/property-chat/seller-inbox")),
  });

export const useSellerInbox = () => useSuspenseQuery(sellerInboxOptions());

export const useSendMessage = (propertyId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      throwIfError(fetch("/api/property-chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content, propertyId }) })),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: chatKeys.property(propertyId) });
      qc.invalidateQueries({ queryKey: chatKeys.inbox() });
    },
  });
};

export const useSellerReply = (conversationId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      throwIfError(fetch(`/api/property-chat/${conversationId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content }) })),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: chatKeys.conversation(conversationId) });
      qc.invalidateQueries({ queryKey: chatKeys.inbox() });
    },
  });
};
