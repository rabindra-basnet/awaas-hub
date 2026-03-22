// app/api/conversations/[id]/typing/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/server/getSession";
import { Conversation } from "@/lib/models/Conversation";
import { unauthorized, forbidden } from "@/lib/error";
import { getDb } from "@/lib/server/db";
import { broadcastToConversation } from "../stream/route";

/**
 * POST /api/conversations/[id]/typing
 * Body: { isTyping: boolean }
 * Broadcasts typing indicator to all other SSE clients in the conversation.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await getDb();
  const session = await getServerSession();
  if (!session) return unauthorized();

  const { id: convId } = await params;
  const { isTyping } = await req.json();

  const conversation = await Conversation.findById(convId).lean();
  if (!conversation) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const userId = session.user.id;
  const isMember =
    conversation.buyerId === userId || conversation.sellerId === userId;
  if (!isMember) return forbidden();

  // Broadcast typing event to other participants
  broadcastToConversation(convId, {
    type: "typing",
    senderId: userId,
    senderName: session.user.name ?? "User",
    isTyping,
  });

  return NextResponse.json({ ok: true });
}
