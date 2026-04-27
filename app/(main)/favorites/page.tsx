import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/server/query-client";
import { getServerSession } from "@/lib/server/getSession";
import { fetchFavorites } from "@/lib/server/fetchers/favorites.fetcher";
import FavoritesContent from "./_components/favorites-content";
import Loading from "./loading";

export default async function FavoritesPage() {
  const session = await getServerSession();
  const queryClient = getQueryClient();

  if (session && !session.user.isAnonymous) {
    await queryClient.prefetchQuery({
      queryKey: ["favorites"],
      queryFn: () => fetchFavorites(session),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<Loading />}>
        <FavoritesContent />
      </Suspense>
    </HydrationBoundary>
  );
}
