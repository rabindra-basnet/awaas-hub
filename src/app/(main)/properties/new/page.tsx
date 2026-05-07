import { redirect } from "next/navigation";
import { getServerSession, isRealSession } from "@/features/auth/server/session";
import PropertyForm from "@/features/properties/components/property-form";

export default async function NewPropertyPage() {
  const session = await getServerSession();
  if (!isRealSession(session)) redirect("/login");

  return <PropertyForm />;
}
