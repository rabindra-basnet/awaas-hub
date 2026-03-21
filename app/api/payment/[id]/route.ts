import { Subscription } from "@/lib/models/Subscription";
import { getDb } from "@/lib/server/db";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { badRequest } from "@/lib/error";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await getDb();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return badRequest("Invalid payment ID");
    }

    const payment = await Subscription.findById(id).lean();

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json({
      payment: {
        id: payment._id,
        propertyId: payment.propertyId,
        amount: payment.amount,
        credits: payment.credits,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        transactionId: payment.transactionId,
        transactionUuid: payment.transactionUuid,
        paymentDate: payment.paymentDate,
        createdAt: payment.createdAt,
      },
    });
  } catch (error) {
    console.error("Get payment error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment" },
      { status: 500 },
    );
  }
}
