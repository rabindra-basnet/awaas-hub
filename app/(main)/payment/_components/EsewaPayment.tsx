"use client";

// app/payment/esewa/EsewaPayment.tsx  — Client Component

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { DummyDataResponse } from "@/lib/payment-provider/types";

// ── Types ─────────────────────────────────────────────────────────

interface EsewaConfig {
  tax_amount: number;
  total_amount: number;
  transaction_uuid: string;
  product_code: string;
  product_service_charge: number;
  product_delivery_charge: number;
  success_url: string;
  failure_url: string;
  signed_field_names: string;
  signature: string;
}

interface PaymentResponse {
  amount: string;
  esewaConfig: EsewaConfig;
}

interface PaymentPayload {
  amount: string;
  productName: string;
  transactionId: string;
}

// ── Query key — exported so the server page can share it ──────────
// Both page.tsx (prefetchQuery) and EsewaPayment (useQuery) must use
// the exact same key for the cache hit to work.

export const ESEWA_DUMMY_QUERY_KEY = ["esewa-dummy-data"] as const;

// ── API helpers — exported so page.tsx can call fetchDummyData ────

export async function fetchDummyData(): Promise<DummyDataResponse> {
  const res = await fetch("/api/payment/dummy-data?method=esewa");
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

async function initiatePayment(
  payload: PaymentPayload,
): Promise<PaymentResponse> {
  const res = await fetch("/api/payment/initiate-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ method: "esewa", ...payload }),
  });
  if (!res.ok) throw new Error(`Payment initiation failed: ${res.statusText}`);
  return res.json();
}

// ── Helper — submit hidden form to eSewa gateway ──────────────────

function submitEsewaForm(paymentData: PaymentResponse) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

  const fields: Record<string, string | number> = {
    amount: paymentData.amount,
    tax_amount: paymentData.esewaConfig.tax_amount,
    total_amount: paymentData.esewaConfig.total_amount,
    transaction_uuid: paymentData.esewaConfig.transaction_uuid,
    product_code: paymentData.esewaConfig.product_code,
    product_service_charge: paymentData.esewaConfig.product_service_charge,
    product_delivery_charge: paymentData.esewaConfig.product_delivery_charge,
    success_url: paymentData.esewaConfig.success_url,
    failure_url: paymentData.esewaConfig.failure_url,
    signed_field_names: paymentData.esewaConfig.signed_field_names,
    signature: paymentData.esewaConfig.signature,
  };

  console.log({ esewaPayload: fields });

  Object.entries(fields).forEach(([key, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = String(value);
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}

// ── Component ─────────────────────────────────────────────────────

export default function EsewaPayment() {
  // Because the server page called prefetchQuery with the same key,
  // this useQuery hits the hydrated cache immediately — isLoading is
  // always false and data is available on the very first render.
  const { data: dummyData, isError } = useQuery({
    queryKey: ESEWA_DUMMY_QUERY_KEY,
    queryFn: fetchDummyData, // only runs if cache somehow misses
    staleTime: Infinity,
    retry: 1,
  });

  // Seed controlled state directly from the already-available cache data.
  // useState(initialValue) only uses the value on the very first render,
  // and since prefetch guarantees dummyData is defined at that point,
  // the fields are populated immediately with no flicker.
  const [amount, setAmount] = useState(dummyData?.amount ?? "");
  const [productName, setProductName] = useState(dummyData?.productName ?? "");
  const [transactionId, setTransactionId] = useState(
    dummyData?.transactionId ?? "",
  );

  // ── Payment mutation ──
  const { mutate: pay, isPending } = useMutation({
    mutationFn: initiatePayment,
    onSuccess: (data) => {
      toast.success("Payment Initiated", {
        description: "Redirecting to eSewa payment gateway...",
      });
      submitEsewaForm(data);
    },
    onError: (err: Error) => {
      console.error("Payment error:", err.message);
      toast.error("Payment Error", {
        description: "Payment initiation failed. Please try again.",
      });
    },
  });

  const handlePayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    pay({ amount, productName, transactionId });
  };

  const isDisabled = isPending || !amount || !productName || !transactionId;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>eSewa Payment</CardTitle>
          <CardDescription>Enter payment details for eSewa</CardDescription>
        </CardHeader>

        <form onSubmit={handlePayment}>
          <CardContent className="space-y-4">
            {isError && (
              <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
                Failed to pre-fill data. You can still enter details manually.
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (NPR)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="1"
                step="0.01"
                placeholder="Enter amount"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="productName">Product Name</Label>
              <Input
                id="productName"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
                placeholder="Enter product name"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transactionId">Transaction ID</Label>
              <Input
                id="transactionId"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                required
                placeholder="Enter transaction ID"
                maxLength={50}
              />
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full" disabled={isDisabled}>
              {isPending ? "Processing..." : "Pay with eSewa"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
