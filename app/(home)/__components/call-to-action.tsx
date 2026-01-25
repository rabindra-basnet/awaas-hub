import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

const CallToAction: React.FC = () => {
  return (
    <section
      className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8
      bg-linear-to-br from-primary via-primary/90 to-primary/80
    "
    >
      {/* Subtle overlay pattern */}
      <div
        className="
          pointer-events-none absolute inset-0 opacity-10
        bg-primary-foreground/40
        "
      />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <h2 className="mb-6 text-4xl sm:text-5xl font-bold text-primary-foreground">
          Ready to Find Your Dream Property?
        </h2>

        <p className="mb-8 text-xl text-primary-foreground/80">
          Join thousands of satisfied customers who found their perfect home
          with AawasHub
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            className="rounded-full p-4 font-medium shadow-lg 
          bg-secondary text-secondary-foreground
          hover:bg-primary hover:text-primary-foreground hover:scale-105 
          transition-all duration-300 ease-in-out hover:shadow-xl"
          >
            <Link href="/login">Get Started Now</Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="rounded-full p-4 font-medium shadow-lg
          border-border/40 hover:bg-accent hover:text-accent-foreground 
          hover:border-border hover:scale-105
          transition-all duration-300 ease-in-out hover:shadow-xl"
          >
            <Link href="/about">Learn More</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
