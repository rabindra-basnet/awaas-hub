// Server-side Supabase helper — used only from API routes for broadcasting.
// Uses the REST broadcast endpoint so we never need to subscribe before sending.

export async function broadcastSupportMessage(
  conversationId: string,
  payload: object,
) {
  return _broadcast(`support-${conversationId}`, "new-message", payload);
}

export async function broadcastNewConversation(payload: object) {
  return _broadcast("admin-support-inbox", "new-conversation", payload);
}

export async function broadcastPropertyMessage(
  conversationId: string,
  payload: object,
) {
  return _broadcast(`property-${conversationId}`, "new-message", payload);
}

export async function broadcastPropertyTyping(
  conversationId: string,
  payload: object,
) {
  return _broadcast(`property-${conversationId}`, "typing", payload);
}

async function _broadcast(topic: string, event: string, payload: object) {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/realtime/v1/api/broadcast`;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!key) {
    console.error("[Supabase Broadcast] SUPABASE_SERVICE_ROLE_KEY is not set");
    return;
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      apikey: key,
    },
    body: JSON.stringify({ messages: [{ topic, event, payload }] }),
  });

  if (!res.ok) {
    console.error(
      `[Supabase Broadcast] ${res.status} on topic="${topic}"`,
      await res.text(),
    );
  } else {
    console.log(`[Supabase Broadcast] ✓ topic="${topic}" event="${event}"`);
  }
}
