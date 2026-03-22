import { NextRequest, NextResponse } from "next/server";

import { Subscription } from "@/lib/models/Subscription";
import { PropertyContactAccess } from "@/lib/models/PropertyContactAccess";
import { getServerSession } from "@/lib/server/getSession";
import { getDb } from "@/lib/server/db";
import { internalServerError } from "@/lib/error";
import { Role } from "@/lib/rbac";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          alreadyUnlocked: false,
          availableCredits: 0,
          totalPurchasedCredits: 0,
          usedCredits: 0,
          propertyId: null,
          hasAccess: false,
        },
        { status: 200 },
      );
    }

    const role = session.user.role as Role;
    const { id: propertyId } = await params;

    await getDb();

    if (role === Role.ADMIN) {
      return NextResponse.json(
        {
          propertyId,
          hasAccess: true,
          alreadyUnlocked: true,
          isAdmin: true,
          availableCredits: 0,
          totalPurchasedCredits: 0,
          usedCredits: 0,
          message: "Admin has full access",
        },
        { status: 200 },
      );
    }

    const propertySubscriptions = await Subscription.find({
      userId: session.user.id,
      propertyId,
      status: "paid",
      paymentMethod: "esewa",
    }).lean();

    if (!propertySubscriptions.length) {
      return NextResponse.json(
        {
          message: "No paid subscription found for this property",
          propertyId,
          hasAccess: false,
          alreadyUnlocked: false,
          availableCredits: 0,
          totalPurchasedCredits: 0,
          usedCredits: 0,
        },
        { status: 404 },
      );
    }

    const existingAccess = await PropertyContactAccess.findOne({
      userId: session.user.id,
      propertyId,
    }).lean();

    const allPaidSubscriptions = await Subscription.find({
      userId: session.user.id,
      status: "paid",
      paymentMethod: "esewa",
    }).lean();

    const totalPurchasedCredits = allPaidSubscriptions.reduce((sum, sub) => {
      return sum + (Number(sub.credits) || 0);
    }, 0);

    const usedCredits = await PropertyContactAccess.countDocuments({
      userId: session.user.id,
    });

    const availableCredits = Math.max(totalPurchasedCredits - usedCredits, 0);
    const hasAccess = !!existingAccess || availableCredits > 0;

    return NextResponse.json(
      {
        propertyId,
        hasAccess,
        alreadyUnlocked: !!existingAccess,
        availableCredits,
        totalPurchasedCredits,
        usedCredits,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get property subscription error:", error);
    return internalServerError("Failed to fetch subscription");
  }
}
