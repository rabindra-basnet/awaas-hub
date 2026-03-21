// "use client";

// import { use, useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import dynamic from "next/dynamic";
// import type { LucideIcon } from "lucide-react";
// import {
//   ArrowLeft,
//   MapPin,
//   Building2,
//   Ruler,
//   Navigation,
//   Hospital,
//   Plane,
//   ShoppingCart,
//   School,
//   Dumbbell,
//   Bus,
//   Utensils,
//   Wallet,
//   Layers,
//   ChevronRight,
//   Maximize2,
//   Minimize2,
//   LocateFixed,
//   Info,
//   X,
//   Pentagon,
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { useProperty } from "@/lib/client/queries/properties.queries";

// // ── Leaflet SSR-safe imports ──────────────────────────────────────────
// const MapContainer = dynamic(
//   () => import("react-leaflet").then((m) => m.MapContainer),
//   { ssr: false },
// );
// const TileLayer = dynamic(
//   () => import("react-leaflet").then((m) => m.TileLayer),
//   { ssr: false },
// );
// const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), {
//   ssr: false,
// });
// const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), {
//   ssr: false,
// });
// const Circle = dynamic(() => import("react-leaflet").then((m) => m.Circle), {
//   ssr: false,
// });
// const Polygon = dynamic(() => import("react-leaflet").then((m) => m.Polygon), {
//   ssr: false,
// });

// // ── Types ─────────────────────────────────────────────────────────────
// type TileStyleKey = "standard" | "satellite" | "topo";

// interface TileStyle {
//   label: string;
//   url: string;
//   attribution: string;
// }
// interface FacilityCategory {
//   key: string;
//   label: string;
//   icon: LucideIcon;
//   color: string;
//   propKey: string;
// }
// interface RecenterButtonProps {
//   coords: [number, number];
// }
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// interface RecenterInnerProps {
//   coords: [number, number];
//   useMap: () => any;
// }
// interface StatItem {
//   icon: LucideIcon;
//   label: string;
//   value: string;
// }

// /**
//  * Normalized property shape — all geo fields typed explicitly.
//  * We cast the raw `useProperty` return to this so TypeScript
//  * stops complaining about unknown fields.
//  */
// interface PropertyData {
//   title?: string;
//   location?: string;
//   price?: number;
//   area?: string | number;
//   category?: string;
//   face?: string;
//   municipality?: string;
//   negotiable?: boolean;
//   /** GPS pin set by seller in the map step */
//   latitude?: number | null;
//   longitude?: number | null;
//   /**
//    * Boundary polygon drawn by seller.
//    * Stored in Mongo as [[lat,lng], …].
//    * Mongoose returns plain arrays, so we accept number[][] here.
//    */
//   boundaryPoints?: number[][];
//   [key: string]: unknown;
// }

// // ── Tile presets ──────────────────────────────────────────────────────
// const TILE_STYLES: Record<TileStyleKey, TileStyle> = {
//   standard: {
//     label: "Standard",
//     url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
//     attribution: "&copy; OpenStreetMap contributors",
//   },
//   satellite: {
//     label: "Satellite",
//     url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
//     attribution: "Tiles &copy; Esri",
//   },
//   topo: {
//     label: "Terrain",
//     url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
//     attribution: "&copy; OpenTopoMap contributors",
//   },
// };

// // ── Facility config ───────────────────────────────────────────────────
// const FACILITY_CATEGORIES: FacilityCategory[] = [
//   {
//     key: "hospital",
//     label: "Hospital",
//     icon: Hospital,
//     color: "#ef4444",
//     propKey: "nearHospital",
//   },
//   {
//     key: "airport",
//     label: "Airport",
//     icon: Plane,
//     color: "#3b82f6",
//     propKey: "nearAirport",
//   },
//   {
//     key: "supermarket",
//     label: "Supermarket",
//     icon: ShoppingCart,
//     color: "#f59e0b",
//     propKey: "nearSupermarket",
//   },
//   {
//     key: "school",
//     label: "School",
//     icon: School,
//     color: "#8b5cf6",
//     propKey: "nearSchool",
//   },
//   {
//     key: "gym",
//     label: "Gym",
//     icon: Dumbbell,
//     color: "#10b981",
//     propKey: "nearGym",
//   },
//   {
//     key: "transport",
//     label: "Transport",
//     icon: Bus,
//     color: "#06b6d4",
//     propKey: "nearTransport",
//   },
//   {
//     key: "atm",
//     label: "ATM",
//     icon: Wallet,
//     color: "#ec4899",
//     propKey: "nearAtm",
//   },
//   {
//     key: "restaurant",
//     label: "Restaurant",
//     icon: Utensils,
//     color: "#f97316",
//     propKey: "nearRestaurant",
//   },
// ];

// // ── Helpers ───────────────────────────────────────────────────────────

// /**
//  * Safely parse a value into a finite number.
//  * Returns `null` if the value is missing, null, NaN or non-finite.
//  */
// function toNum(v: unknown): number | null {
//   if (v == null) return null;
//   const n = Number(v);
//   return Number.isFinite(n) ? n : null;
// }

// /**
//  * Normalise the raw boundaryPoints coming from the API.
//  * Mongoose returns [[lat,lng],…] as plain JS arrays, so we accept
//  * any array-like and convert to typed [number,number][] tuples.
//  * Returns an empty array if the data is missing or malformed.
//  */
// function parseBoundary(raw: unknown): [number, number][] {
//   if (!Array.isArray(raw)) return [];
//   const out: [number, number][] = [];
//   for (const pt of raw) {
//     // Mongoose mixed/array field → plain array [lat, lng]
//     if (Array.isArray(pt) && pt.length >= 2) {
//       const lat = toNum(pt[0]);
//       const lng = toNum(pt[1]);
//       if (lat !== null && lng !== null) out.push([lat, lng]);
//     }
//     // Sometimes Mongoose wraps in an object with numeric keys {0: lat, 1: lng}
//     else if (pt && typeof pt === "object") {
//       const lat = toNum((pt as Record<string, unknown>)[0]);
//       const lng = toNum((pt as Record<string, unknown>)[1]);
//       if (lat !== null && lng !== null) out.push([lat, lng]);
//     }
//   }
//   return out;
// }

// // ── RecenterButton ────────────────────────────────────────────────────
// function RecenterButton({ coords }: RecenterButtonProps) {
//   const [mapLib, setMapLib] = useState<{
//     useMap: () => ReturnType<(typeof import("react-leaflet"))["useMap"]>;
//   } | null>(null);

//   useEffect(() => {
//     import("react-leaflet").then((m) => {
//       setMapLib({
//         useMap: m.useMap as unknown as () => ReturnType<
//           (typeof import("react-leaflet"))["useMap"]
//         >,
//       });
//     });
//   }, []);

//   if (!mapLib) return null;
//   return <RecenterInner coords={coords} useMap={mapLib.useMap} />;
// }

// function RecenterInner({ coords, useMap }: RecenterInnerProps) {
//   const map = useMap();
//   return (
//     <button
//       onClick={() => map.flyTo(coords, 16, { duration: 1.2 })}
//       className="absolute bottom-[80px] right-4 z-[500] w-10 h-10 rounded-xl bg-card/90 border border-border backdrop-blur-xl shadow-xl flex items-center justify-center hover:bg-card transition-colors"
//       title="Recenter"
//     >
//       <LocateFixed size={16} className="text-primary" />
//     </button>
//   );
// }

// // ── Main Page ─────────────────────────────────────────────────────────
// export default function PremiumMapPage({
//   params,
// }: {
//   params: Promise<{ id: string }>;
// }) {
//   const { id } = use(params);
//   const router = useRouter();

//   const { data: rawProperty, isLoading } = useProperty(id);

//   const [activeStyle, setActiveStyle] = useState<TileStyleKey>("standard");
//   const [activeFacilities, setActiveFacilities] = useState<Set<string>>(
//     new Set(FACILITY_CATEGORIES.map((c) => c.key)),
//   );
//   const [panelOpen, setPanelOpen] = useState<boolean>(true);
//   const [fullscreen, setFullscreen] = useState<boolean>(false);
//   const [leafletReady, setLeafletReady] = useState<boolean>(false);
//   const [showBoundary, setShowBoundary] = useState<boolean>(true);

//   useEffect(() => {
//     import("leaflet").then((L) => {
//       // @ts-expect-error — internal Leaflet property
//       delete L.Icon.Default.prototype._getIconUrl;
//       L.Icon.Default.mergeOptions({
//         iconRetinaUrl:
//           "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
//         iconUrl:
//           "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
//         shadowUrl:
//           "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
//       });
//       setLeafletReady(true);
//     });
//   }, []);

//   const toggleFacility = (key: string) => {
//     setActiveFacilities((prev) => {
//       const next = new Set(prev);
//       next.has(key) ? next.delete(key) : next.add(key);
//       return next;
//     });
//   };

//   // ── Loading ──────────────────────────────────────────────────────
//   if (isLoading || !rawProperty) {
//     return (
//       <div className="h-screen bg-background flex items-center justify-center">
//         <div className="flex flex-col items-center gap-4">
//           <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
//           <p className="text-sm text-muted-foreground font-medium">
//             Loading premium map…
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // ── Cast raw data to typed shape ─────────────────────────────────
//   const property = rawProperty as PropertyData;

//   // ── GPS pin ───────────────────────────────────────────────────────
//   // toNum() handles null / undefined / string-encoded numbers from the API
//   const lat: number = toNum(property.latitude) ?? 27.7172;
//   const lng: number = toNum(property.longitude) ?? 85.324;
//   const coords: [number, number] = [lat, lng];
//   const hasPin =
//     toNum(property.latitude) !== null && toNum(property.longitude) !== null;

//   // ── Boundary polygon ──────────────────────────────────────────────
//   // parseBoundary() handles Mongoose's mixed array output safely
//   const savedBoundary = parseBoundary(property.boundaryPoints);
//   const hasBoundary = savedBoundary.length >= 3;

//   const { title, location, price, area, category, face, municipality } =
//     property;

//   const bottomStats: StatItem[] = [
//     { icon: Building2, label: "Type", value: (category as string) || "N/A" },
//     { icon: Ruler, label: "Area", value: area ? `${area} Ana` : "N/A" },
//     { icon: Navigation, label: "Face", value: (face as string) || "N/A" },
//     {
//       icon: MapPin,
//       label: "Location",
//       value: (location as string | undefined)?.split(",")[0] ?? "N/A",
//     },
//   ];

//   return (
//     <>
//       <link
//         rel="stylesheet"
//         href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
//       />

//       <div
//         className={cn(
//           "relative bg-background text-foreground overflow-hidden",
//           fullscreen ? "fixed inset-0 z-[9999]" : "h-screen flex flex-col",
//         )}
//       >
//         {/* ── TOP BAR — z-[1000] ──────────────────────────────── */}
//         <div className="absolute inset-x-0 top-0 z-[1000] flex items-center justify-between gap-2 px-4 py-3 bg-background/80 backdrop-blur-2xl border-b border-border/40">
//           {/* LEFT: back + title */}
//           <div className="flex items-center gap-3 min-w-0 shrink-0">
//             <button
//               onClick={() => router.back()}
//               className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors shadow-sm shrink-0"
//             >
//               <ArrowLeft size={15} />
//             </button>
//             <div className="hidden sm:block min-w-0">
//               <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-widest leading-none mb-0.5">
//                 Premium Map
//               </p>
//               <p className="text-sm font-bold leading-tight truncate max-w-[180px]">
//                 {title ?? "Property"}
//               </p>
//             </div>
//           </div>

//           {/* CENTRE: tile style switcher */}
//           <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1 shadow-sm">
//             {(Object.entries(TILE_STYLES) as [TileStyleKey, TileStyle][]).map(
//               ([key, s]) => (
//                 <button
//                   key={key}
//                   onClick={() => setActiveStyle(key)}
//                   className={cn(
//                     "px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap",
//                     activeStyle === key
//                       ? "bg-primary text-primary-foreground shadow-sm"
//                       : "text-muted-foreground hover:text-foreground",
//                   )}
//                 >
//                   {s.label}
//                 </button>
//               ),
//             )}
//           </div>

//           {/* RIGHT: boundary toggle + fullscreen */}
//           <div className="flex items-center gap-2 shrink-0">
//             {hasBoundary && (
//               <button
//                 onClick={() => setShowBoundary((v) => !v)}
//                 className={cn(
//                   "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all",
//                   showBoundary
//                     ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-700 dark:text-cyan-400"
//                     : "bg-card border-border text-muted-foreground hover:text-foreground",
//                 )}
//                 title={showBoundary ? "Hide boundary" : "Show boundary"}
//               >
//                 <Pentagon size={13} />
//                 <span className="hidden sm:inline">Boundary</span>
//               </button>
//             )}
//             <button
//               onClick={() => setFullscreen((f) => !f)}
//               className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors shadow-sm shrink-0"
//             >
//               {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
//             </button>
//           </div>
//         </div>

//         {/* ── MAP AREA ─────────────────────────────────────────── */}
//         <div className="absolute inset-0 top-[56px]">
//           {leafletReady && (
//             <MapContainer
//               center={coords}
//               zoom={hasBoundary ? 16 : hasPin ? 17 : 14}
//               className="h-full w-full"
//               zoomControl={false}
//             >
//               <TileLayer
//                 key={activeStyle}
//                 url={TILE_STYLES[activeStyle].url}
//                 attribution={TILE_STYLES[activeStyle].attribution}
//               />

//               {/* Soft radius ring around pin */}
//               <Circle
//                 center={coords}
//                 radius={80}
//                 pathOptions={{
//                   color: "var(--primary)",
//                   fillColor: "var(--primary)",
//                   fillOpacity: 0.12,
//                   weight: 2,
//                 }}
//               />

//               {/* Property pin */}
//               <Marker position={coords}>
//                 <Popup>
//                   <div className="p-2 min-w-[200px]">
//                     <p className="font-bold text-sm mb-1">
//                       {title ?? "Property"}
//                     </p>
//                     <p className="text-xs text-muted-foreground flex items-center gap-1">
//                       <MapPin size={10} /> {location ?? "N/A"}
//                     </p>
//                     {price != null && (
//                       <p className="text-xs font-bold text-primary mt-1">
//                         NPR {new Intl.NumberFormat("en-IN").format(price)}
//                       </p>
//                     )}
//                     {/* Debug: show raw lat/lng in popup so you can confirm values */}
//                     <p className="text-[10px] text-muted-foreground font-mono mt-1">
//                       {lat.toFixed(5)}, {lng.toFixed(5)}
//                       {!hasPin && " (fallback)"}
//                     </p>
//                   </div>
//                 </Popup>
//               </Marker>

//               {/* Boundary polygon — only rendered when ≥3 valid points exist */}
//               {hasBoundary && showBoundary && (
//                 <Polygon
//                   positions={savedBoundary}
//                   pathOptions={{
//                     color: "#06b6d4",
//                     fillColor: "#06b6d4",
//                     fillOpacity: 0.12,
//                     weight: 2.5,
//                     dashArray: "8 5",
//                   }}
//                 >
//                   <Popup>
//                     <div className="p-2">
//                       <p className="font-bold text-xs mb-1 flex items-center gap-1.5">
//                         <Pentagon size={11} className="text-cyan-500" />
//                         Property boundary
//                       </p>
//                       <p className="text-[10px] text-muted-foreground">
//                         {savedBoundary.length} points
//                       </p>
//                     </div>
//                   </Popup>
//                 </Polygon>
//               )}

//               <RecenterButton coords={coords} />
//             </MapContainer>
//           )}

//           {/* ── SLIDE-IN LEFT PANEL — z-[900] ────────────────────── */}
//           <div
//             className={cn(
//               "absolute top-4 left-4 bottom-20 z-[900] w-[300px] transition-all duration-300 ease-in-out",
//               panelOpen
//                 ? "translate-x-0 opacity-100"
//                 : "-translate-x-[320px] opacity-0 pointer-events-none",
//             )}
//           >
//             <div className="h-full bg-card/95 backdrop-blur-2xl border border-border/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
//               {/* Panel header */}
//               <div className="px-5 pt-5 pb-4 border-b border-border/50">
//                 <div className="flex items-start justify-between gap-2">
//                   <div className="min-w-0">
//                     <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
//                       Property
//                     </p>
//                     <h2 className="text-sm font-bold leading-snug line-clamp-2">
//                       {title ?? "N/A"}
//                     </h2>
//                   </div>
//                   <button
//                     onClick={() => setPanelOpen(false)}
//                     className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center transition-colors shrink-0 mt-0.5"
//                   >
//                     <X size={13} className="text-muted-foreground" />
//                   </button>
//                 </div>
//                 <div className="flex items-center gap-1.5 mt-2 text-muted-foreground">
//                   <MapPin size={11} className="text-destructive shrink-0" />
//                   <span className="text-[11px] font-medium truncate">
//                     {location ?? "N/A"}
//                   </span>
//                 </div>
//               </div>

//               {/* Price */}
//               <div className="px-5 py-3 bg-primary/5 border-b border-border/50">
//                 <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mb-0.5">
//                   Asking Price
//                 </p>
//                 <p className="text-lg font-black text-primary">
//                   NPR{" "}
//                   {price != null
//                     ? new Intl.NumberFormat("en-IN").format(price)
//                     : "N/A"}
//                 </p>
//                 {property.negotiable && (
//                   <span className="text-[9px] font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
//                     Negotiable
//                   </span>
//                 )}
//               </div>

//               {/* Quick stats */}
//               <div className="px-5 py-3 border-b border-border/50">
//                 <div className="grid grid-cols-2 gap-2">
//                   {(
//                     [
//                       {
//                         icon: Building2,
//                         label: "Type",
//                         value: category || "N/A",
//                       },
//                       {
//                         icon: Ruler,
//                         label: "Area",
//                         value: area ? `${area} Ana` : "N/A",
//                       },
//                       { icon: Navigation, label: "Face", value: face || "N/A" },
//                       {
//                         icon: Layers,
//                         label: "Municipality",
//                         value: municipality || "N/A",
//                       },
//                     ] as StatItem[]
//                   ).map(({ icon: Icon, label, value }) => (
//                     <div
//                       key={label}
//                       className="bg-muted/40 rounded-xl px-3 py-2"
//                     >
//                       <div className="flex items-center gap-1.5 mb-0.5">
//                         <Icon size={11} className="text-primary" />
//                         <p className="text-[10px] text-muted-foreground font-medium">
//                           {label}
//                         </p>
//                       </div>
//                       <p className="text-[11px] font-bold truncate">{value}</p>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Coordinates */}
//               <div className="px-5 py-3 border-b border-border/50">
//                 <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
//                   Coordinates
//                 </p>
//                 <div className="flex gap-2">
//                   <div className="flex-1 bg-muted/30 rounded-xl px-3 py-2">
//                     <p className="text-[9px] text-muted-foreground mb-0.5">
//                       Latitude
//                     </p>
//                     <p className="text-[11px] font-mono font-bold">
//                       {hasPin ? (
//                         lat.toFixed(5)
//                       ) : (
//                         <span className="text-muted-foreground/60 italic">
//                           not set
//                         </span>
//                       )}
//                     </p>
//                   </div>
//                   <div className="flex-1 bg-muted/30 rounded-xl px-3 py-2">
//                     <p className="text-[9px] text-muted-foreground mb-0.5">
//                       Longitude
//                     </p>
//                     <p className="text-[11px] font-mono font-bold">
//                       {hasPin ? (
//                         lng.toFixed(5)
//                       ) : (
//                         <span className="text-muted-foreground/60 italic">
//                           not set
//                         </span>
//                       )}
//                     </p>
//                   </div>
//                 </div>
//                 {!hasPin && (
//                   <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-2 font-medium">
//                     No pin saved — showing default Kathmandu location. Edit the
//                     property to set a GPS pin.
//                   </p>
//                 )}
//               </div>

//               {/* Boundary section */}
//               {hasBoundary ? (
//                 <div className="px-5 py-3 border-b border-border/50">
//                   <div className="flex items-center justify-between mb-2">
//                     <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
//                       <Pentagon size={11} className="text-cyan-500" />
//                       Boundary
//                     </p>
//                     <button
//                       onClick={() => setShowBoundary((v) => !v)}
//                       className={cn(
//                         "text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors",
//                         showBoundary
//                           ? "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-500/20"
//                           : "bg-muted/40 text-muted-foreground hover:text-foreground",
//                       )}
//                     >
//                       {showBoundary ? "Hide" : "Show"}
//                     </button>
//                   </div>
//                   <div className="bg-cyan-500/8 border border-cyan-500/20 rounded-xl px-3 py-2">
//                     <p className="text-[11px] font-semibold text-cyan-700 dark:text-cyan-400">
//                       {savedBoundary.length} boundary points
//                     </p>
//                     <p className="text-[10px] text-muted-foreground mt-0.5">
//                       Drawn by seller to outline property area
//                     </p>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="px-5 py-3 border-b border-border/50">
//                   <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mb-2">
//                     <Pentagon size={11} className="text-muted-foreground/40" />
//                     Boundary
//                   </p>
//                   <p className="text-[10px] text-muted-foreground/60 italic">
//                     No boundary drawn. Edit the property to draw one.
//                   </p>
//                 </div>
//               )}

//               {/* Facility toggles */}
//               <div className="px-5 py-3 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
//                 <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
//                   Nearby Facilities
//                 </p>
//                 <div className="space-y-1.5">
//                   {FACILITY_CATEGORIES.map(
//                     ({ key, label, icon: Icon, color, propKey }) => {
//                       const isActive = activeFacilities.has(key);
//                       const distValue = property[propKey] as string | undefined;
//                       return (
//                         <button
//                           key={key}
//                           onClick={() => toggleFacility(key)}
//                           className={cn(
//                             "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left",
//                             isActive
//                               ? "bg-card border-border/60 shadow-sm"
//                               : "bg-muted/20 border-transparent opacity-50",
//                           )}
//                         >
//                           <div
//                             className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
//                             style={{ backgroundColor: `${color}18` }}
//                           >
//                             <Icon size={13} style={{ color }} />
//                           </div>
//                           <div className="flex-1 min-w-0">
//                             <p className="text-[11px] font-semibold truncate">
//                               {label}
//                             </p>
//                             {distValue && (
//                               <p className="text-[10px] text-muted-foreground">
//                                 {distValue}
//                               </p>
//                             )}
//                           </div>
//                           <div
//                             className={cn(
//                               "w-4 h-4 rounded-full border-2 transition-all shrink-0",
//                               isActive
//                                 ? "border-transparent"
//                                 : "border-muted-foreground/30",
//                             )}
//                             style={isActive ? { backgroundColor: color } : {}}
//                           />
//                         </button>
//                       );
//                     },
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Panel open trigger */}
//           {!panelOpen && (
//             <button
//               onClick={() => setPanelOpen(true)}
//               className="absolute top-4 left-4 z-[900] flex items-center gap-2 bg-card/95 backdrop-blur-xl border border-border/60 rounded-xl px-3 py-2 shadow-xl hover:bg-card transition-colors"
//             >
//               <Info size={14} className="text-primary" />
//               <span className="text-xs font-bold">Property Info</span>
//               <ChevronRight size={12} className="text-muted-foreground" />
//             </button>
//           )}

//           {/* ── BOTTOM STATS BAR — z-[1001] ──────────────────────── */}
//           <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1001] flex items-center bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-2xl overflow-hidden whitespace-nowrap">
//             {bottomStats.map(({ icon: Icon, value, label }, i) => (
//               <div
//                 key={label}
//                 className={cn(
//                   "flex items-center gap-2 px-4 py-2.5",
//                   i < bottomStats.length - 1 && "border-r border-border/50",
//                 )}
//               >
//                 <Icon size={13} className="text-primary shrink-0" />
//                 <div>
//                   <p className="text-[9px] text-muted-foreground font-medium leading-none mb-0.5">
//                     {label}
//                   </p>
//                   <p className="text-[11px] font-bold leading-none">{value}</p>
//                 </div>
//               </div>
//             ))}

//             {/* Pin status chip */}
//             <div
//               className={cn(
//                 "flex items-center gap-2 px-4 py-2.5 border-l border-border/50",
//               )}
//             >
//               <MapPin
//                 size={13}
//                 className={
//                   hasPin
//                     ? "text-primary shrink-0"
//                     : "text-muted-foreground/40 shrink-0"
//                 }
//               />
//               <div>
//                 <p className="text-[9px] text-muted-foreground font-medium leading-none mb-0.5">
//                   Pin
//                 </p>
//                 <p
//                   className={cn(
//                     "text-[11px] font-bold leading-none",
//                     hasPin ? "text-foreground" : "text-muted-foreground/50",
//                   )}
//                 >
//                   {hasPin ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : "Not set"}
//                 </p>
//               </div>
//             </div>

//             {/* Boundary chip */}
//             {hasBoundary && (
//               <div className="flex items-center gap-2 px-4 py-2.5 border-l border-border/50">
//                 <Pentagon size={13} className="text-cyan-500 shrink-0" />
//                 <div>
//                   <p className="text-[9px] text-muted-foreground font-medium leading-none mb-0.5">
//                     Boundary
//                   </p>
//                   <p className="text-[11px] font-bold leading-none text-cyan-600 dark:text-cyan-400">
//                     {savedBoundary.length} pts
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Leaflet popup styles */}
//       <style jsx global>{`
//         .leaflet-popup-content-wrapper {
//           background: var(--card) !important;
//           color: var(--foreground) !important;
//           border: 1px solid var(--border) !important;
//           border-radius: 16px !important;
//           box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
//           padding: 0 !important;
//         }
//         .leaflet-popup-tip {
//           background: var(--card) !important;
//         }
//         .leaflet-popup-content {
//           margin: 0 !important;
//         }
//         .leaflet-control-attribution {
//           background: rgba(0, 0, 0, 0.4) !important;
//           backdrop-filter: blur(8px) !important;
//           border-radius: 8px 0 0 0 !important;
//           font-size: 9px !important;
//           color: rgba(255, 255, 255, 0.6) !important;
//         }
//         .leaflet-container {
//           font-family: inherit !important;
//         }
//       `}</style>
//     </>
//   );
// }

"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
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
  LocateFixed,
  Info,
  X,
  Pentagon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProperty } from "@/lib/client/queries/properties.queries";

// ── Leaflet SSR-safe imports ──────────────────────────────────────────
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

// ── Types ─────────────────────────────────────────────────────────────
type TileStyleKey = "standard" | "satellite" | "topo";

interface TileStyle {
  label: string;
  url: string;
  attribution: string;
}
interface FacilityCategory {
  key: string;
  label: string;
  icon: LucideIcon;
  color: string;
  propKey: string;
}
interface RecenterButtonProps {
  coords: [number, number];
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface RecenterInnerProps {
  coords: [number, number];
  useMap: () => any;
}
interface StatItem {
  icon: LucideIcon;
  label: string;
  value: string;
}

/**
 * Normalized property shape — all geo fields typed explicitly.
 * We cast the raw `useProperty` return to this so TypeScript
 * stops complaining about unknown fields.
 */
interface PropertyData {
  title?: string;
  location?: string;
  price?: number;
  area?: string | number;
  category?: string;
  face?: string;
  municipality?: string;
  negotiable?: boolean;
  /** GPS pin set by seller in the map step */
  latitude?: number | null;
  longitude?: number | null;
  /**
   * Boundary polygon drawn by seller.
   * Stored in Mongo as [[lat,lng], …].
   * Mongoose returns plain arrays, so we accept number[][] here.
   */
  boundaryPoints?: number[][];
  [key: string]: unknown;
}

// ── Tile presets ──────────────────────────────────────────────────────
const TILE_STYLES: Record<TileStyleKey, TileStyle> = {
  standard: {
    label: "Standard",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap contributors",
  },
  satellite: {
    label: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
  },
  topo: {
    label: "Terrain",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenTopoMap contributors",
  },
};

// ── Facility config ───────────────────────────────────────────────────
const FACILITY_CATEGORIES: FacilityCategory[] = [
  {
    key: "hospital",
    label: "Hospital",
    icon: Hospital,
    color: "#ef4444",
    propKey: "nearHospital",
  },
  {
    key: "airport",
    label: "Airport",
    icon: Plane,
    color: "#3b82f6",
    propKey: "nearAirport",
  },
  {
    key: "supermarket",
    label: "Supermarket",
    icon: ShoppingCart,
    color: "#f59e0b",
    propKey: "nearSupermarket",
  },
  {
    key: "school",
    label: "School",
    icon: School,
    color: "#8b5cf6",
    propKey: "nearSchool",
  },
  {
    key: "gym",
    label: "Gym",
    icon: Dumbbell,
    color: "#10b981",
    propKey: "nearGym",
  },
  {
    key: "transport",
    label: "Transport",
    icon: Bus,
    color: "#06b6d4",
    propKey: "nearTransport",
  },
  {
    key: "atm",
    label: "ATM",
    icon: Wallet,
    color: "#ec4899",
    propKey: "nearAtm",
  },
  {
    key: "restaurant",
    label: "Restaurant",
    icon: Utensils,
    color: "#f97316",
    propKey: "nearRestaurant",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────

/**
 * Safely parse a value into a finite number.
 * Returns `null` if the value is missing, null, NaN or non-finite.
 */
function toNum(v: unknown): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/**
 * Normalise the raw boundaryPoints coming from the API.
 * Mongoose returns [[lat,lng],…] as plain JS arrays, so we accept
 * any array-like and convert to typed [number,number][] tuples.
 * Returns an empty array if the data is missing or malformed.
 */
function parseBoundary(raw: unknown): [number, number][] {
  if (!Array.isArray(raw)) return [];
  const out: [number, number][] = [];
  for (const pt of raw) {
    // Mongoose mixed/array field → plain array [lat, lng]
    if (Array.isArray(pt) && pt.length >= 2) {
      const lat = toNum(pt[0]);
      const lng = toNum(pt[1]);
      if (lat !== null && lng !== null) out.push([lat, lng]);
    }
    // Sometimes Mongoose wraps in an object with numeric keys {0: lat, 1: lng}
    else if (pt && typeof pt === "object") {
      const lat = toNum((pt as Record<string, unknown>)[0]);
      const lng = toNum((pt as Record<string, unknown>)[1]);
      if (lat !== null && lng !== null) out.push([lat, lng]);
    }
  }
  return out;
}

// ── RecenterButton ────────────────────────────────────────────────────
function RecenterButton({ coords }: RecenterButtonProps) {
  const [mapLib, setMapLib] = useState<{
    useMap: () => ReturnType<(typeof import("react-leaflet"))["useMap"]>;
  } | null>(null);

  useEffect(() => {
    import("react-leaflet").then((m) => {
      setMapLib({
        useMap: m.useMap as unknown as () => ReturnType<
          (typeof import("react-leaflet"))["useMap"]
        >,
      });
    });
  }, []);

  if (!mapLib) return null;
  return <RecenterInner coords={coords} useMap={mapLib.useMap} />;
}

function RecenterInner({ coords, useMap }: RecenterInnerProps) {
  const map = useMap();
  return (
    <button
      onClick={() => map.flyTo(coords, 16, { duration: 1.2 })}
      className="absolute bottom-[80px] right-4 z-[500] w-10 h-10 rounded-xl bg-card/90 border border-border backdrop-blur-xl shadow-xl flex items-center justify-center hover:bg-card transition-colors"
      title="Recenter"
    >
      <LocateFixed size={16} className="text-primary" />
    </button>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────
export default function PremiumMapPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const { data: rawProperty, isLoading } = useProperty(id);

  const [activeStyle, setActiveStyle] = useState<TileStyleKey>("standard");
  const [activeFacilities, setActiveFacilities] = useState<Set<string>>(
    new Set(FACILITY_CATEGORIES.map((c) => c.key)),
  );
  const [panelOpen, setPanelOpen] = useState<boolean>(true);
  const [fullscreen, setFullscreen] = useState<boolean>(false);
  const [leafletReady, setLeafletReady] = useState<boolean>(false);
  const [showBoundary, setShowBoundary] = useState<boolean>(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pinIcon, setPinIcon] = useState<any>(null);

  useEffect(() => {
    import("leaflet").then((L) => {
      // @ts-expect-error — internal Leaflet property
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });
      // Custom teardrop pin in primary colour
      const icon = L.divIcon({
        html: `<div style="
          width:28px;height:28px;
          border-radius:50% 50% 50% 0;
          background:#ef4444;
          border:3px solid white;
          transform:rotate(-45deg);
          box-shadow:0 2px 8px rgba(0,0,0,0.35);
        "></div>`,
        className: "",
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -30],
      });
      setPinIcon(icon);
      setLeafletReady(true);
    });
  }, []);

  const toggleFacility = (key: string) => {
    setActiveFacilities((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // ── Loading ──────────────────────────────────────────────────────
  if (isLoading || !rawProperty) {
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

  // ── Cast raw data to typed shape ─────────────────────────────────
  const property = rawProperty as PropertyData;

  // ── GPS pin ───────────────────────────────────────────────────────
  // toNum() handles null / undefined / string-encoded numbers from the API
  const lat: number = toNum(property.latitude) ?? 27.7172;
  const lng: number = toNum(property.longitude) ?? 85.324;
  const coords: [number, number] = [lat, lng];
  const hasPin =
    toNum(property.latitude) !== null && toNum(property.longitude) !== null;

  // ── Boundary polygon ──────────────────────────────────────────────
  // parseBoundary() handles Mongoose's mixed array output safely
  const savedBoundary = parseBoundary(property.boundaryPoints);
  const hasBoundary = savedBoundary.length >= 3;

  const { title, location, price, area, category, face, municipality } =
    property;

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
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
      />

      <div
        className={cn(
          "relative bg-background text-foreground overflow-hidden",
          fullscreen ? "fixed inset-0 z-[9999]" : "h-screen flex flex-col",
        )}
      >
        {/* ── TOP BAR — z-[1000] ──────────────────────────────── */}
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

          {/* CENTRE: tile style switcher */}
          <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1 shadow-sm">
            {(Object.entries(TILE_STYLES) as [TileStyleKey, TileStyle][]).map(
              ([key, s]) => (
                <button
                  key={key}
                  onClick={() => setActiveStyle(key)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap",
                    activeStyle === key
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {s.label}
                </button>
              ),
            )}
          </div>

          {/* RIGHT: boundary toggle + fullscreen */}
          <div className="flex items-center gap-2 shrink-0">
            {hasBoundary && (
              <button
                onClick={() => setShowBoundary((v) => !v)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all",
                  showBoundary
                    ? "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400"
                    : "bg-card border-border text-muted-foreground hover:text-foreground",
                )}
                title={showBoundary ? "Hide boundary" : "Show boundary"}
              >
                <Pentagon size={13} />
                <span className="hidden sm:inline">Boundary</span>
              </button>
            )}
            <button
              onClick={() => setFullscreen((f) => !f)}
              className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors shadow-sm shrink-0"
            >
              {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>
        </div>

        {/* ── MAP AREA ─────────────────────────────────────────── */}
        <div className="absolute inset-0 top-[56px]">
          {leafletReady && (
            <MapContainer
              center={coords}
              zoom={hasBoundary ? 16 : hasPin ? 17 : 14}
              className="h-full w-full"
              zoomControl={false}
            >
              <TileLayer
                key={activeStyle}
                url={TILE_STYLES[activeStyle].url}
                attribution={TILE_STYLES[activeStyle].attribution}
              />

              {/* Property pin */}
              <Marker position={coords} {...(pinIcon ? { icon: pinIcon } : {})}>
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <p className="font-bold text-sm mb-1">
                      {title ?? "Property"}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin size={10} /> {location ?? "N/A"}
                    </p>
                    {price != null && (
                      <p className="text-xs font-bold text-primary mt-1">
                        NPR {new Intl.NumberFormat("en-IN").format(price)}
                      </p>
                    )}
                    {/* Debug: show raw lat/lng in popup so you can confirm values */}
                    <p className="text-[10px] text-muted-foreground font-mono mt-1">
                      {lat.toFixed(5)}, {lng.toFixed(5)}
                      {!hasPin && " (fallback)"}
                    </p>
                  </div>
                </Popup>
              </Marker>

              {/* Boundary polygon — only rendered when ≥3 valid points exist */}
              {hasBoundary && showBoundary && (
                <Polygon
                  positions={savedBoundary}
                  pathOptions={{
                    color: "#ef4444",
                    fillColor: "#ef4444",
                    fillOpacity: 0.12,
                    weight: 2.5,
                    dashArray: "8 5",
                  }}
                >
                  <Popup>
                    <div className="p-2">
                      <p className="font-bold text-xs mb-1 flex items-center gap-1.5">
                        <Pentagon size={11} className="text-cyan-500" />
                        Property boundary
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {savedBoundary.length} points
                      </p>
                    </div>
                  </Popup>
                </Polygon>
              )}

              <RecenterButton coords={coords} />
            </MapContainer>
          )}

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
                {property.negotiable && (
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
                        value: category || "N/A",
                      },
                      {
                        icon: Ruler,
                        label: "Area",
                        value: area ? `${area} Ana` : "N/A",
                      },
                      { icon: Navigation, label: "Face", value: face || "N/A" },
                      {
                        icon: Layers,
                        label: "Municipality",
                        value: municipality || "N/A",
                      },
                    ] as StatItem[]
                  ).map(({ icon: Icon, label, value }) => (
                    <div
                      key={label}
                      className="bg-muted/40 rounded-xl px-3 py-2"
                    >
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
                      {hasPin ? (
                        lat.toFixed(5)
                      ) : (
                        <span className="text-muted-foreground/60 italic">
                          not set
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex-1 bg-muted/30 rounded-xl px-3 py-2">
                    <p className="text-[9px] text-muted-foreground mb-0.5">
                      Longitude
                    </p>
                    <p className="text-[11px] font-mono font-bold">
                      {hasPin ? (
                        lng.toFixed(5)
                      ) : (
                        <span className="text-muted-foreground/60 italic">
                          not set
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                {!hasPin && (
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-2 font-medium">
                    No pin saved — showing default Kathmandu location. Edit the
                    property to set a GPS pin.
                  </p>
                )}
              </div>

              {/* Boundary section */}
              {hasBoundary ? (
                <div className="px-5 py-3 border-b border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                      <Pentagon size={11} className="text-red-500" />
                      Boundary
                    </p>
                    <button
                      onClick={() => setShowBoundary((v) => !v)}
                      className={cn(
                        "text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors",
                        showBoundary
                          ? "bg-red-500/10 text-red-700 dark:text-red-400 hover:bg-red-500/20"
                          : "bg-muted/40 text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {showBoundary ? "Hide" : "Show"}
                    </button>
                  </div>
                  <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-3 py-2">
                    <p className="text-[11px] font-semibold text-red-700 dark:text-red-400">
                      {savedBoundary.length} boundary points
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Drawn by seller to outline property area
                    </p>
                  </div>
                </div>
              ) : (
                <div className="px-5 py-3 border-b border-border/50">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mb-2">
                    <Pentagon size={11} className="text-muted-foreground/40" />
                    Boundary
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 italic">
                    No boundary drawn. Edit the property to draw one.
                  </p>
                </div>
              )}

              {/* Facility toggles */}
              <div className="px-5 py-3 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                  Nearby Facilities
                </p>
                <div className="space-y-1.5">
                  {FACILITY_CATEGORIES.map(
                    ({ key, label, icon: Icon, color, propKey }) => {
                      const isActive = activeFacilities.has(key);
                      const distValue = property[propKey] as string | undefined;
                      return (
                        <button
                          key={key}
                          onClick={() => toggleFacility(key)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left",
                            isActive
                              ? "bg-card border-border/60 shadow-sm"
                              : "bg-muted/20 border-transparent opacity-50",
                          )}
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
                            {distValue && (
                              <p className="text-[10px] text-muted-foreground">
                                {distValue}
                              </p>
                            )}
                          </div>
                          <div
                            className={cn(
                              "w-4 h-4 rounded-full border-2 transition-all shrink-0",
                              isActive
                                ? "border-transparent"
                                : "border-muted-foreground/30",
                            )}
                            style={isActive ? { backgroundColor: color } : {}}
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

            {/* Pin status chip */}
            <div
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 border-l border-border/50",
              )}
            >
              <MapPin
                size={13}
                className={
                  hasPin
                    ? "text-primary shrink-0"
                    : "text-muted-foreground/40 shrink-0"
                }
              />
              <div>
                <p className="text-[9px] text-muted-foreground font-medium leading-none mb-0.5">
                  Pin
                </p>
                <p
                  className={cn(
                    "text-[11px] font-bold leading-none",
                    hasPin ? "text-foreground" : "text-muted-foreground/50",
                  )}
                >
                  {hasPin ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : "Not set"}
                </p>
              </div>
            </div>

            {/* Boundary chip */}
            {hasBoundary && (
              <div className="flex items-center gap-2 px-4 py-2.5 border-l border-border/50">
                <Pentagon size={13} className="text-red-500 shrink-0" />
                <div>
                  <p className="text-[9px] text-muted-foreground font-medium leading-none mb-0.5">
                    Boundary
                  </p>
                  <p className="text-[11px] font-bold leading-none text-red-600 dark:text-red-400">
                    {savedBoundary.length} pts
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Leaflet popup styles */}
      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          background: var(--card) !important;
          color: var(--foreground) !important;
          border: 1px solid var(--border) !important;
          border-radius: 16px !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
          padding: 0 !important;
        }
        .leaflet-popup-tip {
          background: var(--card) !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
        }
        .leaflet-control-attribution {
          background: rgba(0, 0, 0, 0.4) !important;
          backdrop-filter: blur(8px) !important;
          border-radius: 8px 0 0 0 !important;
          font-size: 9px !important;
          color: rgba(255, 255, 255, 0.6) !important;
        }
        .leaflet-container {
          font-family: inherit !important;
        }
      `}</style>
    </>
  );
}
