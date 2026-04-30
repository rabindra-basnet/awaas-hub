import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { getServerSession } from "@/lib/server/getSession";
import { fetchProperties } from "@/lib/server/fetchers/properties.fetcher";
import { propertyKeys } from "@/lib/client/queries/properties.queries";
import PropertiesContent from "./_components/properties-content";
import PropertiesSkeleton from "./_components/properties-skeleton";

export default async function PropertiesPage() {
  const session = await getServerSession();
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: propertyKeys.list(),
    queryFn: () => fetchProperties(session),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<PropertiesSkeleton />}>
        <PropertiesContent />
      </Suspense>
    </HydrationBoundary>
  );
}
