"use client";

import { use, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  MapPin,
  Building2,
  Ruler,
  Navigation,
  Hospital,
  Plane,
  ShoppingCart,
  School,
  Dumbbell,
  Bus,
  Utensils,
  Wallet,
  Layers,
  ChevronRight,
  Maximize2,
  Minimize2,
  Info,
  X,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProperty } from "@/lib/client/queries/properties.queries";

// ── Types ────────────────────────────────────────────────────────────
interface FacilityCategory {
  key: string;
  label: string;
  /** Search term passed to Google Maps */
  searchTerm: string;
  icon: LucideIcon;
  color: string;
  propKey: string;
}

interface StatItem {
  icon: LucideIcon;
  label: string;
  value: string;
}

// ── Google Maps Embed API key — set in .env.local ────────────────────
// NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY=AIza…
const GMAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY ?? "";

// ── Map mode types ───────────────────────────────────────────────────
type MapMode = "place" | "search" | "directions";

// ── Facility config ──────────────────────────────────────────────────
const FACILITY_CATEGORIES: FacilityCategory[] = [
  {
    key: "hospital",
    label: "Hospital",
    searchTerm: "hospital",
    icon: Hospital,
    color: "#ef4444",
    propKey: "nearHospital",
  },
  {
    key: "airport",
    label: "Airport",
    searchTerm: "airport",
    icon: Plane,
    color: "#3b82f6",
    propKey: "nearAirport",
  },
  {
    key: "supermarket",
    label: "Supermarket",
    searchTerm: "supermarket",
    icon: ShoppingCart,
    color: "#f59e0b",
    propKey: "nearSupermarket",
  },
  {
    key: "school",
    label: "School",
    searchTerm: "school",
    icon: School,
    color: "#8b5cf6",
    propKey: "nearSchool",
  },
  {
    key: "gym",
    label: "Gym",
    searchTerm: "gym fitness",
    icon: Dumbbell,
    color: "#10b981",
    propKey: "nearGym",
  },
  {
    key: "transport",
    label: "Transport",
    searchTerm: "bus stop transport",
    icon: Bus,
    color: "#06b6d4",
    propKey: "nearTransport",
  },
  {
    key: "atm",
    label: "ATM",
    searchTerm: "ATM bank",
    icon: Wallet,
    color: "#ec4899",
    propKey: "nearAtm",
  },
  {
    key: "restaurant",
    label: "Restaurant",
    searchTerm: "restaurant",
    icon: Utensils,
    color: "#f97316",
    propKey: "nearRestaurant",
  },
];

// ── Build Google Maps Embed URL ──────────────────────────────────────
function buildEmbedUrl(
  lat: number,
  lng: number,
  activeFacilityKey: string | null,
  zoom: number = 16,
): string {
  const base = "https://www.google.com/maps/embed/v1";
  const key = GMAPS_KEY;

  // If a facility is selected → search for that facility near the property
  if (activeFacilityKey) {
    const fac = FACILITY_CATEGORIES.find((f) => f.key === activeFacilityKey);
    if (fac) {
      const q = encodeURIComponent(`${fac.searchTerm} near ${lat},${lng}`);
      return `${base}/search?key=${key}&q=${q}&zoom=${zoom}`;
    }
  }

  // Default → show the property location pinned on the map
  return `${base}/place?key=${key}&q=${lat},${lng}&zoom=${zoom}`;
}

// ── Fallback URL (no API key — opens Google Maps directly in iframe) ──
function buildFallbackUrl(
  lat: number,
  lng: number,
  activeFacilityKey: string | null,
): string {
  if (activeFacilityKey) {
    const fac = FACILITY_CATEGORIES.find((f) => f.key === activeFacilityKey);
    if (fac) {
      const q = encodeURIComponent(`${fac.searchTerm}`);
      return `https://maps.google.com/maps?q=${q}&near=${lat},${lng}&z=15&output=embed`;
    }
  }
  return `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`;
}

// ── Page ─────────────────────────────────────────────────────────────
export default function PremiumMapPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const { data: property, isLoading } = useProperty(id);

  const [activeFacilityKey, setActiveFacilityKey] = useState<string | null>(
    null,
  );
  const [panelOpen, setPanelOpen] = useState<boolean>(true);
  const [fullscreen, setFullscreen] = useState<boolean>(false);
  const [zoom] = useState<number>(16);

  // ── Loading ──────────────────────────────────────────────────────
  if (isLoading || !property) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">
            Loading premium map…
          </p>
        </div>
      </div>
    );
  }

  const lat: number = (property.latitude as number | undefined) ?? 27.7172;
  const lng: number = (property.longitude as number | undefined) ?? 85.324;

  const { title, location, price, area, category, face, municipality } =
    property as {
      title?: string;
      location?: string;
      price?: number;
      area?: string | number;
      category?: string;
      face?: string;
      municipality?: string;
      negotiable?: boolean;
      [key: string]: unknown;
    };

  // ── Embed URL — switches when a facility chip is clicked ─────────
  const embedUrl = GMAPS_KEY
    ? buildEmbedUrl(lat, lng, activeFacilityKey, zoom)
    : buildFallbackUrl(lat, lng, activeFacilityKey);

  // ── Active facility meta (for the active state indicator) ────────
  const activeFacility = FACILITY_CATEGORIES.find(
    (f) => f.key === activeFacilityKey,
  );

  const handleFacilityClick = (key: string) => {
    // Toggle — clicking the same chip resets to property view
    setActiveFacilityKey((prev) => (prev === key ? null : key));
  };

  // ── Google Maps directions link (opens in new tab) ───────────────
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  const bottomStats: StatItem[] = [
    { icon: Building2, label: "Type", value: (category as string) || "N/A" },
    { icon: Ruler, label: "Area", value: area ? `${area} Ana` : "N/A" },
    { icon: Navigation, label: "Face", value: (face as string) || "N/A" },
    {
      icon: MapPin,
      label: "Location",
      value: (location as string | undefined)?.split(",")[0] ?? "N/A",
    },
  ];

  return (
    <div
      className={cn(
        "relative bg-background text-foreground overflow-hidden",
        fullscreen ? "fixed inset-0 z-[9999]" : "h-screen flex flex-col",
      )}
    >
      {/*
        Z-index layers:
          (iframe)  — Google Maps iframe (no z)
          z-[900]   — Slide-in panel + panel trigger
          z-[1000]  — Top bar
          z-[1001]  — Bottom stats bar
      */}

      {/* ── TOP BAR — z-[1000] ───────────────────────────────────── */}
      <div className="absolute inset-x-0 top-0 z-[1000] flex items-center justify-between gap-2 px-4 py-3 bg-background/80 backdrop-blur-2xl border-b border-border/40">
        {/* LEFT: back + title */}
        <div className="flex items-center gap-3 min-w-0 shrink-0">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors shadow-sm shrink-0"
          >
            <ArrowLeft size={15} />
          </button>
          <div className="hidden sm:block min-w-0">
            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-widest leading-none mb-0.5">
              Premium Map
            </p>
            <p className="text-sm font-bold leading-tight truncate max-w-[180px]">
              {title ?? "Property"}
            </p>
          </div>
        </div>

        {/* CENTRE: active facility indicator OR "Property View" label */}
        <div className="flex items-center gap-2">
          {activeFacility ? (
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all"
              style={{
                backgroundColor: `${activeFacility.color}15`,
                borderColor: `${activeFacility.color}40`,
                color: activeFacility.color,
              }}
            >
              <activeFacility.icon size={12} />
              <span>{activeFacility.label} nearby</span>
              <button
                onClick={() => setActiveFacilityKey(null)}
                className="ml-1 opacity-60 hover:opacity-100"
              >
                <X size={11} />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
              <MapPin size={11} className="text-primary" />
              <span className="truncate max-w-[200px]">
                {location ?? "Property view"}
              </span>
            </div>
          )}
        </div>

        {/* RIGHT: directions + fullscreen */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex w-9 h-9 rounded-xl bg-card border border-border items-center justify-center hover:bg-muted transition-colors shadow-sm"
            title="Get directions"
          >
            <ExternalLink size={14} />
          </a>
          <button
            onClick={() => setFullscreen((f) => !f)}
            className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors shadow-sm"
          >
            {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* ── MAP AREA — fills below top bar ───────────────────────── */}
      <div className="absolute inset-0 top-[56px]">
        {/* Google Maps iframe */}
        <iframe
          key={embedUrl} /* re-mount on URL change so the map reloads */
          src={embedUrl}
          className="absolute inset-0 w-full h-full border-0"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Property map"
        />

        {/* ── SLIDE-IN LEFT PANEL — z-[900] ────────────────────── */}
        <div
          className={cn(
            "absolute top-4 left-4 bottom-20 z-[900] w-[300px] transition-all duration-300 ease-in-out",
            panelOpen
              ? "translate-x-0 opacity-100"
              : "-translate-x-[320px] opacity-0 pointer-events-none",
          )}
        >
          <div className="h-full bg-card/95 backdrop-blur-2xl border border-border/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Panel header */}
            <div className="px-5 pt-5 pb-4 border-b border-border/50">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                    Property
                  </p>
                  <h2 className="text-sm font-bold leading-snug line-clamp-2">
                    {title ?? "N/A"}
                  </h2>
                </div>
                <button
                  onClick={() => setPanelOpen(false)}
                  className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center transition-colors shrink-0 mt-0.5"
                >
                  <X size={13} className="text-muted-foreground" />
                </button>
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-muted-foreground">
                <MapPin size={11} className="text-destructive shrink-0" />
                <span className="text-[11px] font-medium truncate">
                  {location ?? "N/A"}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="px-5 py-3 bg-primary/5 border-b border-border/50">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mb-0.5">
                Asking Price
              </p>
              <p className="text-lg font-black text-primary">
                NPR{" "}
                {price != null
                  ? new Intl.NumberFormat("en-IN").format(price)
                  : "N/A"}
              </p>
              {(property as { negotiable?: boolean }).negotiable && (
                <span className="text-[9px] font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Negotiable
                </span>
              )}
            </div>

            {/* Quick stats */}
            <div className="px-5 py-3 border-b border-border/50">
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    {
                      icon: Building2,
                      label: "Type",
                      value: (category as string) || "N/A",
                    },
                    {
                      icon: Ruler,
                      label: "Area",
                      value: area ? `${area} Ana` : "N/A",
                    },
                    {
                      icon: Navigation,
                      label: "Face",
                      value: (face as string) || "N/A",
                    },
                    {
                      icon: Layers,
                      label: "Municipality",
                      value: (municipality as string) || "N/A",
                    },
                  ] as StatItem[]
                ).map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-muted/40 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Icon size={11} className="text-primary" />
                      <p className="text-[10px] text-muted-foreground font-medium">
                        {label}
                      </p>
                    </div>
                    <p className="text-[11px] font-bold truncate">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Coordinates */}
            <div className="px-5 py-3 border-b border-border/50">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Coordinates
              </p>
              <div className="flex gap-2">
                <div className="flex-1 bg-muted/30 rounded-xl px-3 py-2">
                  <p className="text-[9px] text-muted-foreground mb-0.5">
                    Latitude
                  </p>
                  <p className="text-[11px] font-mono font-bold">
                    {lat.toFixed(5)}
                  </p>
                </div>
                <div className="flex-1 bg-muted/30 rounded-xl px-3 py-2">
                  <p className="text-[9px] text-muted-foreground mb-0.5">
                    Longitude
                  </p>
                  <p className="text-[11px] font-mono font-bold">
                    {lng.toFixed(5)}
                  </p>
                </div>
              </div>
            </div>

            {/* Facility buttons — clicking searches Google Maps for that type */}
            <div className="px-5 py-3 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Nearby Facilities
                </p>
                {activeFacilityKey && (
                  <button
                    onClick={() => setActiveFacilityKey(null)}
                    className="text-[10px] text-primary font-bold hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="space-y-1.5">
                {FACILITY_CATEGORIES.map(
                  ({ key, label, icon: Icon, color, propKey, searchTerm }) => {
                    const isActive = activeFacilityKey === key;
                    const distValue = (property as Record<string, unknown>)[
                      propKey
                    ] as string | undefined;
                    return (
                      <button
                        key={key}
                        onClick={() => handleFacilityClick(key)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left",
                          isActive
                            ? "shadow-sm scale-[1.01]"
                            : "bg-muted/20 border-transparent hover:bg-muted/40",
                        )}
                        style={
                          isActive
                            ? {
                                backgroundColor: `${color}12`,
                                borderColor: `${color}40`,
                              }
                            : {}
                        }
                      >
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${color}18` }}
                        >
                          <Icon size={13} style={{ color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold truncate">
                            {label}
                          </p>
                          {distValue ? (
                            <p className="text-[10px] text-muted-foreground">
                              {distValue}
                            </p>
                          ) : (
                            <p className="text-[10px] text-muted-foreground/60">
                              Tap to search on map
                            </p>
                          )}
                        </div>
                        {/* Active dot indicator */}
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full shrink-0 transition-all",
                            isActive ? "scale-100" : "scale-0",
                          )}
                          style={{ backgroundColor: color }}
                        />
                      </button>
                    );
                  },
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Panel open trigger */}
        {!panelOpen && (
          <button
            onClick={() => setPanelOpen(true)}
            className="absolute top-4 left-4 z-[900] flex items-center gap-2 bg-card/95 backdrop-blur-xl border border-border/60 rounded-xl px-3 py-2 shadow-xl hover:bg-card transition-colors"
          >
            <Info size={14} className="text-primary" />
            <span className="text-xs font-bold">Property Info</span>
            <ChevronRight size={12} className="text-muted-foreground" />
          </button>
        )}

        {/* ── BOTTOM STATS BAR — z-[1001] ──────────────────────── */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1001] flex items-center bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-2xl overflow-hidden whitespace-nowrap">
          {bottomStats.map(({ icon: Icon, value, label }, i) => (
            <div
              key={label}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5",
                i < bottomStats.length - 1 && "border-r border-border/50",
              )}
            >
              <Icon size={13} className="text-primary shrink-0" />
              <div>
                <p className="text-[9px] text-muted-foreground font-medium leading-none mb-0.5">
                  {label}
                </p>
                <p className="text-[11px] font-bold leading-none">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
