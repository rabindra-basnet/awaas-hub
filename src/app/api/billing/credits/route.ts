import { NextResponse } from "next/server";
import { getServerSession } from "@/features/auth/server/session";
import { connectToDatabase } from "@/shared/lib/db";
import { Subscription } from "@/features/billing/models/subscription.model";
import { unauthorized } from "@/shared/lib/error";
import { Types } from "mongoose";

export async function GET() {
  const session = await getServerSession();
  if (!session) return unauthorized();

  await connectToDatabase();

  const agg = await Subscription.aggregate([
    { $match: { userId: new Types.ObjectId(session.user.id), status: "paid" } },
    { $group: { _id: null, total: { $sum: "$credits" }, used: { $sum: "$usedCredits" } } },
  ]);

  const total     = agg[0]?.total ?? 0;
  const used      = agg[0]?.used  ?? 0;
  const remaining = total - used;

  const history = await Subscription.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return NextResponse.json({
    remaining,
    total,
    used,
    history: history.map((s) => ({
      _id:           s._id.toString(),
      credits:       s.credits,
      creditsToAdd:  s.creditsToAdd,
      usedCredits:   s.usedCredits,
      amount:        s.amount,
      status:        s.status,
      paymentMethod: s.paymentMethod,
      createdAt:     s.createdAt.toISOString(),
    })),
  });
}
