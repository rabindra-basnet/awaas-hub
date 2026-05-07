"use client";

import { useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polygon, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, Locate, Loader2 } from "lucide-react";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type LatLng = [number, number];
type Mode   = "pin" | "boundary";

type Props = {
  lat:             number | null;
  lng:             number | null;
  boundaryPoints:  LatLng[];
  onPinChange:     (lat: number, lng: number) => void;
  onBoundaryChange:(points: LatLng[]) => void;
};

/* Fly the map to a position */
function FlyTo({ pos }: { pos: LatLng | null }) {
  const map = useMap();
  if (pos) map.flyTo(pos, 16, { duration: 1.2 });
  return null;
}

/* Handle map clicks */
function ClickHandler({ mode, onPin, onBoundary }: {
  mode: Mode; onPin: (lat: number, lng: number) => void; onBoundary: (p: LatLng) => void;
}) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      if (mode === "pin") onPin(lat, lng);
      else onBoundary([lat, lng]);
    },
  });
  return null;
}

/* Small vertex dots on the boundary */
function BoundaryDots({ points }: { points: LatLng[] }) {
  const dot = L.divIcon({
    className: "",
    html: '<div style="width:9px;height:9px;background:#3b82f6;border:2px solid white;border-radius:50%;box-shadow:0 0 3px rgba(0,0,0,.35)"></div>',
    iconSize: [9, 9], iconAnchor: [4, 4],
  });
  return <>{points.map((p, i) => <Marker key={i} position={p} icon={dot} />)}</>;
}

export default function LocationMapPicker({ lat, lng, boundaryPoints, onPinChange, onBoundaryChange }: Props) {
  const [mode, setMode]         = useState<Mode>("pin");
  const [query, setQuery]       = useState("");
  const [searching, setSearching] = useState(false);
  const [flyTo, setFlyTo]       = useState<LatLng | null>(null);
  const [locating, setLocating] = useState(false);
  const inputRef                = useRef<HTMLInputElement>(null);

  const center: LatLng = [lat ?? 27.7172, lng ?? 85.324];

  /* Nominatim geocode search */
  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    try {
      const res  = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=np`);
      const data = await res.json();
      if (data[0]) {
        const { lat: la, lon: lo } = data[0];
        const pos: LatLng = [parseFloat(la), parseFloat(lo)];
        onPinChange(pos[0], pos[1]);
        setFlyTo(pos);
        setQuery("");
      } else {
        /* fallback: search without country restriction */
        const res2  = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`);
        const data2 = await res2.json();
        if (data2[0]) {
          const pos: LatLng = [parseFloat(data2[0].lat), parseFloat(data2[0].lon)];
          onPinChange(pos[0], pos[1]);
          setFlyTo(pos);
          setQuery("");
        }
      }
    } catch {} finally {
      setSearching(false);
    }
  };

  /* Browser geolocation */
  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const pos: LatLng = [coords.latitude, coords.longitude];
        onPinChange(pos[0], pos[1]);
        setFlyTo(pos);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 },
    );
  };

  return (
    <div className="space-y-2">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch())}
            placeholder="Search location…"
            className="w-full pl-8 pr-3 h-9 text-sm rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching || !query.trim()}
          className="h-9 px-3 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted disabled:opacity-50 transition-colors flex items-center gap-1.5"
        >
          {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
          Search
        </button>
        <button
          type="button"
          onClick={handleLocate}
          disabled={locating}
          title="Use my location"
          className="h-9 w-9 rounded-lg border border-border bg-background flex items-center justify-center hover:bg-muted disabled:opacity-50 transition-colors"
        >
          {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Locate className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Mode toggle */}
      <div className="flex items-center gap-2">
        <div className="flex rounded-lg border border-border overflow-hidden text-xs font-medium">
          <button type="button" onClick={() => setMode("pin")}
            className={`px-3 py-1.5 transition-colors ${mode === "pin" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}>
            📍 Drop Pin
          </button>
          <button type="button" onClick={() => setMode("boundary")}
            className={`px-3 py-1.5 transition-colors ${mode === "boundary" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}>
            🗺️ Draw Boundary
          </button>
        </div>
        {mode === "boundary" && boundaryPoints.length > 0 && (
          <>
            <button type="button" onClick={() => onBoundaryChange(boundaryPoints.slice(0, -1))}
              className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded border border-border">
              Undo
            </button>
            <button type="button" onClick={() => onBoundaryChange([])}
              className="text-xs text-destructive px-2 py-1 rounded border border-destructive/30">
              Clear
            </button>
            <span className="text-xs text-muted-foreground">
              {boundaryPoints.length} pt{boundaryPoints.length !== 1 ? "s" : ""}
              {boundaryPoints.length < 3 ? ` · ${3 - boundaryPoints.length} more` : " ✓"}
            </span>
          </>
        )}
      </div>

      {/* Map */}
      <div className="rounded-xl overflow-hidden border border-border" style={{ height: "18rem" }}>
        <MapContainer center={center} zoom={14} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler mode={mode} onPin={onPinChange} onBoundary={(p) => onBoundaryChange([...boundaryPoints, p])} />
          {flyTo && <FlyTo pos={flyTo} />}
          {lat !== null && lng !== null && <Marker position={[lat, lng]} />}
          {boundaryPoints.length >= 3 && (
            <Polygon positions={boundaryPoints}
              pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.15, weight: 2 }} />
          )}
          {boundaryPoints.length > 0 && <BoundaryDots points={boundaryPoints} />}
        </MapContainer>
      </div>

      <p className="text-xs text-muted-foreground">
        {mode === "pin"
          ? "Search an address, use your location, or click the map to place the pin."
          : "Click on the map to add boundary points. Minimum 3 points."}
      </p>
    </div>
  );
}
