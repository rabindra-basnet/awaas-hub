import { useQuery } from "@tanstack/react-query";

export interface SellerProfile {
  id: string;
  name: string;
  initials: string;
  image: string | null;
  email: string | null; // null when hasAccess is false
  memberSince: string;
  role: string;
  totalListings: number;
  soldCount: number;
  bookedCount: number;
  activeListings: number;
}

export interface PropertySellerResponse {
  hasAccess: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  seller: SellerProfile;
}

async function fetchPropertySeller(propertyId: string): Promise<PropertySellerResponse> {
  const res = await fetch(`/api/properties/${propertyId}/seller`);
  if (!res.ok) throw new Error("Failed to fetch seller details");
  return res.json();
}

export function usePropertySeller(propertyId: string, enabled = true) {
  return useQuery({
    queryKey: ["property-seller", propertyId],
    queryFn: () => fetchPropertySeller(propertyId),
    enabled: !!propertyId && enabled,
    staleTime: 1000 * 60 * 5,
  });
}
