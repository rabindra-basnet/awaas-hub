"use client";

import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import type { FeaturedProperty } from "@/features/home/server/home.fetcher";

export const featuredPropertiesOptions = queryOptions({
  queryKey: ["featured-properties"],
  queryFn: async (): Promise<FeaturedProperty[]> => {
    const base = typeof window === "undefined"
      ? (process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:3000")
      : "";
    const res = await fetch(`${base}/api/properties/featured`);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || "Failed to load featured properties");
    }
    return res.json();
  },
  staleTime: 5 * 60 * 1000,
});

export const useFeaturedProperties = () => useSuspenseQuery(featuredPropertiesOptions);
