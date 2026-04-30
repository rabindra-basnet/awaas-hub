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

const PUBLIC_PATHS = [/^\/properties$/, /^\/properties\/[a-fA-F0-9]{24}$/];

const FULLSCREEN_PATHS = [/^\/properties\/.+/];
const CONTAINED_PATHS = [/^\/properties$/];

export default function DashboardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AnonymousProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </AnonymousProvider>
  );
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPath = useMemo(
    () => !!pathname && PUBLIC_PATHS.some((p) => p.test(pathname)),
    [pathname],
  );

  const isFullscreenRoute = useMemo(
    () => !!pathname && FULLSCREEN_PATHS.some((p) => p.test(pathname)),
    [pathname],
  );

  const isContainedRoute = useMemo(
    () => !!pathname && CONTAINED_PATHS.some((p) => p.test(pathname)),
    [pathname],
  );

  const isAnonymous = session?.user?.isAnonymous === true;

  useEffect(() => {
    if (isPending || isPublicPath) return;

    // Logic: If there is NO session at all (not even guest), send to login.
    // If you want Guests to be able to see the dashboard, do NOT check for isAnonymous here.
    if (!session) {
      router.replace("/login");
    }
  }, [isPending, isPublicPath, session, router]);

  if (isPending) return null;

  // If not public and no session (and not anonymous), block render
  if (!isPublicPath && !session) return null;

  // RBAC for authenticated (non-guest) users
  if (session && !isAnonymous && !isPublicPath && pathname) {
    const role = session.user.role as Role;

    // 1. Entry guard — can this role enter the dashboard at all?
    if (
      !hasAnyPermission(role, [
        Permission.VIEW_DASHBOARD,
        Permission.VIEW_PROPERTIES,
      ])
    ) {
      return <AccessDeniedPage />;
    }

    // 2. Per-route guard — does this role have the specific page permission?
    const currentPage = DASHBOARD_PAGES.find(
      (page) =>
        pathname === page.href ||
        pathname.startsWith(page.href + "/"),
    );
    if (currentPage) {
      if (!hasPermission(role, currentPage.permission)) {
        return <AccessDeniedPage />;
      }
      if (currentPage.onlyForRoles && !currentPage.onlyForRoles.includes(role)) {
        return <AccessDeniedPage />;
      }
    }
  }

  if (isFullscreenRoute) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex h-screen w-full">
        {/* Only show sidebar to registered users */}
        {session && !isAnonymous && <AppSidebar session={session} />}
        <main className="flex-1 flex flex-col min-h-0">
          <DashboardHeader />
          <div className={`flex-1 min-h-0 ${isContainedRoute ? "overflow-hidden" : "overflow-auto"}`}>{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
