import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function CtaSection() {
  return (
    <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="rounded-2xl bg-primary px-8 py-16 text-center text-primary-foreground space-y-6">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight max-w-xl mx-auto">
          Ready to find your next property?
        </h2>
        <p className="text-primary-foreground/80 max-w-md mx-auto">
          Join thousands of buyers and sellers on Nepal's most trusted real estate platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="gap-2 h-12 px-8"
          >
            <Link href="/signup">
              Create free account <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="gap-2 h-12 px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
          >
            <Link href="/properties">Browse listings</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
