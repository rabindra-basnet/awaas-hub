import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/shared/lib/query-client";
import { getServerSession } from "@/features/auth/server/session";
import { fetchProperties } from "@/features/properties/server/properties.fetcher";
import { propertyKeys, PAGE_LIMIT } from "@/features/properties/lib/property-keys";
import { Role } from "@/features/auth/rbac/access";
import PropertiesContent from "@/features/properties/components/properties-content";

export default async function PropertiesPage() {
  const session = await getServerSession();
  const qc = getQueryClient();

  await qc.prefetchInfiniteQuery({
    queryKey:        propertyKeys.infinite(),
    queryFn:         ({ pageParam }) =>
      fetchProperties({
        userId: session?.user.id,
        role:   session?.user.role as Role | undefined,
        cursor: (pageParam as string) ?? undefined,
        limit:  PAGE_LIMIT,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage: any) => lastPage.nextCursor ?? undefined,
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <PropertiesContent />
    </HydrationBoundary>
  );
}
