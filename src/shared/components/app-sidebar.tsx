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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
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
  MessageCircle,
  HeadphonesIcon,
  CreditCard,
  FolderOpen,
  ChevronUp,
} from "lucide-react";
import { signOut, useSession } from "@/features/auth/client/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Role } from "@/features/auth/rbac/access";

const navItems = [
  { href: "/dashboard",    label: "Dashboard",    icon: LayoutDashboard },
  { href: "/properties",   label: "Properties",   icon: Building2 },
  { href: "/favorites",    label: "Favorites",    icon: Heart },
  { href: "/appointments", label: "Appointments", icon: CalendarCheck },
  { href: "/chat",         label: "Inquiries",    icon: MessageCircle },
  { href: "/support",      label: "Support",      icon: HeadphonesIcon },
  { href: "/billing",      label: "Billing",      icon: CreditCard },
  { href: "/files",        label: "Files",        icon: FolderOpen },
];

const adminItems = [
  { href: "/admin/users", label: "Users",     icon: Users },
  { href: "/analytics",   label: "Analytics", icon: BarChart2 },
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
  const isAnon = !!(session?.user as any)?.isAnonymous;

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

        {/* Settings */}
        <SidebarGroup className="mt-auto">
          <SidebarMenu>
            <NavItem href="/settings" label="Settings" icon={Settings} />
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* User footer — dropdown, NOT a sign-out button */}
      <SidebarFooter className="border-t border-border p-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<button className="w-full flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring group" />}
          >
            <Avatar className="w-7 h-7 shrink-0">
              <AvatarImage src={session?.user.image ?? undefined} />
              <AvatarFallback className="text-[10px] font-semibold">
                {isAnon ? "G" : (initials ?? "?")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-left group-data-[collapsible=icon]:hidden">
              <p className="text-xs font-semibold truncate">
                {isAnon ? "Guest" : (session?.user.name ?? "User")}
              </p>
              <p className="text-[10px] text-muted-foreground capitalize">
                {isAnon ? "Browsing anonymously" : session?.user.role}
              </p>
            </div>
            <ChevronUp className="w-3.5 h-3.5 text-muted-foreground shrink-0 group-data-[collapsible=icon]:hidden" />
          </DropdownMenuTrigger>

          <DropdownMenuContent side="top" align="start" className="w-52 mb-1">
            {/* User info */}
            <div className="px-2 py-1.5 border-b border-border mb-1">
              <p className="text-xs font-semibold truncate">
                {isAnon ? "Guest User" : session?.user.name}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {isAnon ? "Not signed in" : session?.user.email}
              </p>
            </div>

            <DropdownMenuGroup>
              {isAnon ? (
                <DropdownMenuItem render={<Link href="/login" />}>
                  Sign in to your account
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem render={<Link href="/settings" />}>
                    <Settings className="mr-2 h-3.5 w-3.5" /> Account Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/billing" />}>
                    <CreditCard className="mr-2 h-3.5 w-3.5" /> Billing & Credits
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuGroup>

            {!isAnon && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => signOut()}
                  >
                    <LogOut className="mr-2 h-3.5 w-3.5" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
