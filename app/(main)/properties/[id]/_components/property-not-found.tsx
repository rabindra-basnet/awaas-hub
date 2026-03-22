// app/(main)/properties/[id]/_components/property-not-found.tsx

import Link from "next/link";
import { Building2, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PropertyNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm flex flex-col items-center text-center gap-6">
        {/* Illustration */}
        <div className="relative">
          <div className="w-28 h-28 rounded-3xl bg-muted/60 border border-border/50 flex items-center justify-center">
            <Building2 size={48} className="text-muted-foreground/30" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
            <X size={14} className="text-destructive" />
          </div>
          <div className="absolute -bottom-2 -left-2 w-6 h-6 rounded-lg bg-muted border border-border/50" />
          <div className="absolute top-1 -left-4 w-4 h-4 rounded-md bg-muted/80 border border-border/40" />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight">
            Property not found
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-[260px] mx-auto">
            This listing may have been removed, sold, or the link might be
            incorrect.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 w-full">
          <Button
            asChild
            size="lg"
            className="w-full h-11 rounded-xl font-bold text-sm gap-2"
          >
            <Link href="/properties">
              <ArrowLeft size={15} />
              Browse Listings
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-muted-foreground text-xs h-9"
          >
            <Link href="/">Go to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
