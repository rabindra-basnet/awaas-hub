import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SupportMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: "buyer" | "seller" | "admin";
  content: string;
  readBy: string[];
  createdAt: string;
}

export interface SupportConversation {
  _id: string;
  userId: string;
  userName: string;
  userRole: "buyer" | "seller";
  propertyId: string;
  propertyTitle: string;
  lastMessage: string;
  lastMessageAt: string | null;
  status: "open" | "closed";
  unreadByAdmin: number;
  unreadByUser: number;
  createdAt: string;
}

export interface SupportThread {
  conversation: SupportConversation;
  messages: SupportMessage[];
}

// ── User: own support thread ──────────────────────────────────────────────────

export const supportThreadQuery = (propertyId: string = "", propertyTitle: string = "") => ({
  queryKey: ["support-thread", propertyId],
  queryFn: async (): Promise<SupportThread> => {
    const url = propertyId
      ? `/api/support?propertyId=${encodeURIComponent(propertyId)}&propertyTitle=${encodeURIComponent(propertyTitle)}`
      : "/api/support";
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to load support thread");
    return res.json();
  },
  staleTime: 30_000,
});

export function useSupportThread(propertyId: string = "", propertyTitle: string = "") {
  return useQuery(supportThreadQuery(propertyId, propertyTitle));
}

export function useSendSupportMessage(
  propertyId: string = "",
  propertyTitle: string = "",
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, propertyId, propertyTitle }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to send message");
      }
      return res.json() as Promise<{ message: SupportMessage }>;
    },

    onMutate: async (content) => {
      await queryClient.cancelQueries({ queryKey: ["support-thread", propertyId] });
      const prev = queryClient.getQueryData<SupportThread>(["support-thread", propertyId]);

      const optimistic: SupportMessage = {
        _id: `optimistic-${Date.now()}`,
        conversationId: prev?.conversation._id ?? "",
        senderId: "me",
        senderName: "You",
        senderRole: prev?.conversation.userRole ?? "buyer",
        content,
        readBy: ["me"],
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<SupportThread>(["support-thread", propertyId], (old) =>
        old ? { ...old, messages: [...old.messages, optimistic] } : old,
      );

      return { prev };
    },

    onError: (_err, _vars, context) => {
      if (context?.prev)
        queryClient.setQueryData(["support-thread", propertyId], context.prev);
    },

    onSuccess: (data) => {
      queryClient.setQueryData<SupportThread>(["support-thread", propertyId], (old) => {
        if (!old) return old;
        const withoutOptimistic = old.messages.filter(
          (m) => !m._id.startsWith("optimistic-"),
        );
        // Supabase may have already added the real message via broadcast; deduplicate
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

// ── Admin: inbox (all conversations) ─────────────────────────────────────────

export function useAdminSupportInbox(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["support-inbox"],
    queryFn: async (): Promise<{ conversations: SupportConversation[] }> => {
      const res = await fetch("/api/support/inbox");
      if (!res.ok) throw new Error("Failed to load inbox");
      return res.json();
    },
    staleTime: 0,
    enabled: options?.enabled ?? true,
  });
}

// ── Admin: single conversation ────────────────────────────────────────────────

export function useAdminConversation(id: string | null) {
  return useQuery({
    queryKey: ["support-conversation", id],
    queryFn: async (): Promise<SupportThread> => {
      const res = await fetch(`/api/support/${id}`);
      if (!res.ok) throw new Error("Failed to load conversation");
      return res.json();
    },
    enabled: !!id,
    staleTime: 0,
  });
}

export function useAdminReply(conversationId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/support/${conversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to send reply");
      }
      return res.json() as Promise<{ message: SupportMessage }>;
    },

    onMutate: async (content) => {
      await queryClient.cancelQueries({
        queryKey: ["support-conversation", conversationId],
      });
      const prev = queryClient.getQueryData<SupportThread>([
        "support-conversation",
        conversationId,
      ]);

      const optimistic: SupportMessage = {
        _id: `optimistic-${Date.now()}`,
        conversationId: conversationId ?? "",
        senderId: "admin",
        senderName: "Admin",
        senderRole: "admin",
        content,
        readBy: ["admin"],
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<SupportThread>(
        ["support-conversation", conversationId],
        (old) =>
          old ? { ...old, messages: [...old.messages, optimistic] } : old,
      );

      return { prev };
    },

    onError: (_err, _vars, context) => {
      if (context?.prev)
        queryClient.setQueryData(
          ["support-conversation", conversationId],
          context.prev,
        );
    },

    onSuccess: (data) => {
      queryClient.setQueryData<SupportThread>(
        ["support-conversation", conversationId],
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
      // Refresh inbox unread counts
      queryClient.invalidateQueries({ queryKey: ["support-inbox"] });
    },
  });
}

// ── Supabase Realtime: per-conversation channel ───────────────────────────────

export function useSupportChannel(
  conversationId: string | undefined,
  queryKey: unknown[],
) {
  const queryClient = useQueryClient();

  const handleMessage = useCallback(
    (msg: SupportMessage) => {
      queryClient.setQueryData<SupportThread>(queryKey, (old) => {
        if (!old) return old;
        const alreadyExists = old.messages.some((m) => m._id === msg._id);
        if (alreadyExists) return old;
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
      .channel(`support-${conversationId}`)
      .on(
        "broadcast",
        { event: "new-message" },
        ({ payload }: { payload: { message: SupportMessage } }) => {
          handleMessage(payload.message);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, handleMessage]);
}

// ── User: unread admin reply notifications ────────────────────────────────────

export interface UserNotificationsData {
  conversations: SupportConversation[];
  totalUnread: number;
}

export function useUserNotifications(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["user-notifications"],
    queryFn: async (): Promise<UserNotificationsData> => {
      const res = await fetch("/api/support/user-notifications");
      if (!res.ok) throw new Error("Failed to load notifications");
      return res.json();
    },
    staleTime: 0,
    enabled: options?.enabled ?? true,
  });
}

export function useUserNotificationsChannel(userId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`user-notifications-${userId}`)
      .on(
        "broadcast",
        { event: "admin-reply" },
        ({
          payload,
        }: {
          payload: {
            message: SupportMessage;
            conversation: Partial<SupportConversation>;
          };
        }) => {
          // Bump notification count in the bell cache
          queryClient.setQueryData<UserNotificationsData>(
            ["user-notifications"],
            (old) => {
              const convId = payload.conversation._id;
              if (!old) {
                return {
                  conversations: [payload.conversation as SupportConversation],
                  totalUnread: 1,
                };
              }
              const exists = old.conversations.some((c) => c._id === convId);
              const conversations = exists
                ? old.conversations.map((c) =>
                    c._id === convId
                      ? {
                          ...c,
                          unreadByUser: (c.unreadByUser ?? 0) + 1,
                          lastMessage: payload.message.content.slice(0, 80),
                          lastMessageAt: payload.message.createdAt,
                        }
                      : c,
                  )
                : [payload.conversation as SupportConversation, ...old.conversations];
              return {
                conversations,
                totalUnread: conversations.reduce(
                  (sum, c) => sum + (c.unreadByUser ?? 0),
                  0,
                ),
              };
            },
          );

          // Append message to the open chat thread if it's cached
          const propertyId = payload.conversation.propertyId ?? "";
          queryClient.setQueryData<SupportThread>(
            ["support-thread", propertyId],
            (old) => {
              if (!old) return old;
              const alreadyExists = old.messages.some(
                (m) => m._id === payload.message._id,
              );
              if (alreadyExists) return old;
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
  }, [userId, queryClient]);
}

// ── Supabase Realtime: admin inbox channel ────────────────────────────────────

export function useAdminInboxChannel() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("admin-support-inbox")
      .on(
        "broadcast",
        { event: "new-conversation" },
        ({ payload }: { payload: { conversation: SupportConversation } }) => {
          queryClient.setQueryData<{ conversations: SupportConversation[] }>(
            ["support-inbox"],
            (old) => {
              if (!old) return { conversations: [payload.conversation] };
              const exists = old.conversations.some(
                (c) => c._id === payload.conversation._id,
              );
              if (exists) return old;
              return {
                conversations: [payload.conversation, ...old.conversations],
              };
            },
          );
        },
      )
      .on(
        "broadcast",
        { event: "new-message" },
        ({ payload }: { payload: { message: SupportMessage } }) => {
          // Update lastMessage preview + unreadByAdmin in inbox
          queryClient.setQueryData<{ conversations: SupportConversation[] }>(
            ["support-inbox"],
            (old) => {
              if (!old) return old;
              return {
                conversations: old.conversations.map((c) =>
                  c._id === payload.message.conversationId
                    ? {
                      ...c,
                      lastMessage: payload.message.content.slice(0, 80),
                      lastMessageAt: payload.message.createdAt,
                      unreadByAdmin:
                        payload.message.senderRole !== "admin"
                          ? c.unreadByAdmin + 1
                          : c.unreadByAdmin,
                    }
                    : c,
                ),
              };
            },
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
