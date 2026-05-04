// lib/client/queries/properties.queries.ts  — ADD these exports to your existing file

import { useMutation, useQueryClient } from "@tanstack/react-query";

// ── Types ─────────────────────────────────────────────────────────────────────
export type VerificationStatus = "pending" | "verified" | "rejected";

interface VerifyPropertyPayload {
  propertyId: string;
  status: VerificationStatus;
}

// ── API call ──────────────────────────────────────────────────────────────────
async function verifyPropertyRequest({
  propertyId,
  status,
}: VerifyPropertyPayload) {
  const res = await fetch(`/api/properties/${propertyId}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? "Failed to update verification status");
  }

  return res.json();
}

// ── API call ──────────────────────────────────────────────────────────────────
async function markPropertySoldRequest(propertyId: string) {
  const res = await fetch(`/api/properties/${propertyId}/verify`, {
    method: "PATCH",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? "Failed to mark property as sold");
  }

  return res.json();
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useMarkPropertySold(propertyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markPropertySoldRequest(propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property", propertyId] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

export function useVerifyProperty(propertyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: VerificationStatus) =>
      verifyPropertyRequest({ propertyId, status }),

    onSuccess: () => {
      // Re-fetch the single property so page badge reflects new status instantly
      queryClient.invalidateQueries({ queryKey: ["property", propertyId] });
      // Also bust the admin verified list if it's cached
      queryClient.invalidateQueries({ queryKey: ["properties", "verified"] });
    },
  });
}
