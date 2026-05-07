"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/shared/components/ui/sidebar";
import {
  LayoutDashboard,
  Building2,
  Heart,
  CalendarCheck,
  Users,
  BarChart2,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { signOut, useSession } from "@/features/auth/client/auth-client";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Role } from "@/features/auth/rbac/access";

const navItems = [
  { href: "/dashboard",    label: "Dashboard",    icon: LayoutDashboard },
  { href: "/properties",   label: "Properties",   icon: Building2 },
  { href: "/favorites",    label: "Favorites",    icon: Heart },
  { href: "/appointments", label: "Appointments", icon: CalendarCheck },
];

const adminItems = [
  { href: "/users",     label: "Users",     icon: Users },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
];

export default function AppSidebar() {
  const pathname  = usePathname();
  const { data: session } = useSession();
  const isAdmin   = session?.user.role === Role.ADMIN;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-3">
        <span className="font-bold text-lg tracking-tight">AawasHub</span>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map(({ href, label, icon: Icon }) => (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === href || pathname.startsWith(href + "/")}
                  tooltip={label}
                >
                  <Link href={href}>
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarMenu>
              {adminItems.map(({ href, label, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === href}
                    tooltip={label}
                  >
                    <Link href={href}>
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-3 space-y-2">
        {session?.user && (
          <div className="flex items-center gap-2 px-1">
            <Avatar className="w-7 h-7">
              <AvatarImage src={session.user.image ?? undefined} />
              <AvatarFallback className="text-xs">
                {session.user.name?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{session.user.name}</p>
              <p className="text-[10px] text-muted-foreground capitalize">{session.user.role}</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={() => signOut()}
        >
          <LogOut className="w-4 h-4" />
          <span>Sign out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
