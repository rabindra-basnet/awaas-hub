"use client";

import { useSession } from "@/lib/client/auth-client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useMemo } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./_components/app-sidebar";
import DashboardHeader from "./_components/dashboard-header";
import AccessDeniedPage from "@/components/access-denied";
import { Role, Permission, hasAnyPermission } from "@/lib/rbac";
// import { AnonymousProvider } from "../guest-provider";
// import Header from "@/components/header";

// Paths accessible without authentication
const PUBLIC_PATHS = [
  /^\/properties$/,
  /^\/properties\/[a-fA-F0-9]{24}$/, // only /properties/:id
];

// Routes where sidebar + header should be hidden (full-screen pages)
const FULLSCREEN_PATHS = [
  /^\/properties\/.+/, // /properties/[id], /properties/[id]/map, /properties/[id]/contact …
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPath = useMemo(
    () => !!pathname && PUBLIC_PATHS.some((p) => p.test(pathname)),
    [pathname],
  );

  // Hide chrome (sidebar + header) on full-screen routes
  const isFullscreenRoute = useMemo(
    () => !!pathname && FULLSCREEN_PATHS.some((p) => p.test(pathname)),
    [pathname],
  );

  const isAnonymous = session?.user?.isAnonymous === true;

  useEffect(() => {
    if (isPending || isPublicPath) return;
    if (!session || isAnonymous) router.replace("/login");
  }, [isPending, isPublicPath, session, isAnonymous, router]);

  if (isPending) return null;
  if (!isPublicPath && (!session || isAnonymous)) return null;

  if (session && !isAnonymous && !isPublicPath) {
    const role = session.user.role as Role;
    if (
      !hasAnyPermission(role, [
        Permission.VIEW_DASHBOARD,
        Permission.VIEW_PROPERTIES,
      ])
    ) {
      return <AccessDeniedPage />;
    }
  }

  // Full-screen layout — no sidebar, no header, children fill the viewport
  if (isFullscreenRoute) {
    return (
      <>
        {/*<Header />*/}
        {children}
      </>
    );
  }

  // Standard dashboard layout
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex h-screen w-full">
        {session && !isAnonymous && <AppSidebar session={session} />}
        <main className="flex-1 flex flex-col">
          <DashboardHeader />
          <div className="w-full overflow-auto">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
