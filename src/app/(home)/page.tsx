import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/shared/lib/query-client";
import { fetchFeaturedProperties } from "@/features/home/server/home.fetcher";
import { featuredPropertiesOptions } from "@/features/home/queries/home.queries";
import HeroSection from "@/features/home/components/hero-section";
import FeaturedProperties from "@/features/home/components/featured-properties";
import HowItWorks from "@/features/home/components/how-it-works";
import CtaSection from "@/features/home/components/cta-section";

export default async function HomePage() {
  const qc = getQueryClient();

  await qc.prefetchQuery({
    queryKey: featuredPropertiesOptions.queryKey,
    queryFn:  fetchFeaturedProperties,
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <HeroSection />
      <FeaturedProperties />
      <HowItWorks />
      <CtaSection />
    </HydrationBoundary>
  );
}
