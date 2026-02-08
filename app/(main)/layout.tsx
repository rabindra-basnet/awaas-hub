"use client";

import { useSession } from "@/lib/client/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./_components/app-sidebar";
import DashboardHeader from "./_components/dashboard-header";
import AccessDeniedPage from "@/components/access-denied";
import { Role, Permission, hasPermission, hasAnyPermission } from "@/lib/rbac";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // 1️⃣ Not logged in → login
  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
    }
  }, [session, isPending, router]);

  if (isPending) return null;
  if (!session) return null;

  const role = session.user.role as Role;

  // 2️⃣ Logged in but no dashboard permission
  if (
    !hasAnyPermission(role, [
      Permission.VIEW_DASHBOARD,
      Permission.VIEW_PROPERTIES,
    ])
  ) {
    return <AccessDeniedPage />;
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex h-screen w-full">
        {/* Sidebar */}
        <AppSidebar session={session} />

        {/* Main */}
        <main className="flex-1 flex flex-col">
          {/* Sticky Header */}
          <DashboardHeader />

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
