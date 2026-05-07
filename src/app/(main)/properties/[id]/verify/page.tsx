import { redirect, notFound } from "next/navigation";
import { getServerSession } from "@/features/auth/server/session";
import { fetchPropertyById } from "@/features/properties/server/properties.fetcher";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/shared/lib/query-client";
import { propertyKeys } from "@/features/properties/lib/property-keys";
import { Role } from "@/features/auth/rbac/access";
import PropertyVerify from "@/features/properties/components/property-verify";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ action?: string }> };

export default async function VerifyPropertyPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { action } = await searchParams;

  const session = await getServerSession();
  if (!session || session.user.role !== Role.ADMIN) redirect(`/properties/${id}`);

  const qc = getQueryClient();
  await qc.prefetchQuery({
    queryKey: propertyKeys.detail(id),
    queryFn:  () => fetchPropertyById(id, session.user.id, session.user.role),
  });

  const property = qc.getQueryData(propertyKeys.detail(id)) as any;
  if (!property) return notFound();

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <PropertyVerify id={id} defaultAction={(action === "reject" ? "reject" : "verify") as "verify" | "reject"} />
    </HydrationBoundary>
  );
}
