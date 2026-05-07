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
  SidebarRail,
  useSidebar,
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
  ChevronRight,
} from "lucide-react";
import { signOut, useSession } from "@/features/auth/client/auth-client";
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

function NavItem({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        render={<Link href={href} onClick={() => setOpenMobile(false)} />}
        isActive={isActive}
        tooltip={label}
        className="gap-3"
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span className="truncate">{label}</span>
        {isActive && <ChevronRight className="ml-auto w-3 h-3 opacity-50" />}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export default function AppSidebar() {
  const { data: session } = useSession();
  const { setOpenMobile } = useSidebar();
  const isAdmin = session?.user.role === Role.ADMIN;

  const initials = session?.user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      {/* Logo */}
      <SidebarHeader className="h-14 flex items-center px-3 border-b border-border">
        <SidebarMenuButton
          render={<Link href="/dashboard" onClick={() => setOpenMobile(false)} />}
          tooltip="AawasHub"
          className="h-9 gap-2 font-bold text-base"
        >
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center shrink-0">
            <Building2 className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="truncate">AawasHub</span>
        </SidebarMenuButton>
      </SidebarHeader>

      <SidebarContent className="py-2">
        {/* Main nav */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] px-4">Main</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => <NavItem key={item.href} {...item} />)}
          </SidebarMenu>
        </SidebarGroup>

        {/* Admin nav */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] px-4">Admin</SidebarGroupLabel>
            <SidebarMenu>
              {adminItems.map((item) => <NavItem key={item.href} {...item} />)}
            </SidebarMenu>
          </SidebarGroup>
        )}

        {/* Settings at bottom of content */}
        <SidebarGroup className="mt-auto">
          <SidebarMenu>
            <NavItem href="/settings" label="Settings" icon={Settings} />
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* User footer */}
      <SidebarFooter className="border-t border-border p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<button type="button" onClick={() => signOut()} />}
              tooltip="Sign out"
              className="h-auto py-2 gap-3"
            >
              <Avatar className="w-7 h-7 shrink-0">
                <AvatarImage src={session?.user.image ?? undefined} />
                <AvatarFallback className="text-[10px] font-semibold">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left group-data-[collapsible=icon]:hidden">
                <p className="text-xs font-semibold truncate">{session?.user.name}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{session?.user.role}</p>
              </div>
              <LogOut className="w-3.5 h-3.5 text-muted-foreground shrink-0 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {/* Rail for icon mode hover expand */}
      <SidebarRail />
    </Sidebar>
  );
}
