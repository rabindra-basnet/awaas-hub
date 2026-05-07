"use client";

import Link from "next/link";
import { useFeaturedProperties } from "@/features/home/queries/home.queries";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { MapPin, BedDouble, Bath, Maximize2, Building2, ArrowRight } from "lucide-react";
import { Suspense } from "react";

function FeaturedGrid() {
  const { data: properties } = useFeaturedProperties();

  if (properties.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((p) => (
        <Link
          key={p._id}
          href={`/properties/${p._id}`}
          className="group rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="relative h-52 bg-muted overflow-hidden">
            {p.imageUrl ? (
              <img
                src={p.imageUrl}
                alt={p.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Building2 className="w-12 h-12 text-muted-foreground/20" />
              </div>
            )}
            <div className="absolute top-3 left-3">
              <Badge className="text-[10px]">{p.category}</Badge>
            </div>
          </div>

          <div className="p-4 space-y-2">
            <p className="font-semibold truncate group-hover:text-primary transition-colors">
              {p.title}
            </p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{p.location}</span>
            </p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {p.bedrooms != null && (
                <span className="flex items-center gap-1"><BedDouble className="w-3 h-3" />{p.bedrooms}</span>
              )}
              {p.bathrooms != null && (
                <span className="flex items-center gap-1"><Bath className="w-3 h-3" />{p.bathrooms}</span>
              )}
              {p.area && (
                <span className="flex items-center gap-1"><Maximize2 className="w-3 h-3" />{p.area}</span>
              )}
            </div>
            <p className="font-bold text-base pt-1">NPR {p.price.toLocaleString()}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function FeaturedSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border overflow-hidden">
          <Skeleton className="h-52 w-full" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FeaturedProperties() {
  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Featured Properties</h2>
          <p className="text-muted-foreground mt-1">Verified listings ready for viewing</p>
        </div>
        <Button asChild variant="outline" className="gap-2 hidden sm:flex">
          <Link href="/properties">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>

      <Suspense fallback={<FeaturedSkeleton />}>
        <FeaturedGrid />
      </Suspense>

      <div className="flex justify-center sm:hidden">
        <Button asChild variant="outline" className="gap-2">
          <Link href="/properties">View all properties <ArrowRight className="w-4 h-4" /></Link>
        </Button>
      </div>
    </section>
  );
}
