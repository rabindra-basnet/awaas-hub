import { redirect } from "next/navigation";
import { getServerSession } from "@/features/auth/server/session";
import { Role } from "@/features/auth/rbac/access";
import { Suspense } from "react";
import AdminUsersContent from "@/features/auth/components/admin-users-content";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default async function AdminUsersPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");
  if (session.user.role !== Role.ADMIN) redirect("/dashboard");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <AdminUsersContent />
      </Suspense>
    </div>
  );
}
