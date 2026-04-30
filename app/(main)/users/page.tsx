import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/server/getSession";
import { hasPermission, Permission, Role } from "@/lib/rbac";
import UsersPage from "./_components/users-page";

export default async function Page() {
  const session = await getServerSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.user.role as Role, Permission.MANAGE_USERS))
    redirect("/dashboard");

  return <UsersPage />;
}
