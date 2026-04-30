"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Search } from "lucide-react";
import { useSession } from "@/lib/client/auth-client";
import { ModeToggle } from "@/components/theme-toggle";
import NotificationsBell from "./notifications-bell";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface DashboardHeaderProps {
  onSearch?: (query: string) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onSearch }) => {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isAnonymous = session?.user?.isAnonymous === true;

  const skipHeaderPaths = ["/properties/", "/files", "/payment"];
  if (skipHeaderPaths.some((p) => pathname?.startsWith(p))) return null;

  const pageTitle =
    pathname
      ?.split("/")
      .filter(Boolean)
      .pop()
      ?.replace(/[-_]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()) || "Dashboard";

  const showSearch = pathname?.startsWith("/dashboard");
  const userName = session?.user?.name || "";

  /* ── Guest header ─────────────────────────────────────────────────────── */
  if (isAnonymous) {
    return (
      <header className="sticky top-0 z-20 bg-background border-b">
        <div className="px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/home-logo.png"
                  alt="Awaas Hub Logo"
                  width={40}
                  height={40}
                  className="h-10 w-auto"
                  priority
                />
                <span className="sr-only">Awaas Hub</span>
              </Link>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-lg font-semibold text-foreground">Properties</h1>
            </div>

            <div className="flex items-center gap-2">
              <ModeToggle />
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  /* ── Authenticated header ─────────────────────────────────────────────── */
  return (
    <header className="sticky top-0 z-20 bg-background border-b">
      <div className="px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold">{pageTitle}</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back{userName ? `, ${userName}` : ""}
            </p>
          </div>

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
