"use client";

import Link from "next/link";
import { useLanguage } from "@/shared/components/language-provider";
import { Button } from "@/shared/components/ui/button";
import { Search, ArrowRight } from "lucide-react";

export default function HeroSection() {
  const { t } = useLanguage();
  const { hero } = t;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 py-24 sm:py-32">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted text-xs font-medium text-muted-foreground">
          {hero.badge}
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-3xl mx-auto leading-tight">
          {hero.title}{" "}
          <span className="text-primary">{hero.titleHighlight}</span>
        </h1>

        <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
          {hero.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="gap-2 h-12 px-8">
            <Link href="/properties">
              <Search className="w-4 h-4" />
              {hero.browseCta}
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2 h-12 px-8">
            <Link href="/signup">
              {hero.listCta}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        <div className="flex items-center justify-center gap-8 pt-4">
          {[
            { label: hero.stats.properties, value: "500+" },
            { label: hero.stats.verified,   value: "300+" },
            { label: hero.stats.users,       value: "1,200+" },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
