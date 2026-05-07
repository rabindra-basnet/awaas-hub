import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/shared/lib/query-client";
import { getServerSession } from "@/features/auth/server/session";
import { fetchPropertyById } from "@/features/properties/server/properties.fetcher";
import { propertyKeys } from "@/features/properties/lib/property-keys";
import { notFound } from "next/navigation";
import PropertyDetail from "@/features/properties/components/property-detail";

type Props = { params: Promise<{ id: string }> };

export default async function PropertyDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await getServerSession();

  const qc = getQueryClient();
  await qc.prefetchQuery({
    queryKey: propertyKeys.detail(id),
    queryFn:  () => fetchPropertyById(id, session?.user.id, session?.user.role),
  });

  const data = qc.getQueryData(propertyKeys.detail(id));
  if (!data) notFound();

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <PropertyDetail id={id} />
    </HydrationBoundary>
  );
}
