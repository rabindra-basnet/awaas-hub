import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { getQueryClient } from "@/shared/lib/query-client";
import { getServerSession, isRealSession } from "@/features/auth/server/session";
import FavoritesContent from "@/features/favorites/components/favorites-content";

export default async function FavoritesPage() {
  const session = await getServerSession();
  if (!isRealSession(session)) redirect("/login");

  const qc = getQueryClient();
  await qc.prefetchQuery({
    queryKey: ["favorites"],
    queryFn:  async () => {
      const res = await fetch(`${process.env.BETTER_AUTH_URL}/api/favorites`);
      return res.json();
    },
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <FavoritesContent />
    </HydrationBoundary>
  );
}
