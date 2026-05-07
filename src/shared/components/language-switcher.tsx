"use client";

import { useLanguage } from "./language-provider";
import { locales, type Locale } from "@/shared/lib/i18n";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Languages } from "lucide-react";

const localeLabels: Record<Locale, { label: string; flag: string }> = {
  en: { label: "English", flag: "🇬🇧" },
  ne: { label: "नेपाली", flag: "🇳🇵" },
};

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const current = localeLabels[locale];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 h-8 px-2">
          <Languages className="w-3.5 h-3.5" />
          <span className="text-xs">{current.flag} {current.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => setLocale(loc)}
            className={locale === loc ? "bg-muted font-medium" : ""}
          >
            {localeLabels[loc].flag} {localeLabels[loc].label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
