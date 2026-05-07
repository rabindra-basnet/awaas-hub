import { NextResponse } from "next/server";
import { getServerSession } from "@/features/auth/server/session";
import { connectToDatabase } from "@/shared/lib/db";
import { SupportConversation } from "@/features/support/models/support-conversation.model";
import { unauthorized } from "@/shared/lib/error";

export async function GET() {
  const session = await getServerSession();
  if (!session) return unauthorized();

  await connectToDatabase();
  const convos = await SupportConversation.find({ userId: session.user.id, unreadByUser: { $gt: 0 } }).lean();
  const totalUnread = convos.reduce((sum, c) => sum + c.unreadByUser, 0);

  return NextResponse.json({ unread: totalUnread, conversations: convos.length });
}
