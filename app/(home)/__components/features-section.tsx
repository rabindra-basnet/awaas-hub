"use client";

import React from "react";
import { useLanguage } from "@/hooks/use-language";
import { Shield, CheckCircle, Home } from "lucide-react";

interface FeaturesSectionProps {
  featureSectionRef: React.RefObject<HTMLDivElement | null>;
}

export default function FeaturesSection({
  featureSectionRef,
}: FeaturesSectionProps) {
  const { t } = useLanguage();

  const features = [
    {
      icon: <Shield className="h-7 w-7 text-primary" />,
      title: t("features.verifiedListings.title"),
      description: t("features.verifiedListings.description"),
    },
    {
      icon: <CheckCircle className="h-7 w-7 text-primary" />,
      title: t("features.secureTransactions.title"),
      description: t("features.secureTransactions.description"),
    },
    {
      icon: <Home className="h-7 w-7 text-primary" />,
      title: t("features.wideSelection.title"),
      description: t("features.wideSelection.description"),
    },
  ];

  return (
    <section
      id="features"
      className="
        relative py-20 px-6
        bg-background
        dark:bg-[hsl(var(--background))]
      "
    >
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-14 text-center">
          <h2 className="mb-3 text-3xl lg:text-4xl font-bold text-foreground">
            {t("features.title")}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t("features.subtitle")}
          </p>
        </div>

        {/* GRID */}
        <div
          ref={featureSectionRef}
          className="
            grid gap-8 md:grid-cols-3
            opacity-0 translate-y-6
            transition-all duration-700
          "
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="
                relative group rounded-2xl p-7
                border border-border/70
                bg-card
                dark:bg-card/90
                shadow-sm
                hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/40
                hover:-translate-y-1
                transition-all duration-300
              "
            >
              {/* subtle glow only in dark mode */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 bg-primary/5 transition-opacity" />

              {/* ICON */}
              <div
                className="
                  relative z-10 mb-4 inline-flex
                  items-center justify-center
                  rounded-xl p-3
                  bg-muted
                  dark:bg-muted/60
                  shadow-sm
                  group-hover:scale-105 transition-transform
                "
              >
                {feature.icon}
              </div>

              {/* TITLE */}
              <h3 className="relative z-10 mb-2 text-lg font-semibold text-foreground">
                {feature.title}
              </h3>

              {/* DESCRIPTION */}
              <p className="relative z-10 text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}