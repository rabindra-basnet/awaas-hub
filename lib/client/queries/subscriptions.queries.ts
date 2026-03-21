// import { useQuery } from "@tanstack/react-query";

// export interface PropertySubscriptionResponse {
//   hasAccess: boolean;
//   subscription: {
//     id: string;
//     propertyId: string;
//     userId: string;
//     status:
//       | "pending"
//       | "paid"
//       | "failed"
//       | "canceled"
//       | "ambiguous"
//       | "refunded";
//     credits: number;
//     amount: number;
//     paymentMethod: "esewa";
//     transactionId: string;
//     transactionUuid: string;
//     paymentDate?: string | null;
//     createdAt: string;
//   } | null;
// }

// async function getPropertySubscription(
//   propertyId: string,
// ): Promise<PropertySubscriptionResponse> {
//   const res = await fetch(`/api/properties/${propertyId}/subscriptions`, {
//     method: "GET",
//     credentials: "include",
//     // cache: "no-store",
//   });

//   if (!res.ok) {
//     throw new Error("Failed to fetch property subscription");
//   }

//   return res.json();
// }

// export function usePropertySubscription(
//   propertyId: string,
//   enabled: boolean = true,
// ) {
//   return useQuery({
//     queryKey: ["property-subscription", propertyId],
//     queryFn: () => getPropertySubscription(propertyId),
//     enabled: !!propertyId && enabled,
//     staleTime: 1000 * 30,
//   });
// }
//

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface PropertySubscriptionItem {
  id: string;
  propertyId: string;
  userId: string;
  status: "pending" | "paid" | "failed" | "canceled" | "ambiguous" | "refunded";
  credits: number;
  amount: number;
  paymentMethod: "esewa";
  transactionId: string;
  transactionUuid: string;
  paymentDate?: string | null;
  createdAt: string;
}

export interface PropertySubscriptionResponse {
  hasAccess: boolean;
  alreadyUnlocked: boolean;
  totalCredits: number;
  totalPaidSubscriptions?: number;
  propertySubscriptionsCount?: number;
  latestPropertySubscription: PropertySubscriptionItem | null;
  subscriptions?: PropertySubscriptionItem[];
}

export interface ConsumeContactCreditResponse {
  success: boolean;
  alreadyUnlocked: boolean;
  hasAccess: boolean;
  message: string;
  deductedFromSubscriptionId?: string;
  remainingCredits?: number;
}

async function getPropertySubscription(
  propertyId: string,
): Promise<PropertySubscriptionResponse> {
  const res = await fetch(`/api/properties/${propertyId}/subscriptions`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch property subscription");
  }

  return res.json();
}

async function consumeContactCredit(
  propertyId: string,
): Promise<ConsumeContactCreditResponse> {
  const res = await fetch(`/api/properties/${propertyId}/contact-access`, {
    method: "POST",
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "Failed to consume contact credit");
  }

  return data;
}

export function usePropertySubscription(
  propertyId: string,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ["property-subscription", propertyId],
    queryFn: () => getPropertySubscription(propertyId),
    enabled: !!propertyId && enabled,
    staleTime: 1000 * 30,
  });
}

export function useConsumeContactCredit(propertyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["consume-contact-credit", propertyId],
    mutationFn: () => consumeContactCredit(propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["property-subscription", propertyId],
      });
    },
  });
}
