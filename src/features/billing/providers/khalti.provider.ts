import crypto from "crypto";
import { env } from "@/env";
import type { CheckoutParams, PaymentProvider, VerifyResult } from "./types";

export const khaltiProvider: PaymentProvider = {
  name: "khalti",

  generateSignature(message: string, secret: string): string {
    return crypto.createHmac("sha256", secret).update(message).digest("hex");
  },

  async createCheckout(params: CheckoutParams) {
    const res = await fetch("https://a.khalti.com/api/v2/epayment/initiate/", {
      method: "POST",
      headers: {
        Authorization: `Key ${env.KHALTI_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        return_url: params.successUrl,
        website_url: params.failureUrl.split("/payment")[0],
        amount: params.amount * 100,
        purchase_order_id: params.transactionUuid,
        purchase_order_name: `Property Credits — ${params.credits}`,
      }),
    });

    if (!res.ok) throw new Error("Khalti initiation failed");
    const data = await res.json();

    return {
      formAction: data.payment_url,
      fields: { pidx: data.pidx },
    };
  },

  async verifyPayment(query: Record<string, string>): Promise<VerifyResult> {
    const res = await fetch("https://a.khalti.com/api/v2/epayment/lookup/", {
      method: "POST",
      headers: {
        Authorization: `Key ${env.KHALTI_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pidx: query.pidx }),
    });

    if (!res.ok) return { success: false, transactionId: "", amount: 0, status: "failed" };
    const data = await res.json();

    return {
      success: data.status === "Completed",
      transactionId: data.transaction_id || query.pidx,
      amount: Math.floor((data.total_amount || 0) / 100),
      status: data.status || "failed",
    };
  },
};
