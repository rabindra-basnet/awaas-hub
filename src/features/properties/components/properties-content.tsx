"use client";

import { useRef, useEffect, useState } from "react";
import { useInfiniteProperties } from "@/features/properties/queries/properties.queries";
import PropertyCard from "./property-card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import {
  Search, Plus, Home, Building2, TreePine, Map,
  Building, SlidersHorizontal, Loader2, LogIn,
} from "lucide-react";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { authClient } from "@/features/auth/client/auth-client";
import { Role } from "@/features/auth/rbac/access";
import Link from "next/link";

const CATEGORIES = [
  { value: "House",     label: "House",     icon: Home },
  { value: "Apartment", label: "Apartment", icon: Building2 },
  { value: "Land",      label: "Land",      icon: TreePine },
  { value: "Colony",    label: "Colony",    icon: Map },
] as const;

const STATUSES = ["available", "booked", "sold"] as const;

function CardSkeleton() {
  return (
    <div className="rounded-[--rounded-card] border border-border overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="p-4 space-y-2.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <div className="flex justify-between items-center pt-1">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function PropertiesContent() {
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState<string | undefined>();
  const [status, setStatus]     = useState<string | undefined>();
  const debouncedSearch = useDebounce(search, 400);

  const { data: session, isPending } = authClient.useSession();
  const isGuest    = isPending || !session || !!(session.user as any).isAnonymous;
  const role       = isGuest ? null : (session.user.role as Role);
  const userId     = isGuest ? undefined : session.user.id;
  const isAdmin    = role === Role.ADMIN;

  // Use authClient.admin.checkRolePermission for synchronous client-side RBAC checks
  const canFavorite = !isGuest && !!role && authClient.admin.checkRolePermission({
    role,
    permissions: { favorite: ["create"] },
  });
  const canCreate = !isGuest && !!role && authClient.admin.checkRolePermission({
    role,
    permissions: { property: ["create"] },
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteProperties({
    category,
    status,
    search: debouncedSearch || undefined,
  });

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting && hasNextPage) fetchNextPage(); },
      { rootMargin: "300px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasNextPage, fetchNextPage]);

  const allItems = data.pages.flatMap((p) => p.items);
  const isFiltered = !!(category || status || debouncedSearch);

  return (
    <div className="page-shell">

      {/* ── Guest banner ─────────────────────────────────────── */}
      {isGuest && !isPending && (
        <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-5 py-3.5 gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium">Browsing as guest</p>
            <p className="text-xs text-muted-foreground mt-0.5">Sign in to save favorites and contact sellers</p>
          </div>
          <Button size="sm" className="shrink-0" render={<Link href="/login" />} nativeButton={false}><LogIn className="w-4 h-4 mr-1.5" /> Sign in</Button>
        </div>
      )}

      {/* ── Page header ──────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Properties</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {allItems.length > 0 ? `${allItems.length}${hasNextPage ? "+" : ""} listings` : "Browse verified listings"}
          </p>
        </div>
        {canCreate && (
          <Button size="sm" render={<Link href="/properties/new" />} nativeButton={false}><Plus className="w-4 h-4 mr-1.5" /> New Listing</Button>
        )}
      </div>

      {/* ── Filters ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by title or location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>

        {/* Status */}
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

      {/* ── Category chips ───────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setCategory(undefined)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            !category
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          <Building className="w-3.5 h-3.5" /> All
        </button>
        {CATEGORIES.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setCategory(category === value ? undefined : value)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              category === value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* ── Grid ─────────────────────────────────────────────── */}
      {allItems.length === 0 && !isFetchingNextPage ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 py-24 gap-4 text-muted-foreground">
          <SlidersHorizontal className="w-12 h-12 opacity-20" />
          <div className="text-center">
            <p className="font-medium text-sm">
              {isFiltered ? "No properties match your filters" : "No properties yet"}
            </p>
            {isFiltered && (
              <button
                className="text-xs text-primary mt-1 hover:underline"
                onClick={() => { setSearch(""); setCategory(undefined); setStatus(undefined); }}
              >
                Clear filters
              </button>
            )}
          </div>
          {!isGuest && canCreate && !isFiltered && (
            <Button size="sm" render={<Link href="/properties/new" />} nativeButton={false}><Plus className="w-4 h-4 mr-1.5" /> Add First Listing</Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {allItems.map((p) => (
            <PropertyCard
              key={p._id}
              property={p}
              canFavorite={canFavorite}
              canManage={(isAdmin || p.sellerId === userId)}
            />
          ))}
          {isFetchingNextPage &&
            Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="flex justify-center py-4 h-12">
        {isFetchingNextPage && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
      </div>
    </div>
  );
}
