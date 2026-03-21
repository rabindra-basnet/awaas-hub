"use client";
import { useState, useEffect, useRef } from "react";
import { Shield, CheckCircle, Home } from "lucide-react";
import HeroSection from "./__components/hero-section";
import FeaturesSection from "./__components/features-section";
import CallToAction from "./__components/call-to-action";
import Header from "@/components/header";
import Footer from "./__components/footer";
import FeaturedProperties, {
  FeaturedProperty,
} from "./__components/featured-properties";
import { useQuery } from "@tanstack/react-query";

const featuresData = [
  {
    icon: <Shield className="h-10 w-10 text-primary" />,
    title: "Verified Listings",
    description:
      "Every property is verified by our team to ensure authenticity and quality.",
  },
  {
    icon: <CheckCircle className="h-10 w-10 text-primary" />,
    title: "Secure Transactions",
    description:
      "Your data and transactions are protected with bank-level security.",
  },
  {
    icon: <Home className="h-10 w-10 text-primary" />,
    title: "Wide Selection",
    description: "Find apartments, houses, commercial spaces across Nepal.",
  },
];

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

  // Refs for animations
  const heroHeadlineRef = useRef<HTMLDivElement>(null!);
  const searchBarRef = useRef<HTMLDivElement>(null!);
  const featureSectionRef = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    const timeline = [
      { ref: heroHeadlineRef, delay: 100 },
      { ref: searchBarRef, delay: 300 },
      { ref: featureSectionRef, delay: 500 },
    ];

    timeline.forEach(({ ref, delay }) => {
      if (ref.current) {
        setTimeout(() => {
          ref.current?.classList.add("opacity-100", "translate-y-0");
        }, delay);
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-orange-50 font-sans text-gray-800">
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <HeroSection searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <FeaturesSection
        features={featuresData}
        featureSectionRef={featureSectionRef}
      />

      <FeaturedProperties properties={featuredProperties} />

      <CallToAction />

      <Footer />

      <style jsx>{`
        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
