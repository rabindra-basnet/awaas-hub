import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/shared/lib/query-client";
import { getServerSession } from "@/features/auth/server/session";
import { fetchProperties } from "@/features/properties/server/properties.fetcher";
import { infinitePropertiesOptions } from "@/features/properties/queries/properties.queries";
import { Role } from "@/features/auth/rbac/access";
import PropertiesContent from "@/features/properties/components/properties-content";

export default async function PropertiesPage() {
  const session = await getServerSession();
  const qc = getQueryClient();
  const opts = infinitePropertiesOptions();

  await qc.prefetchInfiniteQuery({
    queryKey:        opts.queryKey,
    queryFn:         ({ pageParam }) =>
      fetchProperties({
        userId: session?.user.id,
        role:   session?.user.role as Role | undefined,
        cursor: (pageParam as string) ?? undefined,
      }),
    initialPageParam: null,
    getNextPageParam: opts.getNextPageParam,
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <PropertiesContent />
    </HydrationBoundary>
  );
}
