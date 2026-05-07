"use client";

import { useLanguage } from "@/shared/components/language-provider";
import { Building2 } from "lucide-react";

export default function HomeFooter() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <Building2 className="w-4 h-4 text-primary" />
          AawasHub
        </div>
        <p>© {new Date().getFullYear()} AawasHub. {t.footer.rights}</p>
      </div>
    </footer>
  );
}
