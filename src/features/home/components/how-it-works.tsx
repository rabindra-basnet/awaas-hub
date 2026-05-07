"use client";

import { useLanguage } from "@/shared/components/language-provider";
import { Search, ShieldCheck, CalendarCheck, KeyRound } from "lucide-react";

const icons = [Search, ShieldCheck, CalendarCheck, KeyRound];

export default function HowItWorks() {
  const { t } = useLanguage();
  const { howItWorks } = t;

  return (
    <section id="how-it-works" className="py-20 bg-muted/40 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">{howItWorks.title}</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">{howItWorks.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {howItWorks.steps.map((step, i) => {
            const Icon = icons[i];
            return (
              <div key={step.title} className="relative space-y-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="absolute -top-2 left-1/2 -translate-x-[3.5rem] w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center hidden lg:flex">
                  {i + 1}
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
