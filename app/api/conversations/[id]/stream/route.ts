// app/api/conversations/[id]/stream/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/server/getSession";
import { Conversation, Message } from "@/lib/models/Conversation";
import { unauthorized, forbidden } from "@/lib/error";
import { getDb } from "@/lib/server/db";

// In-memory registry of SSE clients per conversation
// Map<conversationId, Set<ReadableStreamController>>
const clients = new Map<string, Set<ReadableStreamDefaultController>>();

export function addClient(
  convId: string,
  ctrl: ReadableStreamDefaultController,
) {
  if (!clients.has(convId)) clients.set(convId, new Set());
  clients.get(convId)!.add(ctrl);
}

export function removeClient(
  convId: string,
  ctrl: ReadableStreamDefaultController,
) {
  clients.get(convId)?.delete(ctrl);
  if (clients.get(convId)?.size === 0) clients.delete(convId);
}

export function broadcastToConversation(convId: string, data: object) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  clients.get(convId)?.forEach((ctrl) => {
    try {
      ctrl.enqueue(new TextEncoder().encode(payload));
    } catch {
      // client disconnected
    }
  });
}

/**
 * GET /api/conversations/[id]/stream
 * SSE endpoint — streams new messages and typing events to connected clients.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await getDb();
  const session = await getServerSession();
  if (!session) return unauthorized();

  const { id: convId } = await params;

  // Verify the user belongs to this conversation
  const conversation = await Conversation.findById(convId).lean();
  if (!conversation) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const userId = session.user.id;
  const isMember =
    conversation.buyerId === userId || conversation.sellerId === userId;
  if (!isMember) return forbidden();

  // Set up SSE stream
  let controller: ReadableStreamDefaultController;

  const stream = new ReadableStream({
    start(ctrl) {
      controller = ctrl;
      addClient(convId, ctrl);

      // Send a heartbeat immediately to confirm connection
      const heartbeat = `data: ${JSON.stringify({ type: "connected" })}\n\n`;
      ctrl.enqueue(new TextEncoder().encode(heartbeat));
    },
    cancel() {
      removeClient(convId, controller);
    },
  });

  // Heartbeat every 25s to keep connection alive through proxies
  const heartbeatInterval = setInterval(() => {
    try {
      const ping = `data: ${JSON.stringify({ type: "ping" })}\n\n`;
      controller.enqueue(new TextEncoder().encode(ping));
    } catch {
      clearInterval(heartbeatInterval);
    }
  }, 25_000);

  req.signal.addEventListener("abort", () => {
    clearInterval(heartbeatInterval);
    removeClient(convId, controller);
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // disable Nginx buffering
    },
  });
}
