"use client";

import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import type { FeaturedProperty } from "@/features/home/server/home.fetcher";

export const featuredPropertiesOptions = queryOptions({
  queryKey: ["featured-properties"],
  queryFn: async (): Promise<FeaturedProperty[]> => {
    const res = await fetch("/api/properties/featured");
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || "Failed to load featured properties");
    }
    return res.json();
  },
  staleTime: 5 * 60 * 1000,
});

export const useFeaturedProperties = () => useSuspenseQuery(featuredPropertiesOptions);
