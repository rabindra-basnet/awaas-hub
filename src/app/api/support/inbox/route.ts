import { NextResponse } from "next/server";
import { getServerSession } from "@/features/auth/server/session";
import { connectToDatabase } from "@/shared/lib/db";
import { SupportConversation } from "@/features/support/models/support-conversation.model";
import { forbidden, unauthorized } from "@/shared/lib/error";
import { Role } from "@/features/auth/rbac/access";

export async function GET() {
  const session = await getServerSession();
  if (!session) return unauthorized();
  if (session.user.role !== Role.ADMIN) return forbidden();

  await connectToDatabase();
  const conversations = await SupportConversation.find({ status: "open" })
    .sort({ lastMessageAt: -1 })
    .lean();

  return NextResponse.json({
    conversations: conversations.map((c) => ({ ...c, _id: c._id.toString() })),
  });
}
