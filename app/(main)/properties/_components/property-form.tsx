"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  X,
  Plus,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
  Building2,
  MapPin,
  Utensils,
  ImageIcon,
  Check,
  Map,
  LocateFixed,
  Crosshair,
  Pentagon,
  Search,
  Trash2,
} from "lucide-react";
import { usePropertyImages } from "@/lib/client/queries/properties.queries";
import { cn } from "@/lib/utils";

// ── Schema ─────────────────────────────────────────────────────────────────
const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  price: z.number().positive("Price must be positive"),
  location: z.string().min(1, "Location is required"),
  description: z.string().max(5000).optional(),
  category: z.string().min(1, "Property type is required"),
  status: z.enum(["available", "booked", "sold"]),
  area: z.string().min(1, "Area is required"),
  face: z.string().min(1, "Property Face is required"),
  roadType: z.string().min(1, "Property Road type is required"),
  roadAccess: z.string().optional(),
  negotiable: z.boolean(),
  municipality: z.string().optional(),
  wardNo: z.string().optional(),
  ringRoad: z.string().optional(),
  // map fields — optional, step is skippable
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  nearHospital: z.string().optional(),
  nearAirport: z.string().optional(),
  nearSupermarket: z.string().optional(),
  nearSchool: z.string().optional(),
  nearGym: z.string().optional(),
  nearTransport: z.string().optional(),
  nearAtm: z.string().optional(),
  nearRestaurant: z.string().optional(),
});

export type PropertyStatus = z.infer<typeof formSchema>["status"];
export type PropertyFormValues = z.infer<typeof formSchema>;

type PreviewFile = {
  file: File;
  url: string;
  uploadProgress?: number;
  fileId?: string;
};

type ExistingImage = {
  id: string;
  url: string;
  filename: string;
};

interface PropertyFormProps {
  initialData?: Partial<PropertyFormValues>;
  initialBoundary?: [number, number][];
  existingImages?: ExistingImage[];
  propertyId?: string;
  onSubmit: (
    values: PropertyFormValues & {
      fileIds: string[];
      deletedFileIds: string[];
      boundaryPoints: [number, number][];
    },
  ) => void;
  isSubmitting?: boolean;
  buttonText?: string;
}

// ── Steps — Map inserted as step 3 after Location ─────────────────────────
const STEPS = [
  {
    id: 0,
    label: "Basic Info",
    short: "Basic",
    icon: Info,
    accent: "bg-primary",
    border: "border-primary",
  },
  {
    id: 1,
    label: "Property",
    short: "Property",
    icon: Building2,
    accent: "bg-amber-500",
    border: "border-amber-500",
  },
  {
    id: 2,
    label: "Location",
    short: "Location",
    icon: MapPin,
    accent: "bg-blue-500",
    border: "border-blue-500",
  },
  {
    id: 3,
    label: "Map Pin",
    short: "Map",
    icon: Map,
    accent: "bg-rose-500",
    border: "border-rose-500",
  },
  {
    id: 4,
    label: "Facilities",
    short: "Nearby",
    icon: Utensils,
    accent: "bg-green-500",
    border: "border-green-500",
  },
  {
    id: 5,
    label: "Images",
    short: "Images",
    icon: ImageIcon,
    accent: "bg-purple-500",
    border: "border-purple-500",
  },
];

const STEP_FIELDS: Record<number, (keyof PropertyFormValues)[]> = {
  0: ["title", "price", "location", "category", "status"],
  1: ["area", "face", "roadType", "roadAccess", "negotiable"],
  2: ["municipality", "wardNo", "ringRoad"],
  3: [], // map — optional, no required fields to validate
  4: [
    "nearHospital",
    "nearAirport",
    "nearSupermarket",
    "nearSchool",
    "nearGym",
    "nearTransport",
    "nearAtm",
    "nearRestaurant",
  ],
  5: [],
};

// ── Tile styles ────────────────────────────────────────────────────────────
const TILE_STYLES = {
  standard: {
    label: "Map",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap",
  },
  satellite: {
    label: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Esri",
  },
};
type TileKey = keyof typeof TILE_STYLES;

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

// ── Leaflet dynamic imports ────────────────────────────────────────────────
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false },
);
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), {
  ssr: false,
});
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), {
  ssr: false,
});
const Polygon = dynamic(() => import("react-leaflet").then((m) => m.Polygon), {
  ssr: false,
});

// ── Field wrapper (unchanged from original) ────────────────────────────────
function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
        {label}
      </Label>
      {children}
      {error && (
        <p className="text-[11px] text-destructive font-semibold">{error}</p>
      )}
    </div>
  );
}

// ── Map click handler ──────────────────────────────────────────────────────
function MapClickHandler({
  onMapClick,
  useMapEventsHook,
}: {
  onMapClick: (lat: number, lng: number) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useMapEventsHook: any;
}) {
  useMapEventsHook({
    click(e: { latlng: { lat: number; lng: number } }) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// ── Fly-to helper ──────────────────────────────────────────────────────────
function FlyTo({
  lat,
  lng,
  useMapHook,
}: {
  lat: number;
  lng: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useMapHook: any;
}) {
  const map = useMapHook();
  useEffect(() => {
    map.flyTo([lat, lng], 17, { duration: 0.8 });
  }, [lat, lng]);
  return null;
}

// ── Nominatim location search ──────────────────────────────────────────────
function LocationSearch({
  onSelect,
}: {
  onSelect: (lat: number, lng: number, label: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&countrycodes=np`,
        { headers: { "Accept-Language": "en" } },
      );
      const data: NominatimResult[] = await res.json();
      setResults(data);
      setOpen(data.length > 0);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setQuery(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(v), 400);
  };

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <Search
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search location, e.g. Thamel Kathmandu…"
          className={cn(
            "w-full h-10 pl-8 pr-10 rounded-xl border border-border/60 bg-background",
            "text-sm text-foreground placeholder:text-muted-foreground/50",
            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all",
          )}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        )}
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-[2000] bg-card border border-border/60 rounded-xl shadow-2xl overflow-hidden">
          {results.map((r) => (
            <button
              key={r.place_id}
              type="button"
              onClick={() => {
                onSelect(parseFloat(r.lat), parseFloat(r.lon), r.display_name);
                setQuery(r.display_name.split(",").slice(0, 2).join(", "));
                setOpen(false);
              }}
              className="w-full flex items-start gap-2.5 px-3 py-2.5 hover:bg-muted/60 transition-colors text-left border-b border-border/30 last:border-0"
            >
              <MapPin size={12} className="text-primary shrink-0 mt-0.5" />
              <span className="text-[12px] text-foreground line-clamp-2 leading-snug">
                {r.display_name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── LeafletMapPicker ───────────────────────────────────────────────────────
interface LeafletMapPickerProps {
  lat?: number;
  lng?: number;
  boundaryPoints: [number, number][];
  onChange: (lat: number, lng: number) => void;
  onClear: () => void;
  onBoundaryChange: (points: [number, number][]) => void;
}

function LeafletMapPicker({
  lat,
  lng,
  boundaryPoints,
  onChange,
  onClear,
  onBoundaryChange,
}: LeafletMapPickerProps) {
  const [leafletReady, setLeafletReady] = useState(false);
  const [leafletLib, setLeafletLib] = useState<{
    useMapEvents: (typeof import("react-leaflet"))["useMapEvents"];
    useMap: (typeof import("react-leaflet"))["useMap"];
    divIcon: (typeof import("leaflet"))["divIcon"];
  } | null>(null);

  const [geoStatus, setGeoStatus] = useState<
    "idle" | "asking" | "granted" | "denied"
  >("idle");
  const [geoError, setGeoError] = useState("");
  const [tileKey, setTileKey] = useState<TileKey>("standard");
  const [drawMode, setDrawMode] = useState(false);
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);

  const centreLat = lat ?? 27.7172;
  const centreLng = lng ?? 85.324;

  useEffect(() => {
    Promise.all([import("leaflet"), import("react-leaflet")]).then(
      ([L, RL]) => {
        // @ts-expect-error — internal property
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });
        setLeafletLib({
          useMapEvents: RL.useMapEvents,
          useMap: RL.useMap,
          divIcon: L.divIcon,
        });
        setLeafletReady(true);
      },
    );
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoStatus("denied");
      return;
    }
    setGeoStatus("asking");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoStatus("granted");
        if (!lat && !lng) {
          onChange(pos.coords.latitude, pos.coords.longitude);
          setFlyTarget([pos.coords.latitude, pos.coords.longitude]);
        }
      },
      (err) => {
        setGeoStatus("denied");
        setGeoError(
          err.code === 1
            ? "Location permission denied. Search a location or click the map."
            : "Could not get location. Search or click the map to set the pin.",
        );
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  const handleMapClick = useCallback(
    (clickLat: number, clickLng: number) => {
      if (drawMode) {
        onBoundaryChange([...boundaryPoints, [clickLat, clickLng]]);
      } else {
        onChange(clickLat, clickLng);
        setFlyTarget([clickLat, clickLng]);
      }
    },
    [drawMode, boundaryPoints, onChange, onBoundaryChange],
  );

  const goToCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setGeoStatus("asking");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoStatus("granted");
        onChange(pos.coords.latitude, pos.coords.longitude);
        setFlyTarget([pos.coords.latitude, pos.coords.longitude]);
        setGeoError("");
      },
      () => {
        setGeoStatus("denied");
        setGeoError("Could not get location.");
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const removeBoundaryPoint = (idx: number) =>
    onBoundaryChange(boundaryPoints.filter((_, i) => i !== idx));

  const pinIcon = leafletLib?.divIcon({
    html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:#ef4444;border:3px solid white;transform:rotate(-45deg);box-shadow:0 2px 10px rgba(0,0,0,0.3)"></div>`,
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -32],
  });
  const boundaryIcon = leafletLib?.divIcon({
    html: `<div style="width:10px;height:10px;border-radius:50%;background:#ef4444;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
    className: "",
    iconSize: [10, 10],
    iconAnchor: [5, 5],
  });

  const hasBoundary = boundaryPoints.length >= 3;

  return (
    <div className="sm:col-span-2 flex flex-col gap-3">
      {/* Location search box */}
      <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Search location
        </p>
        <LocationSearch
          onSelect={(la, ln) => {
            onChange(la, ln);
            setFlyTarget([la, ln]);
          }}
        />
        <p className="text-[10px] text-muted-foreground/60">
          Type a place name or click directly on the map below.
        </p>
      </div>

      {/* Geo banners */}
      {geoStatus === "asking" && (
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/20">
          <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
          <span className="text-[12px] font-semibold text-primary">
            Requesting your location…
          </span>
        </div>
      )}
      {geoStatus === "denied" && geoError && (
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <MapPin size={13} className="text-amber-500 shrink-0" />
          <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
            {geoError}
          </span>
        </div>
      )}
      {geoStatus === "granted" && !lat && (
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-green-500/5 border border-green-500/20">
          <LocateFixed size={13} className="text-green-500 shrink-0" />
          <span className="text-[11px] font-semibold text-green-700 dark:text-green-400">
            Location found — click the map to pin the property
          </span>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-0.5 bg-muted/60 border border-border/50 rounded-xl p-1">
          {(Object.keys(TILE_STYLES) as TileKey[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setTileKey(k)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all",
                tileKey === k
                  ? "bg-background text-foreground shadow-sm border border-border/40"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {TILE_STYLES[k].label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={goToCurrentLocation}
          disabled={geoStatus === "asking"}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/50 bg-background hover:bg-muted/60 text-[11px] font-bold transition-colors disabled:opacity-50 shadow-sm"
        >
          <LocateFixed size={12} className="text-primary" />
          {geoStatus === "asking" ? "Locating…" : "My location"}
        </button>
        <button
          type="button"
          onClick={() => setDrawMode((v) => !v)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all",
            drawMode
              ? "bg-rose-500 text-white border-rose-500 shadow-sm"
              : "border-border/50 bg-background hover:bg-muted/60 text-muted-foreground shadow-sm",
          )}
        >
          <Pentagon size={12} /> {drawMode ? "Drawing…" : "Draw boundary"}
        </button>
        {boundaryPoints.length > 0 && (
          <button
            type="button"
            onClick={() => onBoundaryChange([])}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 text-[11px] font-bold text-destructive transition-colors"
          >
            <Trash2 size={11} /> Clear boundary
          </button>
        )}
        {lat && lng && (
          <button
            type="button"
            onClick={onClear}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 text-[11px] font-bold text-destructive transition-colors"
          >
            <X size={11} /> Clear pin
          </button>
        )}
      </div>

      {/* Map container */}
      <div className="relative rounded-2xl overflow-hidden border border-border/60 shadow-sm">
        <div className="absolute top-3 right-3 z-[1000]">
          {lat && lng ? (
            <div className="flex items-center gap-1.5 bg-green-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg">
              <Check size={10} /> Pin set
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white/80 text-[10px] font-bold px-3 py-1.5 rounded-full">
              <Crosshair size={10} />{" "}
              {drawMode ? "Click to draw" : "Click to pin"}
            </div>
          )}
        </div>
        {drawMode && (
          <div className="absolute bottom-[72px] left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 bg-rose-500 text-white text-[11px] font-bold px-4 py-2 rounded-full shadow-lg whitespace-nowrap">
            <Pentagon size={12} />
            {boundaryPoints.length === 0
              ? "Click to start drawing boundary"
              : `${boundaryPoints.length} point${boundaryPoints.length !== 1 ? "s" : ""} — keep clicking to add more`}
          </div>
        )}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
        />
        <div style={{ height: "380px" }}>
          {leafletReady && leafletLib ? (
            <MapContainer
              center={[centreLat, centreLng]}
              zoom={lat ? 17 : 13}
              className="h-full w-full"
              zoomControl
              style={{ cursor: drawMode ? "crosshair" : "default" }}
            >
              <TileLayer
                key={tileKey}
                url={TILE_STYLES[tileKey].url}
                attribution={TILE_STYLES[tileKey].attribution}
              />
              <MapClickHandler
                onMapClick={handleMapClick}
                useMapEventsHook={leafletLib.useMapEvents}
              />
              {flyTarget && (
                <FlyTo
                  lat={flyTarget[0]}
                  lng={flyTarget[1]}
                  useMapHook={leafletLib.useMap}
                />
              )}
              {lat && lng && pinIcon && (
                <Marker
                  position={[lat, lng]}
                  icon={pinIcon}
                  draggable
                  // @ts-expect-error
                  eventHandlers={{
                    dragend(e: {
                      target: { getLatLng: () => { lat: number; lng: number } };
                    }) {
                      const p = e.target.getLatLng();
                      onChange(p.lat, p.lng);
                    },
                  }}
                >
                  <Popup>
                    <div className="p-1.5 min-w-[140px]">
                      <p className="text-xs font-bold mb-1">Property pin</p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {lat.toFixed(6)}, {lng.toFixed(6)}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Drag to reposition
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )}
              {boundaryPoints.length >= 2 && (
                <Polygon
                  positions={boundaryPoints}
                  pathOptions={{
                    color: "#ef4444",
                    fillColor: "#ef4444",
                    fillOpacity: 0.12,
                    weight: 2,
                    dashArray: "6 4",
                  }}
                />
              )}
              {boundaryPoints.map((pt, i) =>
                boundaryIcon ? (
                  <Marker
                    key={i}
                    position={pt}
                    icon={boundaryIcon}
                    eventHandlers={{
                      click() {
                        removeBoundaryPoint(i);
                      },
                    }}
                  >
                    <Popup>
                      <span className="text-[10px]">
                        Click to remove point {i + 1}
                      </span>
                    </Popup>
                  </Marker>
                ) : null,
              )}
            </MapContainer>
          ) : (
            <div className="h-full bg-muted flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <p className="text-xs text-muted-foreground font-medium">
                  Loading map…
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Coordinates */}
      {lat && lng && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-muted/40 border border-border/50 rounded-xl px-3 py-2.5">
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">
              Latitude
            </p>
            <p className="text-[13px] font-mono font-bold">{lat.toFixed(6)}</p>
          </div>
          <div className="bg-muted/40 border border-border/50 rounded-xl px-3 py-2.5">
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">
              Longitude
            </p>
            <p className="text-[13px] font-mono font-bold">{lng.toFixed(6)}</p>
          </div>
        </div>
      )}

      {/* Boundary info */}
      {boundaryPoints.length > 0 && (
        <div
          className={cn(
            "rounded-xl px-4 py-3 border",
            hasBoundary
              ? "bg-rose-500/5 border-rose-500/20"
              : "bg-amber-500/5 border-amber-500/20",
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <p
              className={cn(
                "text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5",
                hasBoundary
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-amber-600 dark:text-amber-400",
              )}
            >
              <Pentagon size={11} />
              Boundary — {boundaryPoints.length} point
              {boundaryPoints.length !== 1 ? "s" : ""}
              {hasBoundary && (
                <span className="text-green-600 dark:text-green-400 ml-1">
                  ✓ polygon closed
                </span>
              )}
            </p>
            {!hasBoundary && (
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                {Math.max(0, 3 - boundaryPoints.length)} more to close
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {boundaryPoints.map((pt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => removeBoundaryPoint(i)}
                className="flex items-center gap-1 bg-rose-500/10 hover:bg-destructive/15 border border-rose-500/20 hover:border-destructive/30 rounded-lg px-2 py-1 text-[10px] font-mono transition-colors group"
              >
                <span className="text-rose-700 dark:text-rose-400 group-hover:text-destructive">
                  {pt[0].toFixed(4)}, {pt[1].toFixed(4)}
                </span>
                <X
                  size={9}
                  className="text-muted-foreground group-hover:text-destructive"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
        Search a location or click the map to drop a pin. Drag the pin to
        fine-tune. Use{" "}
        <strong className="text-foreground/70">Draw boundary</strong> to outline
        the land area. This step is optional — hit{" "}
        <strong className="text-foreground/70">Skip</strong> to continue.
      </p>
    </div>
  );
}

// ── Main Form ──────────────────────────────────────────────────────────────
export default function PropertyForm({
  initialData,
  initialBoundary = [],
  existingImages: initialExistingImages,
  propertyId,
  onSubmit,
  isSubmitting = false,
  buttonText = "Save Property",
}: PropertyFormProps) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [animating, setAnimating] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const [images, setImages] = useState<PreviewFile[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [deletedFileIds, setDeletedFileIds] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Boundary state persists across step navigation
  const [boundaryPoints, setBoundaryPoints] =
    useState<[number, number][]>(initialBoundary);

  // ✅ Always-mounted file input ref — never inside a conditional step block
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      price: initialData?.price || 0,
      location: initialData?.location || "",
      description: initialData?.description || "",
      category: initialData?.category || "",
      status: initialData?.status || "available",
      area: initialData?.area || "",
      face: initialData?.face || "",
      roadType: initialData?.roadType || "",
      roadAccess: initialData?.roadAccess || "",
      negotiable: initialData?.negotiable ?? false,
      municipality: initialData?.municipality || "",
      wardNo: initialData?.wardNo || "",
      ringRoad: initialData?.ringRoad || "",
      latitude: initialData?.latitude,
      longitude: initialData?.longitude,
      nearHospital: initialData?.nearHospital || "",
      nearAirport: initialData?.nearAirport || "",
      nearSupermarket: initialData?.nearSupermarket || "",
      nearSchool: initialData?.nearSchool || "",
      nearGym: initialData?.nearGym || "",
      nearTransport: initialData?.nearTransport || "",
      nearAtm: initialData?.nearAtm || "",
      nearRestaurant: initialData?.nearRestaurant || "",
    },
  });

  const negotiable = watch("negotiable");
  const locationValue = watch("location");
  const categoryValue = watch("category");
  const statusValue = watch("status");
  const faceValue = watch("face");
  const roadTypeValue = watch("roadType");
  const latValue = watch("latitude");
  const lngValue = watch("longitude");

  const { data: fetchedImages = [], isLoading: loadingExisting } =
    usePropertyImages(propertyId);

  useEffect(() => {
    if (fetchedImages.length) setExistingImages(fetchedImages);
    else if (!propertyId && initialExistingImages?.length)
      setExistingImages(initialExistingImages);
  }, [fetchedImages, propertyId, initialExistingImages]);

  // ── Navigation ─────────────────────────────────────────────────────────
  async function goNext() {
    const valid = await trigger(STEP_FIELDS[step]);
    if (!valid) return;
    setCompletedSteps((prev) => new Set(prev).add(step));
    setDirection("forward");
    setAnimating(true);
    setTimeout(() => {
      setStep((s) => s + 1);
      setAnimating(false);
    }, 180);
  }

  function goBack() {
    setDirection("back");
    setAnimating(true);
    setTimeout(() => {
      setStep((s) => s - 1);
      setAnimating(false);
    }, 180);
  }

  function jumpTo(target: number) {
    const canJump =
      target < step ||
      completedSteps.has(target) ||
      completedSteps.has(target - 1);
    if (!canJump) return;
    setDirection(target > step ? "forward" : "back");
    setAnimating(true);
    setTimeout(() => {
      setStep(target);
      setAnimating(false);
    }, 180);
  }

  // ── Image handling ─────────────────────────────────────────────────────
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Guard: uploading state is the authoritative lock; disabled input should
    // already prevent this from firing, but defend in depth.
    if (uploading) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newFiles = Array.from(files).map((file) => ({
      file,
      url: URL.createObjectURL(file),
      uploadProgress: undefined,
    }));
    setImages((prev) => [...prev, ...newFiles]);
    // Reset so the same file can be picked again after removal
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeNewImage(index: number) {
    URL.revokeObjectURL(images[index].url);
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function removeExistingImage(imageId: string) {
    setDeletedFileIds((prev) => [...prev, imageId]);
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  }

  async function uploadImages(): Promise<string[]> {
    if (!images.length) return [];
    setUploading(true);
    const fileIds: string[] = [];

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (img.fileId) {
        fileIds.push(img.fileId);
        continue;
      }

      const fd = new FormData();
      fd.append("file", img.file);
      fd.append("isPrivate", "true");

      setImages((prev) =>
        prev.map((p, idx) => (idx === i ? { ...p, uploadProgress: 10 } : p)),
      );

      let fakeProgress = 10;
      const interval = setInterval(() => {
        fakeProgress = Math.min(
          fakeProgress + Math.floor(Math.random() * 15 + 5),
          85,
        );
        const captured = fakeProgress;
        setImages((prev) =>
          prev.map((p, idx) =>
            idx === i &&
            typeof p.uploadProgress === "number" &&
            p.uploadProgress < 100 &&
            p.uploadProgress !== -1
              ? { ...p, uploadProgress: captured }
              : p,
          ),
        );
      }, 300);

      try {
        const res = await fetch("/api/files/upload", {
          method: "POST",
          body: fd,
        });
        clearInterval(interval);
        if (!res.ok) throw new Error(`Upload failed for ${img.file.name}`);
        const data = await res.json();
        const fileId = data.file._id;
        setImages((prev) =>
          prev.map((p, idx) =>
            idx === i ? { ...p, uploadProgress: 100, fileId } : p,
          ),
        );
        fileIds.push(fileId);
      } catch (error) {
        clearInterval(interval);
        console.error(error);
        setImages((prev) =>
          prev.map((p, idx) => (idx === i ? { ...p, uploadProgress: -1 } : p)),
        );
        setUploading(false);
        throw error;
      }
    }

    setUploading(false);
    return fileIds;
  }

  async function onFormSubmit(values: PropertyFormValues) {
    try {
      const newFileIds = await uploadImages();
      onSubmit({
        ...values,
        fileIds: newFileIds,
        deletedFileIds,
        boundaryPoints,
      });
    } catch (error) {
      console.error(error);
    }
  }

  const currentStep = STEPS[step];

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/*
       * ✅ File input always mounted here at the top level, never inside a conditional
       * step block. Positioned off-screen with fixed positioning instead of sr-only
       * or display:none — this ensures fileInputRef.current.click() reliably opens
       * the OS file picker in all browsers (sr-only's clip-path blocks synthetic clicks).
       */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        disabled={uploading}
        onChange={handleImageChange}
        style={{
          position: "fixed",
          top: "-9999px",
          left: "-9999px",
          opacity: 0,
          pointerEvents: "none",
        }}
        tabIndex={-1}
        aria-hidden="true"
      />

      {/* ── STEP INDICATOR (unchanged from original) ── */}
      <div className="relative">
        <div className="absolute top-5 left-8 right-8 h-px bg-border hidden sm:block" />
        <div
          className="absolute top-5 left-8 h-px bg-primary transition-all duration-500 hidden sm:block"
          style={{
            width: `calc((${step} / ${STEPS.length - 1}) * (100% - 4rem))`,
          }}
        />
        <div className="relative flex justify-between items-start px-2">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isCompleted = completedSteps.has(s.id);
            const isCurrent = step === s.id;
            const isReachable =
              s.id < step ||
              completedSteps.has(s.id) ||
              completedSteps.has(s.id - 1);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => jumpTo(s.id)}
                disabled={!isReachable && !isCurrent}
                className="flex flex-col items-center gap-2 disabled:cursor-not-allowed"
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 bg-background",
                    isCurrent &&
                      `${s.border} ${s.accent} text-white scale-110 shadow-lg`,
                    isCompleted &&
                      !isCurrent &&
                      "border-primary bg-primary text-white",
                    !isCurrent &&
                      !isCompleted &&
                      "border-border text-muted-foreground",
                  )}
                >
                  {isCompleted && !isCurrent ? (
                    <Check size={16} />
                  ) : (
                    <Icon size={16} />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-black uppercase tracking-wider transition-colors hidden sm:block",
                    isCurrent ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s.short}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── STEP CARD ── */}
      <div className="rounded-2xl border border-border/60 bg-muted/20 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50 bg-muted/30">
          <div className={cn("w-1 h-6 rounded-full", currentStep.accent)} />
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
              {currentStep.label}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Step {step + 1} of {STEPS.length}
            </p>
          </div>
        </div>

        <div
          className={cn(
            "p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-200 ease-out",
            animating && direction === "forward" && "opacity-0 translate-x-3",
            animating && direction === "back" && "opacity-0 -translate-x-3",
            !animating && "opacity-100 translate-x-0",
          )}
        >
          {/* ── STEP 0: Basic Info (unchanged) ── */}
          {step === 0 && (
            <>
              <Field
                label="Property Title"
                error={errors.title?.message}
                className="sm:col-span-2"
              >
                <Input
                  placeholder="e.g. Modern Villa at Baneshwor"
                  className="h-10 rounded-xl text-sm"
                  {...register("title")}
                />
              </Field>
              <Field label="Price (NPR)" error={errors.price?.message}>
                <Input
                  type="number"
                  placeholder="e.g. 12500000"
                  className="h-10 rounded-xl text-sm"
                  {...register("price", { valueAsNumber: true })}
                />
              </Field>
              <Field label="Location" error={errors.location?.message}>
                <Select
                  onValueChange={(v) => setValue("location", v)}
                  value={locationValue}
                >
                  <SelectTrigger className="h-10 rounded-xl text-sm w-full">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Kathmandu", "Lalitpur", "Bhaktapur"].map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Property Type" error={errors.category?.message}>
                <Select
                  onValueChange={(v) => setValue("category", v)}
                  value={categoryValue}
                >
                  <SelectTrigger className="h-10 rounded-xl text-sm w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {["House", "Apartment", "Land", "Colony"].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Status" error={errors.status?.message}>
                <Select
                  onValueChange={(v) => setValue("status", v as PropertyStatus)}
                  value={statusValue}
                >
                  <SelectTrigger className="h-10 rounded-xl text-sm w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {["available"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Description" className="sm:col-span-2">
                <Textarea
                  placeholder="Describe the property..."
                  rows={3}
                  className="rounded-xl text-sm resize-none"
                  {...register("description")}
                />
              </Field>
            </>
          )}

          {/* ── STEP 1: Property Details (unchanged) ── */}
          {step === 1 && (
            <>
              <Field label="Area (e.g. 5 Aana)" error={errors.area?.message}>
                <Input
                  placeholder="e.g. 5 Aana"
                  className="h-10 rounded-xl text-sm"
                  {...register("area")}
                />
              </Field>
              <Field label="Property Face" error={errors.face?.message}>
                <Select
                  onValueChange={(v) => setValue("face", v)}
                  value={faceValue}
                >
                  <SelectTrigger className="h-10 rounded-xl text-sm w-full">
                    <SelectValue placeholder="Select facing" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "North",
                      "South",
                      "East",
                      "West",
                      "North-East",
                      "North-West",
                      "South-East",
                      "South-West",
                    ].map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Road Type" error={errors.roadType?.message}>
                <Select
                  onValueChange={(v) => setValue("roadType", v)}
                  value={roadTypeValue}
                >
                  <SelectTrigger className="h-10 rounded-xl text-sm w-full">
                    <SelectValue placeholder="Select road type" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Blacktopped", "Graveled", "Dirt", "Goreto"].map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Road Access">
                <Input
                  placeholder="e.g. 13 Feet"
                  className="h-10 rounded-xl text-sm"
                  {...register("roadAccess")}
                />
              </Field>
              <div className="sm:col-span-2 flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/30">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest">
                    Negotiable
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Is the price open to negotiation?
                  </p>
                </div>
                <Switch
                  checked={negotiable}
                  onCheckedChange={(v) => setValue("negotiable", v)}
                />
              </div>
            </>
          )}

          {/* ── STEP 2: Location Details (unchanged) ── */}
          {step === 2 && (
            <>
              <Field label="Municipality">
                <Input
                  placeholder="e.g. Suryabinayak"
                  className="h-10 rounded-xl text-sm"
                  {...register("municipality")}
                />
              </Field>
              <Field label="Ward No.">
                <Input
                  placeholder="e.g. 05"
                  className="h-10 rounded-xl text-sm"
                  {...register("wardNo")}
                />
              </Field>
              <Field label="Distance from Ring Road" className="sm:col-span-2">
                <Input
                  placeholder="e.g. 4km"
                  className="h-10 rounded-xl text-sm"
                  {...register("ringRoad")}
                />
              </Field>
            </>
          )}

          {/* ── STEP 3: Map Pin + Boundary (NEW) ── */}
          {step === 3 && (
            <LeafletMapPicker
              lat={latValue && latValue !== 0 ? latValue : undefined}
              lng={lngValue && lngValue !== 0 ? lngValue : undefined}
              boundaryPoints={boundaryPoints}
              onChange={(la, ln) => {
                setValue("latitude", la, { shouldDirty: true });
                setValue("longitude", ln, { shouldDirty: true });
              }}
              onClear={() => {
                setValue("latitude", undefined, { shouldDirty: true });
                setValue("longitude", undefined, { shouldDirty: true });
              }}
              onBoundaryChange={setBoundaryPoints}
            />
          )}

          {/* ── STEP 4: Nearby Facilities (was step 3) ── */}
          {step === 4 &&
            (
              [
                { field: "nearHospital", label: "Hospital" },
                { field: "nearAirport", label: "Airport" },
                { field: "nearSupermarket", label: "Supermarket" },
                { field: "nearSchool", label: "School" },
                { field: "nearGym", label: "Gym" },
                { field: "nearTransport", label: "Public Transport" },
                { field: "nearAtm", label: "ATM" },
                { field: "nearRestaurant", label: "Restaurant" },
              ] as const
            ).map(({ field, label }) => (
              <Field key={field} label={label}>
                <Input
                  placeholder="e.g. 500m or 2km"
                  className="h-10 rounded-xl text-sm"
                  {...register(field)}
                />
              </Field>
            ))}

          {/* ── STEP 5: Images (was step 4) ── */}
          {step === 5 && (
            <div className="sm:col-span-2">
              {loadingExisting ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-32 bg-muted animate-pulse rounded-xl"
                    />
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {/* Existing saved images */}
                    {existingImages.map((img) => (
                      <div
                        key={img.id}
                        className="relative group rounded-xl overflow-hidden border border-border/50"
                      >
                        <img
                          src={img.url}
                          alt={img.filename}
                          className="h-32 w-full object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-blue-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                          Saved
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExistingImage(img.id)}
                          disabled={uploading}
                          className="absolute top-2 right-2 h-6 w-6 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-40"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}

                    {/* New image previews */}
                    {images.map((img, i) => (
                      <div
                        key={i}
                        className="relative group rounded-xl overflow-hidden border border-border/50"
                      >
                        <img
                          src={img.url}
                          alt="preview"
                          className="h-32 w-full object-cover"
                        />
                        {typeof img.uploadProgress === "number" &&
                          img.uploadProgress > 0 &&
                          img.uploadProgress < 100 && (
                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 px-3">
                              <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-white h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${img.uploadProgress}%` }}
                                />
                              </div>
                              <span className="text-white text-[10px] font-bold">
                                {img.uploadProgress}%
                              </span>
                            </div>
                          )}
                        {img.uploadProgress === -1 && (
                          <div className="absolute inset-0 bg-destructive/80 flex items-center justify-center rounded-xl">
                            <span className="text-white text-[10px] font-bold">
                              Upload Failed
                            </span>
                          </div>
                        )}
                        {img.uploadProgress === 100 && (
                          <div className="absolute top-2 left-2">
                            <CheckCircle2
                              size={18}
                              className="text-green-400 drop-shadow"
                            />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeNewImage(i)}
                          disabled={uploading}
                          className="absolute top-2 right-2 h-6 w-6 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-40"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}

                    {/* Add image button — triggers always-mounted file input */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <Plus size={16} className="text-muted-foreground" />
                      </div>
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                        Add Image
                      </span>
                    </button>
                  </div>

                  {(existingImages.length > 0 || images.length > 0) && (
                    <p className="text-[11px] text-muted-foreground mt-3 font-semibold">
                      {existingImages.length} saved &bull; {images.length} new
                      {deletedFileIds.length > 0 &&
                        ` • ${deletedFileIds.length} queued for deletion`}
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── NAVIGATION (unchanged, but map step shows Skip when no pin set) ── */}
      <div className="flex items-center gap-3">
        {step > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={goBack}
            disabled={animating}
            className="h-11 px-5 rounded-xl font-bold text-[11px] uppercase tracking-widest"
          >
            <ChevronLeft size={15} className="mr-1" /> Back
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button
            type="button"
            onClick={goNext}
            disabled={animating}
            className="flex-1 h-11 rounded-xl font-black text-[11px] uppercase tracking-widest"
          >
            {/* Show "Skip" on the map step only when no pin has been placed */}
            {step === 3 && !latValue ? "Skip" : "Next"}{" "}
            <ChevronRight size={15} className="ml-1" />
          </Button>
        ) : (
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting || uploading || animating}
            className="flex-1 h-11 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg"
          >
            {uploading
              ? "Uploading images..."
              : isSubmitting
                ? "Saving..."
                : buttonText}
          </Button>
        )}
      </div>
    </form>
  );
}
