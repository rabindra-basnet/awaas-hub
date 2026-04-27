"use client";

import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "np" : "en");
  };

  return (
    <Button
      onClick={toggleLanguage}
      variant="ghost"
      size="sm"
      className="gap-2 font-medium"
    >
      <Globe className="h-4 w-4" />
      <span className="hidden sm:inline">
        {language === "en" ? "नेपाली" : "English"}
      </span>
      <span className="sm:hidden">{language === "en" ? "NP" : "EN"}</span>
    </Button>
  );
}
