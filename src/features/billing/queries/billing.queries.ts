"use client";

import { queryOptions, useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const billingKeys = {
  all:           ["billing"] as const,
  subscriptions: (propertyId: string) => ["billing", "subscriptions", propertyId] as const,
  credits:       () => ["billing", "credits"] as const,
  balance:       () => ["billing", "balance"] as const,
};

async function throwIfError(res: Response | Promise<Response>) {
  const r = await res;
  if (!r.ok) {
    const body = await r.json().catch(() => ({}));
    throw new Error(body.message || `Request failed: ${r.status}`);
  }
  return r.json();
}

export const subscriptionsOptions = (propertyId: string) =>
  queryOptions({
    queryKey: billingKeys.subscriptions(propertyId),
    queryFn: () => throwIfError(fetch(`/api/properties/${propertyId}/subscriptions`)),
  });

export const useSubscriptions = (propertyId: string) => useSuspenseQuery(subscriptionsOptions(propertyId));

export const creditBalanceOptions = () =>
  queryOptions({
    queryKey: billingKeys.balance(),
    queryFn: () => throwIfError(fetch("/api/billing/credits")),
    staleTime: 30_000,
  });

export const useCreditBalance = () => useSuspenseQuery(creditBalanceOptions());

export const useCheckout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { amount: number; credits: number; paymentMethod?: string }) =>
      throwIfError(fetch("/api/payment/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })),
    onSuccess: () => qc.invalidateQueries({ queryKey: billingKeys.balance() }),
  });
};

export const useConsumeCredit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (propertyId: string) =>
      throwIfError(fetch("/api/billing/credits/consume", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ propertyId }) })),
    onSuccess: (_data, propertyId) => {
      qc.invalidateQueries({ queryKey: billingKeys.subscriptions(propertyId) });
    },
  });
};
