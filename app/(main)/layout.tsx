"use client";

import { useSession } from "@/lib/client/auth-client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./_components/app-sidebar";
import DashboardHeader from "./_components/dashboard-header";

import { Role, Permission, hasPermission } from "@/lib/rbac";
import AccessDeniedPage from "@/components/access-denied";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const isPropertiesPage = pathname.startsWith("/properties");

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
    }
  }, [session, isPending, router]);

  if (isPending || !session) return null;

  const role = session.user.role as Role;

  if (!hasPermission(role, Permission.VIEW_DASHBOARD)) {
    return <AccessDeniedPage />;
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex h-screen w-full">
        <AppSidebar session={session} />

        <main className="flex-1 flex flex-col">
          <DashboardHeader />
          <div
            className={cn(
              "flex-1",
              isPropertiesPage ? "overflow-hidden" : "overflow-y-auto"
            )}
          >
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
