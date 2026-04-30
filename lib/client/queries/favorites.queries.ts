import { queryOptions, useQuery } from "@tanstack/react-query";

async function fetchFavoritesClient(): Promise<any[]> {
  const res = await fetch("/api/favorites", { method: "GET" });
  if (!res.ok) return [];
  return res.json();
}

export const favoritesQuery = () =>
  queryOptions<any[]>({
    queryKey: ["favorites"],
    queryFn: fetchFavoritesClient,
    staleTime: 60 * 1000,
  });

export const useFavorites = (enabled = true) =>
  useQuery({ ...favoritesQuery(), enabled });
