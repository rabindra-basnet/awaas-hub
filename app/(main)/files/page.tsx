import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/server/getSession";
import { hasPermission, Permission, Role } from "@/lib/rbac";
import FilesPage from "./_components/files-page";

export default async function Page() {
  const session = await getServerSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.user.role as Role, Permission.VIEW_FILES)) redirect("/dashboard");

  return (
    <Suspense>
      <FilesPage />
    </Suspense>
  );
}
