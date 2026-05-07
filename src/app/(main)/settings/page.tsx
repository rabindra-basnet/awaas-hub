import { redirect } from "next/navigation";
import { getServerSession, isRealSession } from "@/features/auth/server/session";
import SettingsContent from "@/features/settings/components/settings-content";

export default async function SettingsPage() {
  const session = await getServerSession();
  if (!isRealSession(session)) redirect("/login");

  return <SettingsContent initialUser={session.user} />;
}
