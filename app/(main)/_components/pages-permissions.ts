import React from "react";

import {
  User,
  Settings,
  Home,
  Heart,
  Building2,
  CalendarCheck,
  Users,
  BarChart3,
  LayoutDashboard,
  File,
  Speaker,
  SpeakerIcon,
  MessageCircle,
  Inbox,
} from "lucide-react";
import { Permission, Role } from "@/lib/rbac";

export type DashboardPage = {
  title: string;
  description: string;
  href: string;
  permission: Permission;
  icons: React.ComponentType<{ className?: string }>;
  onlyForRoles?: Role[];
};

export const DASHBOARD_PAGES: DashboardPage[] = [
  {
    title: "Dashboard",
    description: "View dashboard page",
    href: "/dashboard",
    permission: Permission.VIEW_PROFILE,
    icons: LayoutDashboard,
  },
  {
    title: "Properties",
    description: "Browse available properties",
    href: "/properties",
    permission: Permission.VIEW_PROPERTIES,
    icons: Home,
  },

  {
    title: "Favorites",
    description: "Your saved properties",
    href: "/favorites",
    permission: Permission.VIEW_FAVORITES,
    icons: Heart,
  },
  {
    title: "Files",
    description: "View and manage uploaded files",
    href: "/files",
    permission: Permission.VIEW_FILES, // all roles with view can see
    icons: File,
  },
  {
    title: "Settings",
    description: "Account preferences and security",
    href: "/settings",
    permission: Permission.MANAGE_SETTINGS,
    icons: Settings,
  },
  {
    title: "Ads",
    description: "View Ads page",
    href: "/ads",
    permission: Permission.MANAGE_ADS,
    icons: SpeakerIcon,
  },
  {
    title: "Support Inbox",
    description: "Manage user support conversations",
    href: "/support/inbox",
    permission: Permission.MANAGE_SUPPORT_CHAT,
    icons: Inbox,
    onlyForRoles: [Role.ADMIN],
  },
  {
    title: "Users",
    description: "Manage user accounts and roles",
    href: "/users",
    permission: Permission.MANAGE_USERS,
    icons: Users,
    onlyForRoles: [Role.ADMIN],
  },
];
