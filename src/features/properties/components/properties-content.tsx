"use client";

import { useRef, useEffect, useState } from "react";
import { useInfiniteProperties, infinitePropertiesOptions } from "@/features/properties/queries/properties.queries";
import PropertyCard from "./property-card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";
import { useDebounce } from "@/shared/hooks/use-debounce";

const CATEGORIES = ["House", "Apartment", "Land", "Colony"];
const STATUSES   = ["available", "booked", "sold"];

export default function PropertiesContent() {
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState<string | undefined>();
  const [status, setStatus]     = useState<string | undefined>();
  const debouncedSearch = useDebounce(search, 400);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteProperties({
    category,
    status,
    search: debouncedSearch || undefined,
  });

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasNextPage) fetchNextPage(); },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage]);

  const allItems = data.pages.flatMap((page) => page.items);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* Header + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>

        <Select value={category ?? "all"} onValueChange={(v) => setCategory(v === "all" ? undefined : v)}>
          <SelectTrigger className="w-full sm:w-40 h-10">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={status ?? "all"} onValueChange={(v) => setStatus(v === "all" ? undefined : v)}>
          <SelectTrigger className="w-full sm:w-36 h-10">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      {allItems.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Showing {allItems.length} propert{allItems.length === 1 ? "y" : "ies"}
        </p>
      )}

      {/* Grid */}
      {allItems.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <SlidersHorizontal className="w-10 h-10 mx-auto opacity-20 mb-3" />
          <p className="text-sm">No properties found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {allItems.map((p) => (
            <PropertyCard key={p._id} property={p} />
          ))}

          {/* Loading skeletons */}
          {isFetchingNextPage &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-4" />
    </div>
  );
}
