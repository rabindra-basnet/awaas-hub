"use client";

import { useSession } from "@/lib/client/auth-client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useMemo } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./_components/app-sidebar";
import DashboardHeader from "./_components/dashboard-header";
import AccessDeniedPage from "@/components/access-denied";
import { Role, Permission, hasAnyPermission, hasPermission } from "@/lib/rbac";
import { AnonymousProvider } from "../guest-provider";
import { DASHBOARD_PAGES } from "./_components/pages-permissions";

const PUBLIC_PATHS   = [/^\/properties$/, /^\/properties\/[a-fA-F0-9]{24}$/];
const FULLSCREEN_PATHS = [/^\/properties\/.+/];
const CONTAINED_PATHS  = [/^\/properties$/];

export default function DashboardProvider({ children }: { children: React.ReactNode }) {
  return (
    <AnonymousProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </AnonymousProvider>
  );
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const router   = useRouter();
  const pathname = usePathname();

  const isPublicPath    = useMemo(() => !!pathname && PUBLIC_PATHS.some(p => p.test(pathname)),    [pathname]);
  const isFullscreenRoute = useMemo(() => !!pathname && FULLSCREEN_PATHS.some(p => p.test(pathname)), [pathname]);
  const isContainedRoute  = useMemo(() => !!pathname && CONTAINED_PATHS.some(p => p.test(pathname)),  [pathname]);

  const isAnonymous = session?.user?.isAnonymous === true;

  useEffect(() => {
    if (isPending || isPublicPath) return;
    if (!session) { router.replace("/login"); return; }
    if (isAnonymous) router.replace("/properties");
  }, [isPending, isPublicPath, session, isAnonymous, router]);

  // Show a spinner while auth resolves or while a redirect is in flight
  if (isPending || (!isPublicPath && !session) || (!isPublicPath && isAnonymous)) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  // RBAC guards — only for authenticated, non-anonymous users on protected paths
  if (session && !isAnonymous && !isPublicPath && pathname) {
    const role = session.user.role as Role;

    // Entry guard: must have at least one of these to enter the dashboard
    if (!hasAnyPermission(role, [Permission.VIEW_DASHBOARD, Permission.VIEW_PROPERTIES])) {
      return <AccessDeniedPage />;
    }

    // Per-route guard
    const currentPage = DASHBOARD_PAGES.find(
      page => pathname === page.href || pathname.startsWith(page.href + "/"),
    );
    if (currentPage) {
      if (!hasPermission(role, currentPage.permission)) return <AccessDeniedPage />;
      if (currentPage.onlyForRoles && !currentPage.onlyForRoles.includes(role)) return <AccessDeniedPage />;
    }
  }

  if (isFullscreenRoute) return <>{children}</>;

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex h-screen w-full">
        {session && !isAnonymous && <AppSidebar session={session} />}
        <main className="flex-1 flex flex-col min-h-0">
          <DashboardHeader />
          <div className={`flex-1 min-h-0 ${isContainedRoute ? "overflow-hidden" : "overflow-auto"}`}>
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
