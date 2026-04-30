"use client";

import React, { useState, useMemo, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  X, ChevronDown, ChevronUp, ArrowUpDown,
  MapPin, Ruler, Heart, MoreHorizontal,
  Pencil, CheckCircle2, Search,
  Home, RotateCcw, Plus,
  Building2, Navigation, Clock, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { hasPermission, Permission, Role } from "@/lib/rbac";
import { useSession } from "@/lib/client/auth-client";
import {
  useInfiniteProperties, useDeleteProperty, useToggleFavorite,
} from "@/lib/client/queries/properties.queries";
import PropertiesSkeleton from "./properties-skeleton";
import DeletePropertyDialog from "./delete-property";

// ── Constants ────────────────────────────────────────────────────────────────
const LOCATIONS = ["Kathmandu", "Lalitpur", "Bhaktapur", "Pokhara", "Chitwan", "Butwal", "Biratnagar", "Dharan"];
const CATEGORIES = ["House", "Apartment", "Land", "Colony", "Commercial"];
const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Price ↑", value: "price_asc" },
  { label: "Price ↓", value: "price_desc" },
];
type SortKey = "newest" | "oldest" | "price_asc" | "price_desc";

interface Filters {
  search: string; statuses: string[]; locations: string[];
  categories: string[]; minPrice: string; maxPrice: string;
  negotiable: boolean; verified: boolean;
}
const EMPTY: Filters = {
  search: "", statuses: [], locations: [], categories: [],
  minPrice: "", maxPrice: "", negotiable: false, verified: false,
};

// ── Main ─────────────────────────────────────────────────────────────────────
export default function PropertiesContent() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const isAnonymous = session?.user?.isAnonymous === true;
  const isGuest = isPending || !session || isAnonymous;
  const canManage = !isGuest && hasPermission(session?.user?.role as Role, Permission.MANAGE_PROPERTIES);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteProperties();

  const deleteProperty = useDeleteProperty();
  const toggleFav = useToggleFavorite();

  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [sort, setSort] = useState<SortKey>("newest");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const allProperties = useMemo(() => {
    const flat = data?.pages.flatMap((p) => p.items) ?? [];
    const seen = new Set<string>();
    return flat.filter((p) => {
      const id = String(p._id);
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [data]);

  const patch = useCallback(<K extends keyof Filters>(k: K, v: Filters[K]) => {
    setFilters(f => ({ ...f, [k]: v }));
  }, []);

  const toggle = useCallback((k: "statuses" | "locations" | "categories", v: string) => {
    setFilters(f => {
      const a = f[k] as string[];
      return { ...f, [k]: a.includes(v) ? a.filter(x => x !== v) : [...a, v] };
    });
  }, []);

  const clearAll = useCallback(() => { setFilters(EMPTY); setSort("newest"); }, []);

  const hasFilters = filters.statuses.length > 0 || filters.categories.length > 0 ||
    filters.locations.length > 0 || !!filters.minPrice || !!filters.maxPrice ||
    filters.negotiable || filters.verified || !!filters.search;

  const counts = useMemo(() => {
    const s: Record<string, number> = {}, c: Record<string, number> = {}, l: Record<string, number> = {};
    for (const p of allProperties) {
      const st = p.status?.toLowerCase() ?? "available";
      s[st] = (s[st] ?? 0) + 1;
      if (p.category) c[p.category] = (c[p.category] ?? 0) + 1;
      for (const loc of LOCATIONS)
        if (p.location?.toLowerCase().includes(loc.toLowerCase()))
          l[loc] = (l[loc] ?? 0) + 1;
    }
    return { s, c, l };
  }, [allProperties]);

  const filtered = useMemo(() => {
    let list = [...allProperties];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(p => p.title?.toLowerCase().includes(q) || p.location?.toLowerCase().includes(q));
    }
    if (filters.statuses.length) list = list.filter(p => filters.statuses.includes(p.status?.toLowerCase()));
    if (filters.categories.length) list = list.filter(p => filters.categories.some(c => p.category?.toLowerCase() === c.toLowerCase()));
    if (filters.locations.length) list = list.filter(p => filters.locations.some(l => p.location?.toLowerCase().includes(l.toLowerCase())));
    if (filters.minPrice) list = list.filter(p => p.price >= Number(filters.minPrice));
    if (filters.maxPrice) list = list.filter(p => p.price <= Number(filters.maxPrice));
    if (filters.negotiable) list = list.filter(p => p.negotiable);
    if (filters.verified) list = list.filter(p => p.verificationStatus === "verified");
    const ts = (p: any) => (p.createdAt ? new Date(p.createdAt).getTime() : 0);
    list.sort((a, b) => {
      if (sort === "oldest") return ts(a) - ts(b);
      if (sort === "price_asc") return (a.price ?? 0) - (b.price ?? 0);
      if (sort === "price_desc") return (b.price ?? 0) - (a.price ?? 0);
      return ts(b) - ts(a); // newest
    });
    return list;
  }, [allProperties, filters, sort]);

  const observerRef = useRef<IntersectionObserver | null>(null);

  // Always-fresh refs so the observer callback never closes over stale values
  const hasNextPageRef = useRef(hasNextPage);
  const isFetchingRef = useRef(isFetchingNextPage);
  const fetchNextPageRef = useRef(fetchNextPage);
  hasNextPageRef.current = hasNextPage;
  isFetchingRef.current = isFetchingNextPage;
  fetchNextPageRef.current = fetchNextPage;

  // Callback ref on the sentinel element. Uses viewport (root: null) so it
  // doesn't depend on the scroll container ref being set at the same time —
  // React sets child refs before parent refs, so scrollContainerRef.current
  // would still be null when this fires on the initial mount.
  const sentinelRef = useCallback((el: HTMLDivElement | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (!el) return;
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPageRef.current && !isFetchingRef.current) {
          fetchNextPageRef.current();
        }
      },
      { rootMargin: "0px 0px 300px 0px" },
    );
    observerRef.current.observe(el);
  }, []);

  if (isLoading) return <PropertiesSkeleton />;
  if (isError) return (
    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
      Failed to load properties.
    </div>
  );

  const requireAuth = (fn: () => void) => {
    if (isGuest) { router.push("/login"); return; }
    fn();
  };

  return (
    <div className="flex h-full min-h-0 overflow-hidden">

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 border-r border-border/60 overflow-y-auto bg-card ml-2 rounded-tl-xl [scrollbar-width:none] [&::-webkit-scrollbar]:w-0">
        <div className="p-5">
          <FilterPanel filters={filters} counts={counts} hasFilters={hasFilters} clearAll={clearAll} toggle={toggle} patch={patch} />
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setMobileFiltersOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-card border-r border-border overflow-y-auto p-5 z-10" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold">Filters</span>
              <button onClick={() => setMobileFiltersOpen(false)}><X size={16} className="text-muted-foreground" /></button>
            </div>
            <FilterPanel filters={filters} counts={counts} hasFilters={hasFilters} clearAll={clearAll} toggle={toggle} patch={patch} />
            <Button className="w-full mt-6 rounded-xl" onClick={() => setMobileFiltersOpen(false)}>
              Show {filtered.length} properties
            </Button>
          </div>
        </div>
      )}

      {/* Results pane */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">

        {/* Fixed info bar — count + sort + search */}
        <div className="shrink-0 px-4 lg:px-6 pt-4 pb-2 space-y-2">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
              {filtered.length === 1 ? "property" : "properties"} found
              {hasNextPage && (
                <span className="text-xs ml-1 text-muted-foreground/60">(more loading…)</span>
              )}
            </p>
            <div className="flex items-center gap-2">
              {canManage && (
                <button
                  onClick={() => router.push("/properties/new")}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-3 py-1.5 transition-colors"
                >
                  <Plus size={13} /> New Property
                </button>
              )}
              {/* Search */}
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={e => patch("search", e.target.value)}
                  placeholder="Search…"
                  className="h-[30px] w-36 sm:w-44 rounded-lg border border-border/50 bg-card pl-7 pr-6 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-colors"
                />
                {filters.search && (
                  <button onClick={() => patch("search", "")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X size={11} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5 border border-border/50 rounded-lg px-2.5 py-1.5">
                <ArrowUpDown size={12} className="text-muted-foreground shrink-0" />
                <select value={sort} onChange={e => setSort(e.target.value as SortKey)} className="text-xs font-medium bg-card text-foreground outline-none cursor-pointer">
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value} className="bg-card text-foreground">{o.label}</option>)}
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* Scrollable grid — only this region scrolls */}
        <div className="flex-1 overflow-y-auto min-h-0 px-4 lg:px-6 pb-4 [scrollbar-width:thin]">
          {filtered.length === 0 && !isFetchingNextPage ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                <Home size={26} className="text-muted-foreground opacity-40" />
              </div>
              <div>
                <p className="font-semibold text-sm">No properties found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {hasNextPage ? "More results are loading…" : "Try adjusting your filters"}
                </p>
              </div>
              {hasFilters && (
                <Button variant="outline" size="sm" onClick={clearAll} className="gap-1.5 text-xs">
                  <RotateCcw size={12} /> Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((p: any) => (
                  <PropertyCard
                    key={p._id}
                    property={p}
                    canManage={canManage}
                    isFavorite={!!p.isFavorite}
                    onFavorite={() => requireAuth(() => toggleFav.mutate({ propertyId: p._id, isFav: !!p.isFavorite }))}
                    onDelete={id => requireAuth(() => deleteProperty.mutate(id))}
                  />
                ))}
              </div>

              {/* Sentinel + loading indicator */}
              <div ref={sentinelRef} className="flex items-center justify-center py-8">
                {isFetchingNextPage && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 size={16} className="animate-spin" />
                    Loading more…
                  </div>
                )}
                {!hasNextPage && filtered.length > 0 && (
                  <p className="text-xs text-muted-foreground/50">All properties loaded</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Property card ─────────────────────────────────────────────────────────────

function PropertyCard({
  property: p, canManage, isFavorite, onFavorite, onDelete,
}: {
  property: any; canManage: boolean; isFavorite: boolean;
  onFavorite: () => void; onDelete: (id: string) => void;
}) {
  const router = useRouter();
  const [imgIdx, setImgIdx] = useState(0);

  const images: string[] =
    Array.isArray(p.images) && p.images.length > 0
      ? p.images
      : ["https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80"];

  const isSold = p.status?.toLowerCase() === "sold";
  const isBooked = p.status?.toLowerCase() === "booked";

  const statusStyle = isSold
    ? "bg-red-500 text-white"
    : isBooked
      ? "bg-amber-500 text-white"
      : "bg-emerald-500 text-white";

  const statusLabel = isSold ? "Sold" : isBooked ? "Booked" : "For Sale";

  const daysAgo = p.createdAt
    ? Math.floor((Date.now() - new Date(p.createdAt).getTime()) / 86_400_000)
    : null;

  const daysLabel =
    daysAgo === null ? null
      : daysAgo === 0 ? "Added today"
      : daysAgo === 1 ? "Added yesterday"
      : `Added ${daysAgo}d ago`;

  return (
    <div
      className={cn(
        "group flex flex-col rounded-2xl overflow-hidden bg-card border border-border/50 hover:border-border hover:shadow-xl transition-all duration-300 cursor-pointer",
        isSold && "opacity-85",
      )}
      onClick={e => {
        if ((e.target as HTMLElement).closest("button,a,[role='menuitem']")) return;
        router.push(`/properties/${p._id}`);
      }}
    >
      {/* ── Photo ── */}
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <div
          className="flex h-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${imgIdx * 100}%)`, width: `${images.length * 100}%` }}
        >
          {images.map((src, i) => (
            <div key={`${src}-${i}`} className="relative h-full shrink-0" style={{ width: `${100 / images.length}%` }}>
              <Image
                src={src} alt={p.title} fill
                sizes="(max-width:640px)100vw,(max-width:1024px)50vw,33vw"
                className={cn("object-cover transition-transform duration-700 group-hover:scale-[1.04]", isSold && "grayscale-[25%]")}
              />
            </div>
          ))}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <div className="flex flex-col gap-1.5">
            <span className={cn("inline-flex text-[10px] font-bold px-2.5 py-1 rounded-full", statusStyle)}>
              {statusLabel}
            </span>
            {p.verificationStatus === "verified" && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-white/90 text-emerald-700 px-2 py-0.5 rounded-full">
                <CheckCircle2 size={9} /> Verified
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={e => { e.stopPropagation(); onFavorite(); }}
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all",
                isFavorite
                  ? "bg-white text-red-500"
                  : "bg-black/40 text-white opacity-0 group-hover:opacity-100 hover:bg-white hover:text-red-500",
              )}
            >
              <Heart size={14} className={cn(isFavorite && "fill-current")} />
            </button>

            {canManage && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    onClick={e => e.stopPropagation()}
                    className="h-8 w-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 hover:bg-black/70 transition-all"
                  >
                    <MoreHorizontal size={14} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 rounded-xl">
                  <DropdownMenuItem asChild className="gap-2 cursor-pointer">
                    <Link href={`/properties/${p._id}/edit`}><Pencil size={13} /> Edit</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <div className="p-1">
                    <DeletePropertyDialog propertyId={p._id} onDelete={onDelete} />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div>
            <p className="text-white text-lg font-black leading-tight drop-shadow-md">
              NPR {new Intl.NumberFormat("en-IN").format(p.price)}
            </p>
            {p.negotiable && (
              <span className="text-white/80 text-[10px] font-semibold">Negotiable</span>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex items-center gap-1">
              <button onClick={e => { e.stopPropagation(); setImgIdx(i => (i - 1 + images.length) % images.length); }}
                className="h-6 w-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity">
                ‹
              </button>
              <span className="text-[10px] text-white/80 font-bold tabular-nums">{imgIdx + 1}/{images.length}</span>
              <button onClick={e => { e.stopPropagation(); setImgIdx(i => (i + 1) % images.length); }}
                className="h-6 w-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity">
                ›
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Details ── */}
      <div className="flex flex-col gap-2 p-4">
        <h3 className="font-semibold text-[13px] leading-snug line-clamp-1 text-foreground group-hover:text-primary transition-colors">
          {p.title}
        </h3>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin size={11} className="text-primary shrink-0" />
          <span className="truncate">{p.location || "Location N/A"}</span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          {p.category && (
            <span className="flex items-center gap-1">
              <Building2 size={11} className="shrink-0" /> {p.category}
            </span>
          )}
          {p.area && (
            <span className="flex items-center gap-1">
              <Ruler size={11} className="shrink-0" /> {p.area} Aana
            </span>
          )}
          {p.face && (
            <span className="flex items-center gap-1">
              <Navigation size={11} className="shrink-0" /> {p.face}
            </span>
          )}
        </div>

        {(p.roadType || p.municipality) && (
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground/70">
            {p.roadType && <span>{p.roadType} road</span>}
            {p.municipality && <span>· {p.municipality}</span>}
          </div>
        )}

        <div className="h-px bg-border/40 mt-1" />

        <div className="flex items-center justify-between">
          {daysLabel && (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
              <Clock size={10} /> {daysLabel}
            </span>
          )}
          <button
            onClick={() => router.push(`/properties/${p._id}`)}
            className={cn(
              "ml-auto text-xs font-semibold flex items-center gap-1 transition-colors",
              isSold ? "text-muted-foreground hover:text-foreground" : "text-primary hover:text-primary/80",
            )}
          >
            {isSold ? "View details" : "View property"} ›
          </button>
        </div>
      </div>
    </div>
  );
}

// ── FilterPanel — must live OUTSIDE PropertiesContent so React never sees a
//    new component type on re-render, which would cause inputs to lose focus. ──
interface FilterPanelProps {
  filters: Filters;
  counts: { s: Record<string, number>; c: Record<string, number>; l: Record<string, number> };
  hasFilters: boolean;
  clearAll: () => void;
  toggle: (k: "statuses" | "locations" | "categories", v: string) => void;
  patch: <K extends keyof Filters>(k: K, v: Filters[K]) => void;
}
function FilterPanel({ filters, counts, hasFilters, clearAll, toggle, patch }: FilterPanelProps) {
  return (
    <div className="divide-y divide-border/50">
      <div className="flex items-center justify-between pb-4">
        <span className="font-bold text-sm">Filters</span>
        {hasFilters && (
          <button onClick={clearAll} className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
            <RotateCcw size={11} /> Clear
          </button>
        )}
      </div>

      <Accordion label="Listing Status" open>
        {[
          { label: "Available", val: "available", color: "bg-emerald-500" },
          { label: "Booked", val: "booked", color: "bg-amber-500" },
          { label: "Sold", val: "sold", color: "bg-red-500" },
        ].map(({ label, val, color }) => (
          <CheckItem key={val} checked={filters.statuses.includes(val)} onChange={() => toggle("statuses", val)} count={counts.s[val]}>
            <span className={cn("w-2 h-2 rounded-full shrink-0", color)} />
            {label}
          </CheckItem>
        ))}
      </Accordion>

      <Accordion label="Property Type" open>
        {CATEGORIES.map(cat => (
          <CheckItem key={cat} checked={filters.categories.includes(cat)} onChange={() => toggle("categories", cat)} count={counts.c[cat]}>
            {cat}
          </CheckItem>
        ))}
      </Accordion>

      <Accordion label="Location">
        {LOCATIONS.map(loc => (
          <CheckItem key={loc} checked={filters.locations.includes(loc)} onChange={() => toggle("locations", loc)} count={counts.l[loc]}>
            {loc}
          </CheckItem>
        ))}
      </Accordion>

      <Accordion label="Price Range (NPR)" open>
        <div className="flex gap-2 pt-1">
          <div className="flex-1">
            <p className="text-[10px] text-muted-foreground mb-1">Min</p>
            <Input type="number" value={filters.minPrice} onChange={e => patch("minPrice", e.target.value)} placeholder="Any" className="h-8 text-xs" />
          </div>
          <span className="text-muted-foreground text-xs self-end mb-1.5">–</span>
          <div className="flex-1">
            <p className="text-[10px] text-muted-foreground mb-1">Max</p>
            <Input type="number" value={filters.maxPrice} onChange={e => patch("maxPrice", e.target.value)} placeholder="Any" className="h-8 text-xs" />
          </div>
        </div>
      </Accordion>

      <Accordion label="More Options">
        <CheckItem checked={filters.negotiable} onChange={() => patch("negotiable", !filters.negotiable)}>Negotiable price</CheckItem>
        <CheckItem checked={filters.verified} onChange={() => patch("verified", !filters.verified)}>Verified only</CheckItem>
      </Accordion>
    </div>
  );
}

// ── Accordion ─────────────────────────────────────────────────────────────────
function Accordion({ label, open: defaultOpen = false, children }: { label: string; open?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="py-4">
      <button onClick={() => setOpen(v => !v)} className="flex items-center justify-between w-full text-left group mb-0">
        <span className="text-[11px] font-bold text-foreground/80 uppercase tracking-wider">{label}</span>
        {open ? <ChevronUp size={13} className="text-muted-foreground" /> : <ChevronDown size={13} className="text-muted-foreground" />}
      </button>
      {open && <div className="mt-3 flex flex-col gap-0.5">{children}</div>}
    </div>
  );
}

// ── Checkbox row ──────────────────────────────────────────────────────────────
function CheckItem({ checked, onChange, count, children }: {
  checked: boolean; onChange: () => void; count?: number; children: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-2.5 py-1.5 px-1 rounded-lg cursor-pointer hover:bg-muted/40 transition-colors group">
      <div
        onClick={onChange}
        className={cn(
          "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all",
          checked ? "bg-primary border-primary" : "border-border/60 group-hover:border-primary/50",
        )}
      >
        {checked && (
          <svg viewBox="0 0 10 8" className="w-2.5 h-2 fill-none stroke-white stroke-[2.5]">
            <polyline points="1,4 3.5,6.5 9,1" />
          </svg>
        )}
      </div>
      <span onClick={onChange} className={cn("flex items-center gap-1.5 text-[12px] flex-1 transition-colors", checked ? "text-foreground font-medium" : "text-muted-foreground group-hover:text-foreground")}>
        {children}
      </span>
      {count !== undefined && count > 0 && (
        <span className="text-[10px] text-muted-foreground/50 tabular-nums">{count}</span>
      )}
    </label>
  );
}
