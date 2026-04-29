"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  MapPin,
  Building2,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  ArrowUpDown,
  Home,
  CheckCircle2,
  Banknote,
  RotateCcw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { hasPermission, Permission, Role } from "@/lib/rbac";
import { useSession } from "@/lib/client/auth-client";
import { useSuspenseQuery } from "@tanstack/react-query";

import PropertyListCard from "./property-list-card";
import FloatingAddProperty from "./floating-add-property";
import {
  propertiesQuery,
  useDeleteProperty,
  useToggleFavorite,
} from "@/lib/client/queries/properties.queries";

const ITEMS_PER_PAGE = 12;

const LOCATIONS = [
  "Kathmandu",
  "Lalitpur",
  "Bhaktapur",
  "Pokhara",
  "Chitwan",
  "Butwal",
  "Biratnagar",
  "Dharan",
];

const CATEGORIES = ["House", "Apartment", "Land", "Colony", "Commercial"];

const STATUSES = [
  { label: "Available", value: "available", color: "text-emerald-600" },
  { label: "Booked", value: "booked", color: "text-amber-600" },
  { label: "Sold", value: "sold", color: "text-red-500" },
];

const SORT_OPTIONS = [
  { label: "Newest first", value: "newest" },
  { label: "Oldest first", value: "oldest" },
  { label: "Price: low → high", value: "price_asc" },
  { label: "Price: high → low", value: "price_desc" },
];

type SortKey = "newest" | "oldest" | "price_asc" | "price_desc";

export default function PropertiesContent() {
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } = useSession();

  const isAnonymous = session?.user?.isAnonymous === true;
  const canManage =
    !isSessionLoading && !!session && !isAnonymous
      ? hasPermission(session.user.role as Role, Permission.MANAGE_PROPERTIES)
      : false;

  const { data: properties = [] } = useSuspenseQuery(propertiesQuery());
  const deleteProperty = useDeleteProperty();
  const toggleFav = useToggleFavorite();

  // ── Filter state ──────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [locations, setLocations] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [negotiable, setNegotiable] = useState(false);
  const [verified, setVerified] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleItem = (
    arr: string[],
    set: (v: string[]) => void,
    val: string,
  ) => {
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
    setCurrentPage(1);
  };

  const clearAll = () => {
    setSearch("");
    setLocations([]);
    setCategories([]);
    setStatuses([]);
    setMinPrice("");
    setMaxPrice("");
    setNegotiable(false);
    setVerified(false);
    setSortKey("newest");
    setCurrentPage(1);
  };

  const activeFilterCount =
    locations.length +
    categories.length +
    statuses.length +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    (negotiable ? 1 : 0) +
    (verified ? 1 : 0);

  // ── Filter + sort ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...properties] as any[];

    if (search)
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(search.toLowerCase()) ||
          p.location?.toLowerCase().includes(search.toLowerCase()),
      );

    if (locations.length)
      list = list.filter((p) =>
        locations.some((l) =>
          p.location?.toLowerCase().includes(l.toLowerCase()),
        ),
      );

    if (categories.length)
      list = list.filter((p) =>
        categories.some(
          (c) => p.category?.toLowerCase() === c.toLowerCase(),
        ),
      );

    if (statuses.length)
      list = list.filter((p) =>
        statuses.includes(p.status?.toLowerCase()),
      );

    if (minPrice)
      list = list.filter((p) => p.price >= Number(minPrice));

    if (maxPrice)
      list = list.filter((p) => p.price <= Number(maxPrice));

    if (negotiable) list = list.filter((p) => p.negotiable);
    if (verified)
      list = list.filter((p) => p.verificationStatus === "verified");

    list.sort((a, b) => {
      switch (sortKey) {
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "price_asc":
          return (a.price ?? 0) - (b.price ?? 0);
        case "price_desc":
          return (b.price ?? 0) - (a.price ?? 0);
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

    return list;
  }, [
    properties,
    search,
    locations,
    categories,
    statuses,
    minPrice,
    maxPrice,
    negotiable,
    verified,
    sortKey,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const pageData = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const requireAuth = (action: () => void) => {
    if (isAnonymous || !session) {
      router.push("/login");
      return;
    }
    action();
  };

  // ── Sidebar panel ─────────────────────────────────────────────────────────
  const FilterSidebar = () => (
    <aside className="w-full flex flex-col gap-5">
      {/* Search */}
      <div>
        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
          Search
        </label>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Title or location…"
            className="pl-8 h-9 text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Status */}
      <FilterSection label="Status">
        <div className="flex flex-col gap-1.5">
          {STATUSES.map(({ label, value, color }) => (
            <Toggle
              key={value}
              active={statuses.includes(value)}
              onClick={() => toggleItem(statuses, setStatuses, value)}
            >
              <span className={cn("w-2 h-2 rounded-full shrink-0", {
                "bg-emerald-500": value === "available",
                "bg-amber-500": value === "booked",
                "bg-red-500": value === "sold",
              })} />
              <span className={cn("text-xs font-medium", color)}>{label}</span>
            </Toggle>
          ))}
        </div>
      </FilterSection>

      {/* Location */}
      <FilterSection label="Location">
        <div className="flex flex-wrap gap-1.5">
          {LOCATIONS.map((loc) => (
            <Chip
              key={loc}
              active={locations.includes(loc)}
              onClick={() => toggleItem(locations, setLocations, loc)}
            >
              {loc}
            </Chip>
          ))}
        </div>
      </FilterSection>

      {/* Category */}
      <FilterSection label="Property Type">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              active={categories.includes(cat)}
              onClick={() => toggleItem(categories, setCategories, cat)}
            >
              {cat}
            </Chip>
          ))}
        </div>
      </FilterSection>

      {/* Price range */}
      <FilterSection label="Price Range (NPR)">
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            value={minPrice}
            onChange={(e) => { setMinPrice(e.target.value); setCurrentPage(1); }}
            placeholder="Min"
            className="h-8 text-xs"
          />
          <span className="text-muted-foreground text-xs shrink-0">–</span>
          <Input
            type="number"
            value={maxPrice}
            onChange={(e) => { setMaxPrice(e.target.value); setCurrentPage(1); }}
            placeholder="Max"
            className="h-8 text-xs"
          />
        </div>
      </FilterSection>

      {/* Toggles */}
      <FilterSection label="More Filters">
        <div className="flex flex-col gap-2">
          <BoolToggle
            label="Negotiable"
            active={negotiable}
            onClick={() => { setNegotiable((v) => !v); setCurrentPage(1); }}
          />
          <BoolToggle
            label="Verified only"
            active={verified}
            onClick={() => { setVerified((v) => !v); setCurrentPage(1); }}
          />
        </div>
      </FilterSection>

      {/* Clear */}
      {activeFilterCount > 0 && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-destructive transition-colors mt-1"
        >
          <RotateCcw size={12} /> Clear all filters
          <span className="ml-auto bg-primary text-primary-foreground text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
            {activeFilterCount}
          </span>
        </button>
      )}
    </aside>
  );

  return (
    <div className="max-w-screen-xl mx-auto px-4 lg:px-6 py-6">
      {canManage && <FloatingAddProperty />}

      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-2">
          {/* Mobile filter toggle */}
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden gap-1.5 text-xs h-8"
            onClick={() => setSidebarOpen((v) => !v)}
          >
            <SlidersHorizontal size={13} />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                {activeFilterCount}
              </span>
            )}
          </Button>

          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
            propert{filtered.length !== 1 ? "ies" : "y"}
          </p>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <ArrowUpDown size={13} className="text-muted-foreground" />
          <select
            value={sortKey}
            onChange={(e) => { setSortKey(e.target.value as SortKey); setCurrentPage(1); }}
            className="text-xs font-medium bg-transparent border-none outline-none text-foreground cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        {/* ── Sidebar (desktop always visible, mobile as overlay) ── */}
        <div
          className={cn(
            "lg:w-56 xl:w-64 shrink-0",
            "lg:block",
            sidebarOpen
              ? "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:relative lg:inset-auto lg:z-auto lg:bg-transparent lg:backdrop-blur-none flex"
              : "hidden lg:block",
          )}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSidebarOpen(false);
          }}
        >
          <div className={cn(
            "bg-card border border-border/60 rounded-2xl p-4 overflow-y-auto",
            "lg:max-h-[calc(100vh-160px)] lg:sticky lg:top-4",
            "max-h-screen w-72 lg:w-full ml-auto lg:ml-0 shadow-xl lg:shadow-none",
          )}>
            {/* Mobile close */}
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <span className="text-sm font-semibold">Filters</span>
              <button onClick={() => setSidebarOpen(false)}>
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>
            <FilterSidebar />
          </div>
        </div>

        {/* ── Grid ── */}
        <div className="flex-1 min-w-0">
          {pageData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                <Home size={28} className="opacity-30" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold">No properties found</p>
                <p className="text-xs mt-1 text-muted-foreground/70">
                  Try adjusting your filters
                </p>
              </div>
              {activeFilterCount > 0 && (
                <Button variant="outline" size="sm" onClick={clearAll} className="gap-1.5 text-xs">
                  <RotateCcw size={12} /> Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {pageData.map((property: any) => (
                <PropertyListCard
                  key={property._id}
                  property={property}
                  canManage={canManage}
                  isFavorite={!!property.isFavorite}
                  onToggleFavorite={(id, isFav) =>
                    requireAuth(() =>
                      toggleFav.mutate({ propertyId: id, isFav }),
                    )
                  }
                  onDelete={(id) => requireAuth(() => deleteProperty.mutate(id))}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-border/40">
              <p className="text-xs text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => { setCurrentPage((p) => p - 1); window.scrollTo(0, 0); }}
                  className="h-8 px-3 text-xs gap-1"
                >
                  <ChevronLeft size={13} /> Prev
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const p = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
                  return (
                    <Button
                      key={p}
                      variant={p === currentPage ? "default" : "outline"}
                      size="sm"
                      className="h-8 w-8 p-0 text-xs"
                      onClick={() => { setCurrentPage(p); window.scrollTo(0, 0); }}
                    >
                      {p}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => { setCurrentPage((p) => p + 1); window.scrollTo(0, 0); }}
                  className="h-8 px-3 text-xs gap-1"
                >
                  Next <ChevronRight size={13} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Small reusable sub-components ────────────────────────────────────────────

function FilterSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        {label}
      </p>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-muted/30 text-muted-foreground border-border/50 hover:border-border hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function Toggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-all w-full",
        active
          ? "bg-primary/8 border-primary/40"
          : "border-border/40 hover:border-border hover:bg-muted/30",
      )}
    >
      {children}
      <div
        className={cn(
          "ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
          active ? "border-primary bg-primary" : "border-border",
        )}
      >
        {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>
    </button>
  );
}

function BoolToggle({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-medium transition-all",
        active
          ? "bg-primary/8 border-primary/40 text-primary"
          : "border-border/40 text-muted-foreground hover:border-border hover:text-foreground",
      )}
    >
      {label}
      <div
        className={cn(
          "w-8 h-4 rounded-full border transition-all flex items-center px-0.5",
          active ? "bg-primary border-primary" : "bg-muted border-border",
        )}
      >
        <div
          className={cn(
            "w-3 h-3 rounded-full bg-white transition-all",
            active ? "translate-x-4" : "translate-x-0",
          )}
        />
      </div>
    </button>
  );
}
