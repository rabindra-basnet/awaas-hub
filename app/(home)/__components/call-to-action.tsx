"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLanguage } from "@/hooks/use-language";

export default function CallToAction() {
  const { t } = useLanguage();

  return (
    <section
      className="
        relative overflow-hidden py-24 px-4 sm:px-6 lg:px-8
        bg-gradient-to-br from-primary/90 via-primary to-primary/80
        dark:from-primary/70 dark:via-primary/60 dark:to-primary/50
      "
    >
      {/* DARK OVERLAY (IMPORTANT FIX) */}
      <div
        className="
          pointer-events-none absolute inset-0
          bg-black/20 dark:bg-black/40
        "
      />

      {/* SUBTLE NOISE / DEPTH LAYER */}
      <div
        className="
          pointer-events-none absolute inset-0 opacity-10
          bg-[radial-gradient(circle_at_20%_20%,white,transparent_40%)]
        "
      />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <h2 className="mb-6 text-3xl sm:text-5xl font-bold text-primary-foreground">
          {t("cta.title")}
        </h2>

        <p className="mb-8 text-lg sm:text-xl text-primary-foreground/80">
          {t("cta.subtitle")}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {/* PRIMARY BUTTON */}
          <Button
            asChild
            className="
              rounded-full px-6 py-6 font-medium
              bg-white text-primary
              hover:bg-primary-foreground hover:text-primary
              shadow-lg hover:shadow-2xl
              hover:scale-105
              transition-all duration-300
            "
          >
            <Link href="/login">{t("cta.getStarted")}</Link>
          </Button>

          {/* OUTLINE BUTTON */}
          <Button
            asChild
            variant="outline"
            className="
              rounded-full px-6 py-6 font-medium
              border-white/40
              hover:scale-105
              shadow-lg hover:shadow-xl
              transition-all duration-300
            "
          >
            <Link href="/about">{t("cta.learnMore")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
