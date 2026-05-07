import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/features/auth/server/session";
import { connectToDatabase } from "@/shared/lib/db";
import { Subscription } from "@/features/billing/models/subscription.model";
import { PropertyContactAccess } from "@/features/properties/models/property-contact-access.model";
import { badRequest, forbidden, unauthorized } from "@/shared/lib/error";
import { z } from "zod";
import mongoose, { Types } from "mongoose";

const schema = z.object({ propertyId: z.string().min(1) });

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return unauthorized();

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON");

  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.errors[0]?.message ?? "Validation error");

  await connectToDatabase();

  const existing = await PropertyContactAccess.findOne({
    userId: session.user.id,
    propertyId: parsed.data.propertyId,
  }).lean();
  if (existing) {
    const credits = await Subscription.aggregate([
      { $match: { userId: new Types.ObjectId(session.user.id), status: "paid" } },
      { $group: { _id: null, remaining: { $sum: { $subtract: ["$credits", "$usedCredits"] } } } },
    ]);
    return NextResponse.json({ hasAccess: true, remainingCredits: credits[0]?.remaining ?? 0 });
  }

  const mongoSession = await mongoose.startSession();
  try {
    let remainingCredits = 0;
    await mongoSession.withTransaction(async () => {
      const sub = await Subscription.findOneAndUpdate(
        { userId: new Types.ObjectId(session.user.id), status: "paid", $expr: { $gt: ["$credits", "$usedCredits"] } },
        { $inc: { usedCredits: 1 } },
        { sort: { createdAt: 1 }, session: mongoSession, new: true },
      );
      if (!sub) throw new Error("no_credits");

      await PropertyContactAccess.create(
        [{ userId: session.user.id, propertyId: parsed.data.propertyId, subscriptionId: sub._id, creditsDeducted: 1 }],
        { session: mongoSession },
      );

      const agg = await Subscription.aggregate([
        { $match: { userId: new Types.ObjectId(session.user.id), status: "paid" } },
        { $group: { _id: null, remaining: { $sum: { $subtract: ["$credits", "$usedCredits"] } } } },
      ]).session(mongoSession);
      remainingCredits = agg[0]?.remaining ?? 0;
    });

    return NextResponse.json({ hasAccess: true, remainingCredits });
  } catch (err: any) {
    if (err.message === "no_credits") return forbidden("No credits remaining");
    throw err;
  } finally {
    await mongoSession.endSession();
  }
}
