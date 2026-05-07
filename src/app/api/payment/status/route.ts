import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/shared/lib/db";
import { Subscription } from "@/features/billing/models/subscription.model";
import { getPaymentProvider } from "@/features/billing/registry";
import { env } from "@/env";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const uuid = searchParams.get("uuid");
  const provider = searchParams.get("provider") || "esewa";

  if (!uuid) {
    return NextResponse.redirect(`${env.BETTER_AUTH_URL}/billing?status=failed`);
  }

  await connectToDatabase();
  const sub = await Subscription.findOne({ transactionUuid: uuid });
  if (!sub) return NextResponse.redirect(`${env.BETTER_AUTH_URL}/billing?status=failed`);

  try {
    const paymentProvider = getPaymentProvider(provider);
    const query = Object.fromEntries(searchParams.entries());
    const result = await paymentProvider.verifyPayment(query);

    if (result.success) {
      sub.status = "paid";
      sub.transactionId = result.transactionId;
      sub.credits = sub.creditsToAdd;
      sub.creditsGranted = true;
      sub.paymentDate = new Date();
      await sub.save();
      return NextResponse.redirect(`${env.BETTER_AUTH_URL}/billing?status=success`);
    } else {
      sub.status = "failed";
      await sub.save();
      return NextResponse.redirect(`${env.BETTER_AUTH_URL}/billing?status=failed`);
    }
  } catch {
    sub.status = "failed";
    await sub.save();
    return NextResponse.redirect(`${env.BETTER_AUTH_URL}/billing?status=failed`);
  }
}
