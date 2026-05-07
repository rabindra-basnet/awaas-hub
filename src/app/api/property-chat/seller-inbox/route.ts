import { NextResponse } from "next/server";
import { getServerSession } from "@/features/auth/server/session";
import { connectToDatabase } from "@/shared/lib/db";
import { PropertyChatConversation } from "@/features/chat/models/property-chat.model";
import { unauthorized } from "@/shared/lib/error";

export async function GET() {
  const session = await getServerSession();
  if (!session) return unauthorized();

  await connectToDatabase();
  const conversations = await PropertyChatConversation.find({ sellerId: session.user.id })
    .sort({ lastMessageAt: -1 })
    .lean();

  return NextResponse.json({
    conversations: conversations.map((c) => ({ ...c, _id: c._id.toString() })),
  });
}
