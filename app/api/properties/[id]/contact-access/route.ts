import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { Subscription } from "@/lib/models/Subscription";
import { PropertyContactAccess } from "@/lib/models/PropertyContactAccess";
import { getServerSession } from "@/lib/server/getSession";
import { getDb } from "@/lib/server/db";
import { internalServerError } from "@/lib/error";
import { Role } from "@/lib/rbac";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const mongoSession = await mongoose.startSession();

  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: propertyId } = await params;
    const userId = session.user.id;

    const role = session.user.role as Role;

    if (role === Role.ADMIN) {
      return NextResponse.json(
        {
          success: true,
          alreadyUnlocked: true,
          hasAccess: true,
          isAdmin: true,
          message: "Admin has full access",
        },
        { status: 200 },
      );
    }

    await getDb();

    let responsePayload: any = null;

    await mongoSession.withTransaction(async () => {
      const existingAccess = await PropertyContactAccess.findOne({
        userId,
        propertyId,
      }).session(mongoSession);

      if (existingAccess) {
        responsePayload = {
          success: true,
          alreadyUnlocked: true,
          hasAccess: true,
          message: "Contact already unlocked for this property",
        };
        return;
      }

      const subscription = await Subscription.findOneAndUpdate(
        {
          userId,
          status: "paid",
          paymentMethod: "esewa",
          credits: { $gt: 0 },
        },
        { $inc: { usedCredits: 1 } },
        {
          new: true,
          sort: { createdAt: 1 }, // oldest usable subscription first
          session: mongoSession,
        },
      );

      if (!subscription) {
        responsePayload = {
          success: false,
          alreadyUnlocked: false,
          hasAccess: false,
          message: "No credits available",
        };
        return;
      }

      await PropertyContactAccess.create(
        [
          {
            userId,
            propertyId,
            subscriptionId: subscription._id,
            creditsDeducted: 1,
          },
        ],
        { session: mongoSession },
      );

      const remainingCredits = await Subscription.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            status: "paid",
            paymentMethod: "esewa",
          },
        },
        {
          $group: {
            _id: null,
            totalCredits: { $sum: "$credits" },
          },
        },
      ]).session(mongoSession);

      responsePayload = {
        success: true,
        alreadyUnlocked: false,
        hasAccess: true,
        message: "1 credit deducted successfully",
        deductedFromSubscriptionId: String(subscription._id),
        remainingCredits: remainingCredits[0]?.totalCredits ?? 0,
      };
    });

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error: any) {
    console.error("Consume property contact credit error:", error);

    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: true,
          alreadyUnlocked: true,
          hasAccess: true,
          message: "Contact already unlocked for this property",
        },
        { status: 200 },
      );
    }

    return internalServerError("Failed to update credits");
  } finally {
    await mongoSession.endSession();
  }
}
