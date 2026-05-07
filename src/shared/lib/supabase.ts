const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

async function _broadcast(channel: string, event: string, payload: object) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;
  await fetch(`${SUPABASE_URL}/realtime/v1/api/broadcast`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ messages: [{ topic: channel, event, payload }] }),
  }).catch(() => {});
}

export const broadcastDirectChatMessage = (conversationId: string, payload: object) =>
  _broadcast(`propchat-${conversationId}`, "message", payload);

export const broadcastSellerInboxUpdate = (sellerId: string, payload: object) =>
  _broadcast(`seller-inbox-${sellerId}`, "update", payload);

export const broadcastSupportMessage = (conversationId: string, payload: object) =>
  _broadcast(`support-${conversationId}`, "message", payload);

export const broadcastNewConversation = (payload: object) =>
  _broadcast("admin-support-inbox", "new_conversation", payload);

export const broadcastUserNotification = (userId: string, payload: object) =>
  _broadcast(`user-notifications-${userId}`, "notification", payload);

export const broadcastPropertyMessage = (conversationId: string, payload: object) =>
  _broadcast(`property-${conversationId}`, "message", payload);

export const broadcastPropertyTyping = (conversationId: string, payload: object) =>
  _broadcast(`property-${conversationId}`, "typing", payload);
