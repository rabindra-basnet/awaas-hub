"use client";

import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { useSession } from "@/lib/client/auth-client";
import { ModeToggle } from "@/components/theme-toggle";

interface DashboardHeaderProps {
  onSearch?: (query: string) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onSearch }) => {
  const pathname = usePathname();
  const { data: session } = useSession();

  const skipHeaderPaths = ["/properties/", "/appointments/","/files"];

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
      <div className="p-4">
        <div className="flex items-center justify-between pl-10">
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

            <button className="h-10 w-10 rounded-lg border flex items-center justify-center hover:bg-accent transition-colors">
              <Bell className="h-5 w-5 text-muted-foreground" />
            </button>

            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
