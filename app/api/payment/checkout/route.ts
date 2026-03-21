import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/server/getSession";
import { badRequest, internalServerError, unauthorized } from "@/lib/error";
import { getDb } from "@/lib/server/db";
import { Subscription } from "@/lib/models/Subscription";
// import { Property } from "@/lib/models/property";

function generateEsewaSignature(secret: string, message: string) {
  return crypto
    .createHmac("sha256", secret)
    .update(message, "utf8")
    .digest("base64");
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user) return unauthorized();

    const body = await req.json();
    const { propertyId } = body;

    if (!propertyId) {
      return badRequest("Property ID is required");
    }
    const userId = session.user.id;
    if (!userId) {
      return unauthorized();
    }

    await getDb();

    const credits = 1;
    const amount = 100;

    const transactionId = `SUB-${Date.now()}`;
    const transactionUuid = `${Date.now()}-${uuidv4()}`;
    const productCode = process.env.ESEWA_MERCHANT_CODE!;
    const totalAmount = String(amount);

    await Subscription.create({
      userId,
      propertyId,
      credits,
      amount,
      status: "pending",
      transactionId,
      transactionUuid,
      paymentMethod: "esewa",
    });

    const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
    const signature = generateEsewaSignature(
      process.env.ESEWA_SECRET_KEY!,
      message,
    );

    return NextResponse.json({
      esewaConfig: {
        amount: totalAmount,
        tax_amount: "0",
        total_amount: totalAmount,
        transaction_uuid: transactionUuid,
        product_code: productCode,
        product_service_charge: "0",
        product_delivery_charge: "0",
        success_url: `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/api/payment/status`,
        failure_url: `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/api/payment/status`,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature,
      },
    });
  } catch (error) {
    console.error("Initiate payment error:", error);
    return internalServerError("Failed to initiate payment");
  }
}
