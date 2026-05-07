import crypto from "crypto";
import { env } from "@/env";
import type { CheckoutParams, PaymentProvider, VerifyResult } from "./types";

export const esewaProvider: PaymentProvider = {
  name: "esewa",

  generateSignature(message: string, secret: string): string {
    return crypto.createHmac("sha256", secret).update(message).digest("base64");
  },

  async createCheckout(params: CheckoutParams) {
    const { amount, transactionUuid } = params;
    const merchantCode = env.ESEWA_MERCHANT_CODE;
    const message = `total_amount=${amount},transaction_uuid=${transactionUuid},product_code=${merchantCode}`;
    const signature = this.generateSignature(message, env.ESEWA_SECRET_KEY);

    const fields: Record<string, string> = {
      amount: String(amount),
      tax_amount: "0",
      total_amount: String(amount),
      transaction_uuid: transactionUuid,
      product_code: merchantCode,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: params.successUrl,
      failure_url: params.failureUrl,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature,
    };

    return { formAction: `${env.ESEWA_BASE_URL}/api/epay/main/v2/form`, fields };
  },

  async verifyPayment(query: Record<string, string>): Promise<VerifyResult> {
    const { transaction_uuid, product_code, total_amount } = query;
    const url = `${env.ESEWA_BASE_URL}/api/epay/transaction/status/?product_code=${product_code}&total_amount=${total_amount}&transaction_uuid=${transaction_uuid}`;
    const res = await fetch(url);
    if (!res.ok) return { success: false, transactionId: "", amount: 0, status: "failed" };
    const data = await res.json();
    return {
      success: data.status === "COMPLETE",
      transactionId: data.ref_id || transaction_uuid,
      amount: Number(data.total_amount || total_amount),
      status: data.status || "failed",
    };
  },
};
