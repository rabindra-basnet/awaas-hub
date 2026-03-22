// lib/client/queries/chat.queries.ts

import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { useEffect, useRef, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface ChatMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: "buyer" | "seller" | "admin";
  content: string;
  readBy: string[];
  createdAt: string;
}

export interface Conversation {
  _id: string;
  propertyId: string;
  propertyTitle: string;
  buyerId: string;
  sellerId: string;
  lastMessage: string;
  lastMessageAt: string | null;
  createdAt: string;
}

export interface ConversationData {
  conversation: Conversation;
  messages: ChatMessage[];
}

// ── Fetch conversation + messages ─────────────────────────────────────────────
async function fetchConversation(
  propertyId: string,
): Promise<ConversationData> {
  const res = await fetch(`/api/conversations?propertyId=${propertyId}`);
  if (!res.ok) throw new Error("Failed to load conversation");
  return res.json();
}

export function useConversation(propertyId: string, enabled = true) {
  return useQuery({
    queryKey: ["conversation", propertyId],
    queryFn: () => fetchConversation(propertyId),
    enabled: enabled && !!propertyId,
    staleTime: 0,
  });
}

// ── Send message mutation ─────────────────────────────────────────────────────
async function sendMessage({
  propertyId,
  content,
}: {
  propertyId: string;
  content: string;
}): Promise<{ message: ChatMessage }> {
  const res = await fetch("/api/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ propertyId, content }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? "Failed to send message");
  }
  return res.json();
}

export function useSendMessage(propertyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => sendMessage({ propertyId, content }),

    // Optimistic update — show message immediately
    onMutate: async (content) => {
      await queryClient.cancelQueries({
        queryKey: ["conversation", propertyId],
      });

      const prev = queryClient.getQueryData<ConversationData>([
        "conversation",
        propertyId,
      ]);

      const optimistic: ChatMessage = {
        _id: `optimistic-${Date.now()}`,
        conversationId: prev?.conversation._id ?? "",
        senderId: "me",
        senderName: "You",
        senderRole: "buyer",
        content,
        readBy: ["me"],
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<ConversationData>(
        ["conversation", propertyId],
        (old) =>
          old ? { ...old, messages: [...old.messages, optimistic] } : old,
      );

      return { prev };
    },

    onError: (_err, _vars, context) => {
      if (context?.prev) {
        queryClient.setQueryData(["conversation", propertyId], context.prev);
      }
    },

    onSuccess: (data) => {
      // Replace optimistic message with real one
      queryClient.setQueryData<ConversationData>(
        ["conversation", propertyId],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            messages: [
              ...old.messages.filter((m) => !m._id.startsWith("optimistic-")),
              data.message,
            ],
          };
        },
      );
    },
  });
}

// ── Typing indicator ──────────────────────────────────────────────────────────
export function useSendTyping(conversationId: string | undefined) {
  const typingTimeout = useRef<Window.Timeout>(null);

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (!conversationId) return;
      fetch(`/api/conversations/${conversationId}/typing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isTyping }),
      }).catch(() => {});
    },
    [conversationId],
  );

  const onKeyPress = useCallback(() => {
    sendTyping(true);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => sendTyping(false), 2000);
  }, [sendTyping]);

  return { onKeyPress, sendTyping };
}

// ── SSE subscription ──────────────────────────────────────────────────────────
export function useChatSSE(
  conversationId: string | undefined,
  propertyId: string,
  onTyping: (data: {
    senderId: string;
    senderName: string;
    isTyping: boolean;
  }) => void,
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;

    const es = new EventSource(`/api/conversations/${conversationId}/stream`);

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "message") {
          // Append real message, remove any optimistic duplicate
          queryClient.setQueryData<ConversationData>(
            ["conversation", propertyId],
            (old) => {
              if (!old) return old;
              const alreadyExists = old.messages.some(
                (m) => m._id === data.message._id,
              );
              if (alreadyExists) return old;
              return {
                ...old,
                messages: [
                  ...old.messages.filter(
                    (m) => !m._id.startsWith("optimistic-"),
                  ),
                  data.message,
                ],
              };
            },
          );
        }

        if (data.type === "typing") {
          onTyping({
            senderId: data.senderId,
            senderName: data.senderName,
            isTyping: data.isTyping,
          });
        }
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      // SSE will auto-reconnect; no action needed
    };

    return () => {
      es.close();
    };
  }, [conversationId, propertyId, queryClient, onTyping]);
}
