"use client";

import { useEffect, useRef, useState } from "react";
import HeroSection from "./__components/hero-section";
import FeaturesSection from "./__components/features-section";
import CallToAction from "./__components/call-to-action";
import Header from "@/components/header";
import Footer from "./__components/footer";
import FeaturedProperties, {
  FeaturedProperty,
} from "./__components/featured-properties";
import { useQuery } from "@tanstack/react-query";
import { LanguageProvider } from "@/hooks/use-language";

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: featuredProperties = [] } = useQuery<FeaturedProperty[]>({
    queryKey: ["featured-properties"],
    queryFn: async () => {
      const response = await fetch("/api/properties/featured", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch featured properties");
      }

      return response.json();
    },
  });

  const featureSectionRef = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    if (featureSectionRef.current) {
      setTimeout(() => {
        featureSectionRef.current?.classList.add(
          "opacity-100",
          "translate-y-0"
        );
      }, 500);
    }
  }, []);

  return (
    <LanguageProvider>
      <div
        className="
          min-h-screen
          bg-background text-foreground
          transition-colors duration-300
        "
      >
        <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

        <main className="relative">
          <HeroSection
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          <FeaturesSection featureSectionRef={featureSectionRef} />

          <FeaturedProperties properties={featuredProperties} />

          <CallToAction />
        </main>

        <Footer />
      </div>
    </LanguageProvider>
  );
};

export default HomePage;