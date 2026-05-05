import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/server/query-client";
import { getServerSession } from "@/lib/server/getSession";
import { fetchProperties } from "@/lib/server/fetchers/properties.fetcher";
import { propertyKeys } from "@/lib/client/queries/properties.queries";
import AppointmentsContent from "./_components/appointments-content";
import Loading from "./loading";

export default async function AppointmentsPage() {
  const session = await getServerSession();
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: propertyKeys.list(),
    queryFn: () => fetchProperties(session),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<Loading />}>
        <AppointmentsContent />
      </Suspense>
    </HydrationBoundary>
  );
}
