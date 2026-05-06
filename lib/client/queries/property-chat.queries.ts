import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DirectChatMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: "buyer" | "seller";
  content: string;
  readBy: string[];
  createdAt: string;
}

export interface DirectChatConversation {
  _id: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  propertyId: string;
  propertyTitle: string;
  lastMessage: string;
  lastMessageAt: string | null;
  unreadBySeller: number;
  unreadByBuyer: number;
  createdAt: string;
}

export interface DirectChatThread {
  conversation: DirectChatConversation | null;
  messages: DirectChatMessage[];
}

// ── Buyer: own thread ─────────────────────────────────────────────────────────

export function usePropertyDirectChat(propertyId: string, sellerId: string) {
  return useQuery({
    queryKey: ["property-chat", propertyId],
    queryFn: async (): Promise<DirectChatThread> => {
      const res = await fetch(
        `/api/property-chat?propertyId=${encodeURIComponent(propertyId)}&sellerId=${encodeURIComponent(sellerId)}`,
      );
      if (!res.ok) throw new Error("Failed to load chat");
      return res.json();
    },
    staleTime: 30_000,
    enabled: !!propertyId && !!sellerId,
  });
}

export function useSendDirectMessage(
  propertyId: string,
  sellerId: string,
  propertyTitle: string = "",
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch("/api/property-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, propertyId, sellerId, propertyTitle }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { message?: string }).message ?? "Failed to send message");
      }
      return res.json() as Promise<{ message: DirectChatMessage; conversationId: string }>;
    },

    onMutate: async (content) => {
      await queryClient.cancelQueries({ queryKey: ["property-chat", propertyId] });
      const prev = queryClient.getQueryData<DirectChatThread>(["property-chat", propertyId]);

      const optimistic: DirectChatMessage = {
        _id: `optimistic-${Date.now()}`,
        conversationId: prev?.conversation?._id ?? "",
        senderId: "me",
        senderName: "You",
        senderRole: "buyer",
        content,
        readBy: ["me"],
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<DirectChatThread>(["property-chat", propertyId], (old) =>
        old ? { ...old, messages: [...old.messages, optimistic] } : old,
      );

      return { prev };
    },

    onError: (_err, _vars, context) => {
      if (context?.prev)
        queryClient.setQueryData(["property-chat", propertyId], context.prev);
    },

    onSuccess: (data) => {
      queryClient.setQueryData<DirectChatThread>(["property-chat", propertyId], (old) => {
        if (!old) return old;
        const withoutOptimistic = old.messages.filter(
          (m) => !m._id.startsWith("optimistic-"),
        );
        const alreadyExists = withoutOptimistic.some((m) => m._id === data.message._id);
        return {
          ...old,
          messages: alreadyExists
            ? withoutOptimistic
            : [...withoutOptimistic, data.message],
        };
      });
    },
  });
}

// ── Seller: inbox ─────────────────────────────────────────────────────────────

export function useSellerChatInbox(propertyId: string) {
  return useQuery({
    queryKey: ["seller-chat-inbox", propertyId],
    queryFn: async (): Promise<{ conversations: DirectChatConversation[] }> => {
      const res = await fetch(
        `/api/property-chat/seller-inbox?propertyId=${encodeURIComponent(propertyId)}`,
      );
      if (!res.ok) throw new Error("Failed to load inbox");
      return res.json();
    },
    staleTime: 0,
    enabled: !!propertyId,
  });
}

// ── Seller/Admin: single conversation ────────────────────────────────────────

export function useSellerConversation(conversationId: string | null) {
  return useQuery({
    queryKey: ["seller-conversation", conversationId],
    queryFn: async (): Promise<DirectChatThread> => {
      const res = await fetch(`/api/property-chat/${conversationId}`);
      if (!res.ok) throw new Error("Failed to load conversation");
      return res.json();
    },
    enabled: !!conversationId,
    staleTime: 0,
  });
}

export function useSellerReply(conversationId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/property-chat/${conversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { message?: string }).message ?? "Failed to send reply");
      }
      return res.json() as Promise<{ message: DirectChatMessage }>;
    },

    onMutate: async (content) => {
      await queryClient.cancelQueries({
        queryKey: ["seller-conversation", conversationId],
      });
      const prev = queryClient.getQueryData<DirectChatThread>([
        "seller-conversation",
        conversationId,
      ]);

      const optimistic: DirectChatMessage = {
        _id: `optimistic-${Date.now()}`,
        conversationId: conversationId ?? "",
        senderId: "me",
        senderName: "You",
        senderRole: "seller",
        content,
        readBy: ["me"],
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<DirectChatThread>(
        ["seller-conversation", conversationId],
        (old) =>
          old ? { ...old, messages: [...old.messages, optimistic] } : old,
      );

      return { prev };
    },

    onError: (_err, _vars, context) => {
      if (context?.prev)
        queryClient.setQueryData(
          ["seller-conversation", conversationId],
          context.prev,
        );
    },

    onSuccess: (data, _vars, context) => {
      queryClient.setQueryData<DirectChatThread>(
        ["seller-conversation", conversationId],
        (old) => {
          if (!old) return old;
          const withoutOptimistic = old.messages.filter(
            (m) => !m._id.startsWith("optimistic-"),
          );
          const alreadyExists = withoutOptimistic.some(
            (m) => m._id === data.message._id,
          );
          return {
            ...old,
            messages: alreadyExists
              ? withoutOptimistic
              : [...withoutOptimistic, data.message],
          };
        },
      );
      // refresh inbox unread counts
      const prev = context?.prev;
      const propertyId = prev?.conversation?.propertyId ?? "";
      if (propertyId) {
        queryClient.invalidateQueries({ queryKey: ["seller-chat-inbox", propertyId] });
      }
    },
  });
}

// ── Supabase Realtime: per-conversation channel ───────────────────────────────

export function useDirectChatChannel(
  conversationId: string | undefined,
  queryKey: unknown[],
) {
  const queryClient = useQueryClient();

  const handleMessage = useCallback(
    (msg: DirectChatMessage) => {
      queryClient.setQueryData<DirectChatThread>(queryKey, (old) => {
        if (!old) return old;
        if (old.messages.some((m) => m._id === msg._id)) return old;
        return {
          ...old,
          messages: [
            ...old.messages.filter((m) => !m._id.startsWith("optimistic-")),
            msg,
          ],
        };
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queryClient, JSON.stringify(queryKey)],
  );

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`propchat-${conversationId}`)
      .on(
        "broadcast",
        { event: "new-message" },
        ({ payload }: { payload: { message: DirectChatMessage } }) => {
          handleMessage(payload.message);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, handleMessage]);
}

// ── Supabase Realtime: seller inbox ───────────────────────────────────────────

export function useSellerInboxChannel(
  currentUserId: string | undefined,
  propertyId: string,
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel(`seller-inbox-${currentUserId}`)
      .on(
        "broadcast",
        { event: "new-message" },
        ({
          payload,
        }: {
          payload: {
            message: DirectChatMessage;
            conversation: Partial<DirectChatConversation> & { isNew?: boolean };
          };
        }) => {
          const convData = payload.conversation;

          // Update inbox list
          queryClient.setQueryData<{ conversations: DirectChatConversation[] }>(
            ["seller-chat-inbox", propertyId],
            (old) => {
              if (!old) {
                return { conversations: [convData as DirectChatConversation] };
              }
              const exists = old.conversations.some((c) => c._id === convData._id);
              if (exists) {
                return {
                  conversations: old.conversations.map((c) =>
                    c._id === convData._id
                      ? {
                          ...c,
                          lastMessage: convData.lastMessage ?? c.lastMessage,
                          lastMessageAt: convData.lastMessageAt ?? c.lastMessageAt,
                          unreadBySeller: c.unreadBySeller + 1,
                        }
                      : c,
                  ),
                };
              }
              return {
                conversations: [convData as DirectChatConversation, ...old.conversations],
              };
            },
          );

          // Also update the open conversation if it matches
          if (convData._id) {
            queryClient.setQueryData<DirectChatThread>(
              ["seller-conversation", convData._id],
              (old) => {
                if (!old) return old;
                if (old.messages.some((m) => m._id === payload.message._id)) return old;
                return {
                  ...old,
                  messages: [
                    ...old.messages.filter((m) => !m._id.startsWith("optimistic-")),
                    payload.message,
                  ],
                };
              },
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, queryClient, propertyId]);
}

// ── Supabase Realtime: admin inbox (buyer messages on a property) ─────────────

export function usePropertyAdminInboxChannel(
  isAdmin: boolean,
  propertyId: string,
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAdmin || !propertyId) return;

    const channel = supabase
      .channel(`admin-inbox-${propertyId}`)
      .on(
        "broadcast",
        { event: "new-message" },
        ({
          payload,
        }: {
          payload: {
            message: DirectChatMessage;
            conversation: Partial<DirectChatConversation> & { isNew?: boolean };
          };
        }) => {
          const convData = payload.conversation;

          queryClient.setQueryData<{ conversations: DirectChatConversation[] }>(
            ["seller-chat-inbox", propertyId],
            (old) => {
              if (!old) return { conversations: [convData as DirectChatConversation] };
              const exists = old.conversations.some((c) => c._id === convData._id);
              if (exists) {
                return {
                  conversations: old.conversations.map((c) =>
                    c._id === convData._id
                      ? {
                          ...c,
                          lastMessage: convData.lastMessage ?? c.lastMessage,
                          lastMessageAt: convData.lastMessageAt ?? c.lastMessageAt,
                          unreadBySeller: c.unreadBySeller + 1,
                        }
                      : c,
                  ),
                };
              }
              return { conversations: [convData as DirectChatConversation, ...old.conversations] };
            },
          );

          if (convData._id) {
            queryClient.setQueryData<DirectChatThread>(
              ["seller-conversation", convData._id],
              (old) => {
                if (!old) return old;
                if (old.messages.some((m) => m._id === payload.message._id)) return old;
                return {
                  ...old,
                  messages: [
                    ...old.messages.filter((m) => !m._id.startsWith("optimistic-")),
                    payload.message,
                  ],
                };
              },
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, propertyId, queryClient]);
}

// ── Supabase Realtime: buyer notifications (seller replied) ───────────────────

export function useBuyerChatChannel(buyerId: string | undefined, propertyId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!buyerId) return;

    const channel = supabase
      .channel(`buyer-chat-${buyerId}`)
      .on(
        "broadcast",
        { event: "seller-reply" },
        ({ payload }: { payload: { message: DirectChatMessage } }) => {
          // Append to the open chat thread if cached
          queryClient.setQueryData<DirectChatThread>(
            ["property-chat", propertyId],
            (old) => {
              if (!old) return old;
              if (old.messages.some((m) => m._id === payload.message._id)) return old;
              return {
                ...old,
                messages: [
                  ...old.messages.filter((m) => !m._id.startsWith("optimistic-")),
                  payload.message,
                ],
              };
            },
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [buyerId, queryClient, propertyId]);
}
