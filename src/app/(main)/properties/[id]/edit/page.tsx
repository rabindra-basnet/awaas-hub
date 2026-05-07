import { redirect, notFound } from "next/navigation";
import { getServerSession, isRealSession } from "@/features/auth/server/session";
import { fetchPropertyById } from "@/features/properties/server/properties.fetcher";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/shared/lib/query-client";
import { propertyKeys } from "@/features/properties/lib/property-keys";
import { Role } from "@/features/auth/rbac/access";
import PropertyEditForm from "@/features/properties/components/property-edit-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditPropertyPage({ params }: Props) {
  const { id } = await params;
  const session = await getServerSession();
  if (!isRealSession(session)) redirect(`/login?callbackUrl=/properties/${id}/edit`);

  const qc = getQueryClient();
  await qc.prefetchQuery({
    queryKey: propertyKeys.detail(id),
    queryFn:  () => fetchPropertyById(id, session.user.id, session.user.role),
  });

  const property = qc.getQueryData(propertyKeys.detail(id)) as any;
  if (!property) return notFound();

  const isOwner = property.sellerId === session.user.id;
  const isAdmin = session.user.role === Role.ADMIN;
  if (!isOwner && !isAdmin) redirect(`/properties/${id}`);

  return (
    <div className="h-full overflow-hidden p-6">
      <div className="h-full rounded-2xl overflow-hidden border border-border shadow-sm">
        <HydrationBoundary state={dehydrate(qc)}>
          <PropertyEditForm id={id} />
        </HydrationBoundary>
      </div>
    </div>
  );
}
