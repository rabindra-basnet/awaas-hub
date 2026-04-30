import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/server/getSession";
import { hasPermission, Permission, Role } from "@/lib/rbac";
import AnalyticsPage from "./_components/analytics-page";

export default async function Page() {
  const session = await getServerSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.user.role as Role, Permission.VIEW_ANALYTICS)) redirect("/dashboard");

  return <AnalyticsPage />;
}
