import { redirect, notFound } from "next/navigation";
import { getServerSession, isRealSession } from "@/features/auth/server/session";
import { fetchPropertyById } from "@/features/properties/server/properties.fetcher";
import ContactAccess from "@/features/properties/components/contact-access";

type Props = { params: Promise<{ id: string }> };

export default async function ContactAccessPage({ params }: Props) {
  const { id } = await params;
  const session = await getServerSession();
  if (!isRealSession(session)) redirect(`/login?callbackUrl=/properties/${id}/contact-access`);
  if ((session.user as any).isAnonymous) redirect(`/login?callbackUrl=/properties/${id}/contact-access`);

  const property = await fetchPropertyById(id, session.user.id, session.user.role);
  if (!property) return notFound();

  return <ContactAccess id={id} property={property as any} userId={session.user.id} userRole={session.user.role} />;
}
