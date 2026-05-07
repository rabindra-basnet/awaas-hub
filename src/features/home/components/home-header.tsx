"use client";

import Link from "next/link";
import { useSession } from "@/features/auth/client/auth-client";
import { useLanguage } from "@/shared/components/language-provider";
import { Button } from "@/shared/components/ui/button";
import LanguageSwitcher from "@/shared/components/language-switcher";
import { Building2, Menu, X } from "lucide-react";
import { useState } from "react";

export default function HomeHeader() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  const navLinks = [
    { href: "/properties",   label: t.nav.properties },
    { href: "/#how-it-works", label: t.nav.howItWorks },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        <Link href="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
          <Building2 className="w-5 h-5 text-primary" />
          AawasHub
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} className="text-muted-foreground hover:text-foreground transition-colors">
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <LanguageSwitcher />
          {session?.user ? (
            <Button asChild size="sm">
              <Link href="/dashboard">{t.nav.dashboard}</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">{t.nav.signIn}</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">{t.nav.getStarted}</Link>
              </Button>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen((o) => !o)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-3 text-sm">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} className="block text-muted-foreground hover:text-foreground" onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
          <div className="flex items-center gap-2 pt-2">
            <LanguageSwitcher />
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href="/login">{t.nav.signIn}</Link>
            </Button>
            <Button asChild size="sm" className="flex-1">
              <Link href="/signup">{t.nav.getStarted}</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
