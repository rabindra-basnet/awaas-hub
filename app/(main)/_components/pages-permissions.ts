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
} from "lucide-react";
import { Permission } from "@/lib/rbac";

export type DashboardPage = {
  title: string;
  description: string;
  href: string;
  permission: Permission;
  icons: React.ComponentType<{ className?: string }>;
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
    title: "Analytics",
    description: "Platform insights and metrics",
    href: "/analytics",
    permission: Permission.VIEW_ANALYTICS,
    icons: BarChart3,
  },
];
