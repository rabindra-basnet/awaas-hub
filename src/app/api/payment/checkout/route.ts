import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/features/auth/server/session";
import { connectToDatabase } from "@/shared/lib/db";
import { Subscription } from "@/features/billing/models/subscription.model";
import { getPaymentProvider } from "@/features/billing/registry";
import { badRequest, unauthorized } from "@/shared/lib/error";
import { z } from "zod";
import { nanoid } from "nanoid";
import { env } from "@/env";

const schema = z.object({
  amount:        z.number().min(1),
  credits:       z.number().min(1),
  paymentMethod: z.enum(["esewa", "khalti"]).default("esewa"),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return unauthorized();

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON");

  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.errors[0]?.message ?? "Validation error");

  const { amount, credits, paymentMethod } = parsed.data;
  const transactionUuid = nanoid(20);

  await connectToDatabase();

  const subscription = await Subscription.create({
    userId: session.user.id,
    propertyId: null,
    credits: 0,
    creditsToAdd: credits,
    amount,
    status: "pending",
    transactionId: transactionUuid,
    transactionUuid,
    paymentMethod,
  });

  const provider = getPaymentProvider(paymentMethod);
  const baseUrl = env.BETTER_AUTH_URL;

  const checkout = await provider.createCheckout({
    userId: session.user.id,
    propertyId: "",
    amount,
    credits,
    transactionUuid,
    successUrl: `${baseUrl}/api/payment/status?uuid=${transactionUuid}&provider=${paymentMethod}`,
    failureUrl: `${baseUrl}/billing?status=failed`,
  });

  return NextResponse.json({
    subscriptionId: subscription._id.toString(),
    ...checkout,
  });
}
