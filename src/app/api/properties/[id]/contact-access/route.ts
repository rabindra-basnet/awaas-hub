import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/features/auth/server/session";
import { connectToDatabase } from "@/shared/lib/db";
import { Property } from "@/features/properties/models/property.model";
import { PropertyContactAccess } from "@/features/properties/models/property-contact-access.model";
import { Subscription } from "@/features/billing/models/subscription.model";
import { forbidden, notFound, unauthorized } from "@/shared/lib/error";
import { Role } from "@/features/auth/rbac/access";
import mongoose, { Types } from "mongoose";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session) return unauthorized();

  await connectToDatabase();
  const property = await Property.findById(id).lean();
  if (!property) return notFound();

  const isAdmin = session.user.role === Role.ADMIN;
  const isOwner = property.sellerId.toString() === session.user.id;

  if (isAdmin || isOwner) return NextResponse.json({ hasAccess: true, remainingCredits: null });

  const access = await PropertyContactAccess.findOne({ userId: session.user.id, propertyId: id }).lean();
  if (access) {
    const credits = await Subscription.aggregate([
      { $match: { userId: new Types.ObjectId(session.user.id), status: "paid" } },
      { $group: { _id: null, remaining: { $sum: { $subtract: ["$credits", "$usedCredits"] } } } },
    ]);
    return NextResponse.json({ hasAccess: true, remainingCredits: credits[0]?.remaining ?? 0 });
  }

  const credits = await Subscription.aggregate([
    { $match: { userId: new Types.ObjectId(session.user.id), status: "paid" } },
    { $group: { _id: null, remaining: { $sum: { $subtract: ["$credits", "$usedCredits"] } } } },
  ]);
  return NextResponse.json({ hasAccess: false, remainingCredits: credits[0]?.remaining ?? 0 });
}

export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session) return unauthorized();
  if (session.user.isAnonymous) return forbidden("Login required to unlock contact");

  await connectToDatabase();
  const property = await Property.findById(id).lean();
  if (!property) return notFound();

  const isAdmin = session.user.role === Role.ADMIN;
  const isOwner = property.sellerId.toString() === session.user.id;
  if (isAdmin || isOwner) return NextResponse.json({ hasAccess: true, remainingCredits: null });

  const existing = await PropertyContactAccess.findOne({ userId: session.user.id, propertyId: id }).lean();
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
        [{ userId: session.user.id, propertyId: id, subscriptionId: sub._id, creditsDeducted: 1 }],
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
    if (err.message === "no_credits") return forbidden("No credits remaining. Please purchase a plan.");
    throw err;
  } finally {
    await mongoSession.endSession();
  }
}
