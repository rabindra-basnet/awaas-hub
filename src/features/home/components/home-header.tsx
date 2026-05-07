"use client";

import Link from "next/link";
import { useSession } from "@/features/auth/client/auth-client";
import { Button } from "@/shared/components/ui/button";
import { Building2, Menu } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/properties", label: "Properties" },
  { href: "/#how-it-works", label: "How it works" },
];

export default function HomeHeader() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Building2 className="w-5 h-5 text-primary" />
          AawasHub
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Auth CTA */}
        <div className="hidden md:flex items-center gap-3">
          {session?.user ? (
            <Button asChild size="sm">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Get started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button className="md:hidden" onClick={() => setOpen((o) => !o)}>
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-3 text-sm">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="block text-muted-foreground hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
          <div className="flex gap-2 pt-2">
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm" className="flex-1">
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
