"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { Separator } from "@/shared/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Moon, Sun, LogOut, Settings, User, Bell, Plus } from "lucide-react";
import { useTheme } from "@/shared/components/theme-provider";
import { signOut, useSession } from "@/features/auth/client/auth-client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

const routeLabels: Record<string, string> = {
  dashboard:    "Dashboard",
  properties:   "Properties",
  favorites:    "Favorites",
  appointments: "Appointments",
  chat:         "Inquiries",
  support:      "Support",
  billing:      "Billing",
  files:        "Files",
  analytics:    "Analytics",
  admin:        "Admin",
  users:        "Users",
  settings:     "Settings",
  new:          "New",
  edit:         "Edit",
};

function useBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  return segments.map((seg, i) => ({
    label: routeLabels[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1),
    href:  "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }));
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

function NotificationBell() {
  const { data: session } = useSession();
  const isAnon = !!(session?.user as any)?.isAnonymous;

  const { data } = useQuery({
    queryKey: ["support", "notifications"],
    queryFn: async () => {
      const res = await fetch("/api/support/user-notifications");
      if (!res.ok) return { unread: 0 };
      return res.json();
    },
    refetchInterval: 30_000,
    enabled: !!session?.user && !isAnon,
  });

  const unread: number = data?.unread ?? 0;

  return (
    <button
      type="button"
      className="relative h-8 w-8 rounded-md flex items-center justify-center hover:bg-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="Notifications"
      onClick={() => {
        const el = document.getElementById("support-chat-link");
        el?.click();
      }}
    >
      <Bell className="h-4 w-4" />
      {unread > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground px-1">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </button>
  );
}

function QuickCreate() {
  const { data: session } = useSession();
  const isAnon = !!(session?.user as any)?.isAnonymous;
  if (!session?.user || isAnon) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<button className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border hover:bg-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Quick create" />}
      >
        <Plus className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Create new</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<Link href="/properties/new" />}>
            New Property Listing
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/appointments/new" />}>
            New Appointment
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserMenu() {
  const { data: session } = useSession();
  if (!session?.user) return null;

  const isAnon = !!(session.user as any).isAnonymous;
  const initials = session.user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 cursor-pointer">
        <Avatar className="h-8 w-8">
          <AvatarImage src={session.user.image ?? undefined} alt={session.user.name} />
          <AvatarFallback className="text-xs font-semibold">
            {isAnon ? "G" : initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* User info header — plain div, not a Group label */}
        <div className="px-2 py-1.5">
          <p className="text-sm font-semibold truncate">
            {isAnon ? "Guest" : session.user.name}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {isAnon ? "Browsing as guest" : session.user.email}
          </p>
        </div>
        <DropdownMenuSeparator />
        {!isAnon && (
          <>
            <DropdownMenuItem render={<Link href="/settings" />} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/settings" />} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {isAnon ? (
          <DropdownMenuItem render={<Link href="/login" />} className="cursor-pointer font-medium">
            Sign in to your account
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            className="text-destructive focus:text-destructive cursor-pointer"
            onClick={() => signOut()}
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function DashboardHeader() {
  const crumbs = useBreadcrumbs();

  return (
    <header className="header-sticky flex h-14 shrink-0 items-center gap-2 px-4">
      <SidebarTrigger className="-ml-1 h-8 w-8" />
      <Separator orientation="vertical" className="h-4" />

      {/* Breadcrumb */}
      <Breadcrumb className="flex-1 min-w-0">
        <BreadcrumbList>
          {crumbs.map((crumb, i) => (
            <span key={crumb.href} className="flex items-center">
              {i > 0 && <BreadcrumbSeparator className="mx-1" />}
              <BreadcrumbItem>
                {crumb.isLast ? (
                  <BreadcrumbPage className="font-medium text-sm truncate max-w-[12rem]">
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    render={<Link href={crumb.href} />}
                    className="text-sm text-muted-foreground hover:text-foreground truncate max-w-[8rem]"
                  >
                    {crumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </span>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Right actions */}
      <div className="flex items-center gap-1 ml-auto">
        <QuickCreate />
        <NotificationBell />
        <ThemeToggle />
        <UserMenu />
      </div>

      {/* Hidden link for notification bell to navigate */}
      <Link href="/support" id="support-chat-link" className="sr-only" tabIndex={-1}>
        Support
      </Link>
    </header>
  );
}
