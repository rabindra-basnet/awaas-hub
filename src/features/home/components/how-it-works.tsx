import { Search, ShieldCheck, CalendarCheck, KeyRound } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Browse listings",
    description: "Search verified properties across Nepal filtered by location, price, and category.",
  },
  {
    icon: ShieldCheck,
    title: "Verified quality",
    description: "Every listing is reviewed and verified by our team before going public.",
  },
  {
    icon: CalendarCheck,
    title: "Book a viewing",
    description: "Schedule property viewings, inspections, or legal reviews directly from the platform.",
  },
  {
    icon: KeyRound,
    title: "Close the deal",
    description: "Connect with owners, negotiate, and finalize your property purchase with confidence.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-muted/40 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            From search to signing — we make finding your next property simple.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map(({ icon: Icon, title, description }, i) => (
            <div key={title} className="relative space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center hidden lg:flex">
                {i + 1}
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
