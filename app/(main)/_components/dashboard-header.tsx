"use client";

import { usePathname, useRouter } from "next/navigation";
import { Search, UserX } from "lucide-react";
import { useSession, authClient } from "@/lib/client/auth-client";
import { ModeToggle } from "@/components/theme-toggle";
import NotificationsBell from "./notifications-bell";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  onSearch?: (query: string) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onSearch }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const impersonatedBy = (session?.session as any)?.impersonatedBy as string | undefined;

  const skipHeaderPaths = [
    "/properties/",
    "/files",
    "/payment",
  ];

  // Check if current pathname starts with any of the skip paths
  const skipHeader = skipHeaderPaths.some((path) => pathname?.startsWith(path));

  if (skipHeader) return null;

  const pageTitle =
    pathname
      ?.split("/")
      .filter(Boolean)
      .pop()
      ?.replace(/[-_]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()) || "Dashboard";

  // Show search only on /dashboard
  const showSearch = pathname?.startsWith("/dashboard");

  // Get user initials fallback
  const userName = session?.user?.name || "";

  return (
    <header className="sticky top-0 z-20 bg-background border-b">
      {/* Impersonation banner */}
      {impersonatedBy && (
        <div className="flex items-center justify-between gap-3 bg-amber-500 text-white px-4 py-2 text-sm font-medium">
          <div className="flex items-center gap-2">
            <UserX className="h-4 w-4 shrink-0" />
            <span>
              You are impersonating <span className="font-bold">{session?.user?.name}</span>
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-6 px-2 text-xs border-white/40 text-white hover:bg-white/20 hover:text-white"
            onClick={async () => {
              await authClient.admin.stopImpersonating();
              router.push("/settings");
            }}
          >
            Stop Impersonating
          </Button>
        </div>
      )}
      <div className="px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold">{pageTitle}</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back{userName ? `, ${userName}` : ""}
            </p>
          </div>

          {/* Search + Notifications + Avatar */}
          <div className="flex items-center gap-3">
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  onChange={(e) => onSearch?.(e.target.value)}
                  className="h-10 w-64 rounded-lg border pl-9 pr-3 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            )}

            <NotificationsBell />

            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
