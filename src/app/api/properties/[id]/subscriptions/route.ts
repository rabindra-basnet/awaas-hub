import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/features/auth/server/session";
import { connectToDatabase } from "@/shared/lib/db";
import { Subscription } from "@/features/billing/models/subscription.model";
import { unauthorized } from "@/shared/lib/error";
import { Types } from "mongoose";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session) return unauthorized();

  await connectToDatabase();
  const subs = await Subscription.find({ userId: session.user.id, propertyId: id })
    .sort({ createdAt: -1 })
    .lean();

  const totalCredits = await Subscription.aggregate([
    { $match: { userId: new Types.ObjectId(session.user.id), status: "paid" } },
    { $group: { _id: null, remaining: { $sum: { $subtract: ["$credits", "$usedCredits"] } } } },
  ]);

  return NextResponse.json({
    subscriptions: subs.map((s) => ({
      ...s,
      _id: s._id.toString(),
      userId: s.userId.toString(),
      propertyId: s.propertyId.toString(),
    })),
    remainingCredits: totalCredits[0]?.remaining ?? 0,
  });
}
