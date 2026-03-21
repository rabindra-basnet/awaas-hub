// // // "use client";

// // // import { useState, useRef, useEffect, useCallback } from "react";
// // // import { useForm } from "react-hook-form";
// // // import { zodResolver } from "@hookform/resolvers/zod";
// // // import * as z from "zod";
// // // import dynamic from "next/dynamic";
// // // import { Button } from "@/components/ui/button";
// // // import { Input } from "@/components/ui/input";
// // // import { Textarea } from "@/components/ui/textarea";
// // // import { Label } from "@/components/ui/label";
// // // import {
// // //   Select,
// // //   SelectContent,
// // //   SelectItem,
// // //   SelectTrigger,
// // //   SelectValue,
// // // } from "@/components/ui/select";
// // // import { Switch } from "@/components/ui/switch";
// // // import {
// // //   X,
// // //   Plus,
// // //   CheckCircle2,
// // //   ChevronLeft,
// // //   ChevronRight,
// // //   Info,
// // //   Building2,
// // //   MapPin,
// // //   Utensils,
// // //   ImageIcon,
// // //   Check,
// // //   LocateFixed,
// // //   Map,
// // //   Crosshair,
// // //   Trash2,
// // //   Pentagon,
// // // } from "lucide-react";
// // // import { usePropertyImages } from "@/lib/client/queries/properties.queries";
// // // import { cn } from "@/lib/utils";

// // // // ── Schema ────────────────────────────────────────────────────────────
// // // const formSchema = z.object({
// // //   title: z.string().min(3, "Title must be at least 3 characters"),
// // //   price: z.number().positive("Price must be positive"),
// // //   location: z.string().min(1, "Location is required"),
// // //   description: z.string().max(5000).optional(),
// // //   category: z.string().min(1, "Property type is required"),
// // //   status: z.enum(["available", "booked", "sold"]),
// // //   area: z.string().min(1, "Area is required"),
// // //   face: z.string().min(1, "Property Face is required"),
// // //   roadType: z.string().min(1, "Property Road type is required"),
// // //   roadAccess: z.string().optional(),
// // //   negotiable: z.boolean(),
// // //   municipality: z.string().optional(),
// // //   wardNo: z.string().optional(),
// // //   ringRoad: z.string().optional(),
// // //   latitude: z.number().optional(),
// // //   longitude: z.number().optional(),
// // //   nearHospital: z.string().optional(),
// // //   nearAirport: z.string().optional(),
// // //   nearSupermarket: z.string().optional(),
// // //   nearSchool: z.string().optional(),
// // //   nearGym: z.string().optional(),
// // //   nearTransport: z.string().optional(),
// // //   nearAtm: z.string().optional(),
// // //   nearRestaurant: z.string().optional(),
// // // });

// // // export type PropertyStatus = z.infer<typeof formSchema>["status"];
// // // export type PropertyFormValues = z.infer<typeof formSchema>;

// // // type PreviewFile = {
// // //   file: File;
// // //   url: string;
// // //   uploadProgress?: number;
// // //   fileId?: string;
// // // };
// // // type ExistingImage = { id: string; url: string; filename: string };

// // // interface PropertyFormProps {
// // //   initialData?: Partial<PropertyFormValues>;
// // //   initialBoundary?: [number, number][]; // ← pre-fill boundary for edit mode
// // //   existingImages?: ExistingImage[];
// // //   propertyId?: string;
// // //   onSubmit: (
// // //     values: PropertyFormValues & {
// // //       fileIds: string[];
// // //       deletedFileIds: string[];
// // //       boundaryPoints: [number, number][]; // ← always included in submission
// // //     },
// // //   ) => void;
// // //   isSubmitting?: boolean;
// // //   buttonText?: string;
// // // }

// // // // ── Steps ─────────────────────────────────────────────────────────────
// // // const STEPS = [
// // //   {
// // //     id: 0,
// // //     label: "Basic Info",
// // //     short: "Basic",
// // //     icon: Info,
// // //     accent: "bg-primary",
// // //     border: "border-primary",
// // //   },
// // //   {
// // //     id: 1,
// // //     label: "Property",
// // //     short: "Property",
// // //     icon: Building2,
// // //     accent: "bg-amber-500",
// // //     border: "border-amber-500",
// // //   },
// // //   {
// // //     id: 2,
// // //     label: "Location",
// // //     short: "Location",
// // //     icon: MapPin,
// // //     accent: "bg-blue-500",
// // //     border: "border-blue-500",
// // //   },
// // //   {
// // //     id: 3,
// // //     label: "Map Pin",
// // //     short: "Map",
// // //     icon: Map,
// // //     accent: "bg-cyan-500",
// // //     border: "border-cyan-500",
// // //   },
// // //   {
// // //     id: 4,
// // //     label: "Facilities",
// // //     short: "Nearby",
// // //     icon: Utensils,
// // //     accent: "bg-green-500",
// // //     border: "border-green-500",
// // //   },
// // //   {
// // //     id: 5,
// // //     label: "Images",
// // //     short: "Images",
// // //     icon: ImageIcon,
// // //     accent: "bg-purple-500",
// // //     border: "border-purple-500",
// // //   },
// // // ];

// // // const STEP_FIELDS: Record<number, (keyof PropertyFormValues)[]> = {
// // //   0: ["title", "price", "location", "category", "status"],
// // //   1: ["area", "face", "roadType", "roadAccess", "negotiable"],
// // //   2: ["municipality", "wardNo", "ringRoad"],
// // //   3: [],
// // //   4: [],
// // //   5: [],
// // // };

// // // // ── Tile styles ───────────────────────────────────────────────────────
// // // const TILE_STYLES = {
// // //   standard: {
// // //     label: "Map",
// // //     url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
// // //     attribution: "&copy; OpenStreetMap",
// // //   },
// // //   satellite: {
// // //     label: "Satellite",
// // //     url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
// // //     attribution: "Esri",
// // //   },
// // // };
// // // type TileKey = keyof typeof TILE_STYLES;

// // // // ── Leaflet dynamic imports ───────────────────────────────────────────
// // // const MapContainer = dynamic(
// // //   () => import("react-leaflet").then((m) => m.MapContainer),
// // //   { ssr: false },
// // // );
// // // const TileLayer = dynamic(
// // //   () => import("react-leaflet").then((m) => m.TileLayer),
// // //   { ssr: false },
// // // );
// // // const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), {
// // //   ssr: false,
// // // });
// // // const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), {
// // //   ssr: false,
// // // });
// // // const Polygon = dynamic(() => import("react-leaflet").then((m) => m.Polygon), {
// // //   ssr: false,
// // // });

// // // // ── Field wrapper ─────────────────────────────────────────────────────
// // // function Field({
// // //   label,
// // //   error,
// // //   className,
// // //   children,
// // // }: {
// // //   label: string;
// // //   error?: string;
// // //   className?: string;
// // //   children: React.ReactNode;
// // // }) {
// // //   return (
// // //     <div className={cn("flex flex-col gap-1.5", className)}>
// // //       <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
// // //         {label}
// // //       </Label>
// // //       {children}
// // //       {error && (
// // //         <p className="text-[11px] text-destructive font-semibold">{error}</p>
// // //       )}
// // //     </div>
// // //   );
// // // }

// // // // ── Inner map components ──────────────────────────────────────────────
// // // function MapClickHandler({
// // //   onMapClick,
// // //   useMapEventsHook,
// // // }: {
// // //   onMapClick: (lat: number, lng: number) => void;
// // //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
// // //   useMapEventsHook: any;
// // // }) {
// // //   useMapEventsHook({
// // //     click(e: { latlng: { lat: number; lng: number } }) {
// // //       onMapClick(e.latlng.lat, e.latlng.lng);
// // //     },
// // //   });
// // //   return null;
// // // }

// // // function FlyTo({
// // //   lat,
// // //   lng,
// // //   useMapHook,
// // // }: {
// // //   lat: number;
// // //   lng: number;
// // //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
// // //   useMapHook: any;
// // // }) {
// // //   const map = useMapHook();
// // //   useEffect(() => {
// // //     map.flyTo([lat, lng], 17, { duration: 1 });
// // //   }, [lat, lng]);
// // //   return null;
// // // }

// // // // ── LeafletMapPicker ──────────────────────────────────────────────────
// // // interface LeafletMapPickerProps {
// // //   lat?: number;
// // //   lng?: number;
// // //   boundaryPoints: [number, number][];
// // //   onChange: (lat: number, lng: number) => void;
// // //   onClear: () => void;
// // //   onBoundaryChange: (points: [number, number][]) => void;
// // // }

// // // function LeafletMapPicker({
// // //   lat,
// // //   lng,
// // //   boundaryPoints,
// // //   onChange,
// // //   onClear,
// // //   onBoundaryChange,
// // // }: LeafletMapPickerProps) {
// // //   const [leafletReady, setLeafletReady] = useState(false);
// // //   const [leafletLib, setLeafletLib] = useState<{
// // //     useMapEvents: (typeof import("react-leaflet"))["useMapEvents"];
// // //     useMap: (typeof import("react-leaflet"))["useMap"];
// // //     divIcon: (typeof import("leaflet"))["divIcon"];
// // //   } | null>(null);

// // //   const [geoStatus, setGeoStatus] = useState<
// // //     "idle" | "asking" | "granted" | "denied"
// // //   >("idle");
// // //   const [geoError, setGeoError] = useState("");
// // //   const [tileKey, setTileKey] = useState<TileKey>("standard");
// // //   const [drawMode, setDrawMode] = useState(false);

// // //   const centreLat = lat ?? 27.7172;
// // //   const centreLng = lng ?? 85.324;

// // //   useEffect(() => {
// // //     Promise.all([import("leaflet"), import("react-leaflet")]).then(
// // //       ([L, RL]) => {
// // //         // @ts-expect-error — internal property
// // //         delete L.Icon.Default.prototype._getIconUrl;
// // //         L.Icon.Default.mergeOptions({
// // //           iconRetinaUrl:
// // //             "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
// // //           iconUrl:
// // //             "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
// // //           shadowUrl:
// // //             "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
// // //         });
// // //         setLeafletLib({
// // //           useMapEvents: RL.useMapEvents,
// // //           useMap: RL.useMap,
// // //           divIcon: L.divIcon,
// // //         });
// // //         setLeafletReady(true);
// // //       },
// // //     );
// // //   }, []);

// // //   useEffect(() => {
// // //     if (!navigator.geolocation) {
// // //       setGeoStatus("denied");
// // //       return;
// // //     }
// // //     setGeoStatus("asking");
// // //     navigator.geolocation.getCurrentPosition(
// // //       (pos) => {
// // //         setGeoStatus("granted");
// // //         if (!lat && !lng) onChange(pos.coords.latitude, pos.coords.longitude);
// // //       },
// // //       (err) => {
// // //         setGeoStatus("denied");
// // //         setGeoError(
// // //           err.code === 1
// // //             ? "Location permission denied. Click the map or enter coordinates manually."
// // //             : "Could not get location. Click the map to set the pin.",
// // //         );
// // //       },
// // //       { enableHighAccuracy: true, timeout: 8000 },
// // //     );
// // //   }, []);

// // //   const handleMapClick = useCallback(
// // //     (clickLat: number, clickLng: number) => {
// // //       if (drawMode) {
// // //         onBoundaryChange([...boundaryPoints, [clickLat, clickLng]]);
// // //       } else {
// // //         onChange(clickLat, clickLng);
// // //       }
// // //     },
// // //     [drawMode, boundaryPoints, onChange, onBoundaryChange],
// // //   );

// // //   const goToCurrentLocation = () => {
// // //     if (!navigator.geolocation) return;
// // //     setGeoStatus("asking");
// // //     navigator.geolocation.getCurrentPosition(
// // //       (pos) => {
// // //         setGeoStatus("granted");
// // //         onChange(pos.coords.latitude, pos.coords.longitude);
// // //         setGeoError("");
// // //       },
// // //       () => {
// // //         setGeoStatus("denied");
// // //         setGeoError("Could not get location.");
// // //       },
// // //       { enableHighAccuracy: true, timeout: 8000 },
// // //     );
// // //   };

// // //   const removeBoundaryPoint = (idx: number) => {
// // //     onBoundaryChange(boundaryPoints.filter((_, i) => i !== idx));
// // //   };

// // //   const pinIcon = leafletLib?.divIcon({
// // //     html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:hsl(var(--primary));border:3px solid white;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.25)"></div>`,
// // //     className: "",
// // //     iconSize: [28, 28],
// // //     iconAnchor: [14, 28],
// // //   });

// // //   const boundaryIcon = leafletLib?.divIcon({
// // //     html: `<div style="width:10px;height:10px;border-radius:50%;background:#06b6d4;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
// // //     className: "",
// // //     iconSize: [10, 10],
// // //     iconAnchor: [5, 5],
// // //   });

// // //   return (
// // //     <div className="sm:col-span-2 flex flex-col gap-3">
// // //       {/* Geo banners */}
// // //       {geoStatus === "asking" && (
// // //         <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-primary/8 border border-primary/20">
// // //           <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
// // //           <span className="text-[12px] font-semibold text-primary">
// // //             Requesting your location…
// // //           </span>
// // //         </div>
// // //       )}
// // //       {geoStatus === "denied" && geoError && (
// // //         <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
// // //           <MapPin size={14} className="text-amber-500 shrink-0" />
// // //           <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
// // //             {geoError}
// // //           </span>
// // //         </div>
// // //       )}
// // //       {geoStatus === "granted" && !lat && (
// // //         <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-green-500/8 border border-green-500/20">
// // //           <LocateFixed size={13} className="text-green-500 shrink-0" />
// // //           <span className="text-[11px] font-semibold text-green-700 dark:text-green-400">
// // //             Location found — click the map to drop the property pin
// // //           </span>
// // //         </div>
// // //       )}

// // //       {/* Toolbar */}
// // //       <div className="flex items-center gap-2 flex-wrap">
// // //         <div className="flex items-center gap-1 bg-muted/40 border border-border/50 rounded-xl p-1">
// // //           {(Object.keys(TILE_STYLES) as TileKey[]).map((k) => (
// // //             <button
// // //               key={k}
// // //               type="button"
// // //               onClick={() => setTileKey(k)}
// // //               className={cn(
// // //                 "px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all",
// // //                 tileKey === k
// // //                   ? "bg-primary text-primary-foreground"
// // //                   : "text-muted-foreground hover:text-foreground",
// // //               )}
// // //             >
// // //               {TILE_STYLES[k].label}
// // //             </button>
// // //           ))}
// // //         </div>

// // //         <button
// // //           type="button"
// // //           onClick={goToCurrentLocation}
// // //           disabled={geoStatus === "asking"}
// // //           className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/60 text-[11px] font-bold transition-colors disabled:opacity-50"
// // //         >
// // //           <LocateFixed size={12} className="text-primary" />
// // //           {geoStatus === "asking" ? "Locating…" : "My location"}
// // //         </button>

// // //         <button
// // //           type="button"
// // //           onClick={() => setDrawMode((v) => !v)}
// // //           className={cn(
// // //             "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all",
// // //             drawMode
// // //               ? "bg-cyan-500 text-white border-cyan-500"
// // //               : "border-border/50 bg-muted/30 hover:bg-muted/60 text-muted-foreground",
// // //           )}
// // //         >
// // //           <Pentagon size={12} />
// // //           {drawMode ? "Drawing boundary…" : "Draw boundary"}
// // //         </button>

// // //         {boundaryPoints.length > 0 && (
// // //           <button
// // //             type="button"
// // //             onClick={() => onBoundaryChange([])}
// // //             className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 text-[11px] font-bold text-destructive transition-colors"
// // //           >
// // //             <Trash2 size={11} /> Clear boundary
// // //           </button>
// // //         )}

// // //         {lat && lng && (
// // //           <button
// // //             type="button"
// // //             onClick={onClear}
// // //             className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 text-[11px] font-bold text-destructive transition-colors"
// // //           >
// // //             <X size={11} /> Clear pin
// // //           </button>
// // //         )}
// // //       </div>

// // //       {/* Map */}
// // //       <div className="relative rounded-2xl overflow-hidden border border-border/60">
// // //         <div className="absolute top-3 right-3 z-[1000]">
// // //           {lat && lng ? (
// // //             <div className="flex items-center gap-1.5 bg-green-500/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full">
// // //               <Check size={10} /> Pin set
// // //             </div>
// // //           ) : (
// // //             <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md text-white/70 text-[10px] font-bold px-3 py-1.5 rounded-full">
// // //               <Crosshair size={10} />{" "}
// // //               {drawMode ? "Click to draw" : "Click to pin"}
// // //             </div>
// // //           )}
// // //         </div>

// // //         {drawMode && (
// // //           <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 bg-cyan-500/90 backdrop-blur-md text-white text-[11px] font-bold px-4 py-2 rounded-full">
// // //             <Pentagon size={12} />
// // //             Click to add boundary points ({boundaryPoints.length} placed)
// // //           </div>
// // //         )}

// // //         <link
// // //           rel="stylesheet"
// // //           href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
// // //         />

// // //         <div style={{ height: "360px" }}>
// // //           {leafletReady && leafletLib ? (
// // //             <MapContainer
// // //               center={[centreLat, centreLng]}
// // //               zoom={lat ? 17 : 14}
// // //               className="h-full w-full"
// // //               zoomControl
// // //               style={{ cursor: drawMode ? "crosshair" : "default" }}
// // //             >
// // //               <TileLayer
// // //                 key={tileKey}
// // //                 url={TILE_STYLES[tileKey].url}
// // //                 attribution={TILE_STYLES[tileKey].attribution}
// // //               />

// // //               <MapClickHandler
// // //                 onMapClick={handleMapClick}
// // //                 useMapEventsHook={leafletLib.useMapEvents}
// // //               />

// // //               {lat && lng && (
// // //                 <FlyTo lat={lat} lng={lng} useMapHook={leafletLib.useMap} />
// // //               )}

// // //               {lat && lng && pinIcon && (
// // //                 <Marker
// // //                   position={[lat, lng]}
// // //                   icon={pinIcon}
// // //                   draggable
// // //                   // @ts-expect-error
// // //                   eventHandlers={{
// // //                     dragend(e: {
// // //                       target: { getLatLng: () => { lat: number; lng: number } };
// // //                     }) {
// // //                       const p = e.target.getLatLng();
// // //                       onChange(p.lat, p.lng);
// // //                     },
// // //                   }}
// // //                 >
// // //                   <Popup>
// // //                     <div className="p-1.5 min-w-[140px]">
// // //                       <p className="text-xs font-bold mb-1">Property pin</p>
// // //                       <p className="text-[10px] text-muted-foreground font-mono">
// // //                         {lat.toFixed(6)}, {lng.toFixed(6)}
// // //                       </p>
// // //                       <p className="text-[10px] text-muted-foreground mt-1">
// // //                         Drag to reposition
// // //                       </p>
// // //                     </div>
// // //                   </Popup>
// // //                 </Marker>
// // //               )}

// // //               {boundaryPoints.length >= 3 && (
// // //                 <Polygon
// // //                   positions={boundaryPoints}
// // //                   pathOptions={{
// // //                     color: "#06b6d4",
// // //                     fillColor: "#06b6d4",
// // //                     fillOpacity: 0.15,
// // //                     weight: 2,
// // //                     dashArray: "6 4",
// // //                   }}
// // //                 />
// // //               )}

// // //               {boundaryPoints.map((pt, i) =>
// // //                 boundaryIcon ? (
// // //                   <Marker
// // //                     key={i}
// // //                     position={pt}
// // //                     icon={boundaryIcon}
// // //                     // @ts-expect-error
// // //                     eventHandlers={{
// // //                       click() {
// // //                         removeBoundaryPoint(i);
// // //                       },
// // //                     }}
// // //                   >
// // //                     <Popup>
// // //                       <span className="text-[10px]">
// // //                         Click to remove point {i + 1}
// // //                       </span>
// // //                     </Popup>
// // //                   </Marker>
// // //                 ) : null,
// // //               )}
// // //             </MapContainer>
// // //           ) : (
// // //             <div className="h-full bg-muted flex items-center justify-center">
// // //               <div className="flex flex-col items-center gap-3">
// // //                 <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
// // //                 <p className="text-xs text-muted-foreground font-medium">
// // //                   Loading map…
// // //                 </p>
// // //               </div>
// // //             </div>
// // //           )}
// // //         </div>
// // //       </div>

// // //       {/* Coordinates display */}
// // //       {lat && lng && (
// // //         <div className="grid grid-cols-2 gap-2">
// // //           <div className="bg-muted/40 border border-border/50 rounded-xl px-3 py-2">
// // //             <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">
// // //               Latitude
// // //             </p>
// // //             <p className="text-[12px] font-mono font-bold">{lat.toFixed(6)}</p>
// // //           </div>
// // //           <div className="bg-muted/40 border border-border/50 rounded-xl px-3 py-2">
// // //             <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">
// // //               Longitude
// // //             </p>
// // //             <p className="text-[12px] font-mono font-bold">{lng.toFixed(6)}</p>
// // //           </div>
// // //         </div>
// // //       )}

// // //       {/* Boundary info */}
// // //       {boundaryPoints.length > 0 && (
// // //         <div className="bg-cyan-500/8 border border-cyan-500/20 rounded-xl px-4 py-3">
// // //           <div className="flex items-center justify-between mb-1.5">
// // //             <p className="text-[11px] font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider">
// // //               Boundary — {boundaryPoints.length} point
// // //               {boundaryPoints.length !== 1 ? "s" : ""}
// // //               {boundaryPoints.length >= 3 && (
// // //                 <span className="ml-2 text-green-600 dark:text-green-400">
// // //                   ✓ saved
// // //                 </span>
// // //               )}
// // //             </p>
// // //             {boundaryPoints.length < 3 && (
// // //               <span className="text-[10px] text-muted-foreground">
// // //                 Add {3 - boundaryPoints.length} more to close polygon
// // //               </span>
// // //             )}
// // //           </div>
// // //           <div className="flex flex-wrap gap-1.5">
// // //             {boundaryPoints.map((pt, i) => (
// // //               <button
// // //                 key={i}
// // //                 type="button"
// // //                 onClick={() => removeBoundaryPoint(i)}
// // //                 className="flex items-center gap-1 bg-cyan-500/15 hover:bg-destructive/15 border border-cyan-500/20 hover:border-destructive/30 rounded-lg px-2 py-1 text-[10px] font-mono transition-colors group"
// // //               >
// // //                 <span className="text-cyan-700 dark:text-cyan-400 group-hover:text-destructive">
// // //                   {pt[0].toFixed(4)}, {pt[1].toFixed(4)}
// // //                 </span>
// // //                 <X
// // //                   size={9}
// // //                   className="text-muted-foreground group-hover:text-destructive"
// // //                 />
// // //               </button>
// // //             ))}
// // //           </div>
// // //         </div>
// // //       )}

// // //       <p className="text-[11px] text-muted-foreground font-medium">
// // //         Click the map to drop the property pin. Drag the pin to fine-tune. Use
// // //         Draw boundary to outline the land area — click to add points, click a
// // //         point to remove it. The boundary will appear as a polygon overlay on the
// // //         premium map. This step is optional.
// // //       </p>
// // //     </div>
// // //   );
// // // }

// // // // ── Main Form ─────────────────────────────────────────────────────────
// // // export default function PropertyForm({
// // //   initialData,
// // //   initialBoundary = [],
// // //   existingImages: initialExistingImages,
// // //   propertyId,
// // //   onSubmit,
// // //   isSubmitting = false,
// // //   buttonText = "Save Property",
// // // }: PropertyFormProps) {
// // //   const [step, setStep] = useState(0);
// // //   const [direction, setDirection] = useState<"forward" | "back">("forward");
// // //   const [animating, setAnimating] = useState(false);
// // //   const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

// // //   const [images, setImages] = useState<PreviewFile[]>([]);
// // //   const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
// // //   const [deletedFileIds, setDeletedFileIds] = useState<string[]>([]);
// // //   const [uploading, setUploading] = useState(false);

// // //   // ── Boundary state lives here so it persists across step navigation ──
// // //   const [boundaryPoints, setBoundaryPoints] =
// // //     useState<[number, number][]>(initialBoundary);

// // //   const fileInputRef = useRef<HTMLInputElement>(null);

// // //   const {
// // //     register,
// // //     handleSubmit,
// // //     setValue,
// // //     watch,
// // //     trigger,
// // //     formState: { errors },
// // //   } = useForm<PropertyFormValues>({
// // //     resolver: zodResolver(formSchema),
// // //     defaultValues: {
// // //       title: initialData?.title || "",
// // //       price: initialData?.price || 0,
// // //       location: initialData?.location || "",
// // //       description: initialData?.description || "",
// // //       category: initialData?.category || "",
// // //       status: initialData?.status || "available",
// // //       area: initialData?.area || "",
// // //       face: initialData?.face || "",
// // //       roadType: initialData?.roadType || "",
// // //       roadAccess: initialData?.roadAccess || "",
// // //       negotiable: initialData?.negotiable ?? false,
// // //       municipality: initialData?.municipality || "",
// // //       wardNo: initialData?.wardNo || "",
// // //       ringRoad: initialData?.ringRoad || "",
// // //       latitude: initialData?.latitude,
// // //       longitude: initialData?.longitude,
// // //       nearHospital: initialData?.nearHospital || "",
// // //       nearAirport: initialData?.nearAirport || "",
// // //       nearSupermarket: initialData?.nearSupermarket || "",
// // //       nearSchool: initialData?.nearSchool || "",
// // //       nearGym: initialData?.nearGym || "",
// // //       nearTransport: initialData?.nearTransport || "",
// // //       nearAtm: initialData?.nearAtm || "",
// // //       nearRestaurant: initialData?.nearRestaurant || "",
// // //     },
// // //   });

// // //   const negotiable = watch("negotiable");
// // //   const locationValue = watch("location");
// // //   const categoryValue = watch("category");
// // //   const statusValue = watch("status");
// // //   const faceValue = watch("face");
// // //   const roadTypeValue = watch("roadType");
// // //   const latValue = watch("latitude");
// // //   const lngValue = watch("longitude");

// // //   const { data: fetchedImages = [], isLoading: loadingExisting } =
// // //     usePropertyImages(propertyId);

// // //   useEffect(() => {
// // //     if (fetchedImages.length) setExistingImages(fetchedImages);
// // //     else if (!propertyId && initialExistingImages?.length)
// // //       setExistingImages(initialExistingImages);
// // //   }, [fetchedImages, propertyId, initialExistingImages]);

// // //   // ── Navigation ──────────────────────────────────────────────────────
// // //   async function goNext() {
// // //     const valid = await trigger(STEP_FIELDS[step]);
// // //     if (!valid) return;
// // //     setCompletedSteps((prev) => new Set(prev).add(step));
// // //     setDirection("forward");
// // //     setAnimating(true);
// // //     setTimeout(() => {
// // //       setStep((s) => s + 1);
// // //       setAnimating(false);
// // //     }, 180);
// // //   }

// // //   function goBack() {
// // //     setDirection("back");
// // //     setAnimating(true);
// // //     setTimeout(() => {
// // //       setStep((s) => s - 1);
// // //       setAnimating(false);
// // //     }, 180);
// // //   }

// // //   function jumpTo(target: number) {
// // //     const canJump =
// // //       target < step ||
// // //       completedSteps.has(target) ||
// // //       completedSteps.has(target - 1);
// // //     if (!canJump) return;
// // //     setDirection(target > step ? "forward" : "back");
// // //     setAnimating(true);
// // //     setTimeout(() => {
// // //       setStep(target);
// // //       setAnimating(false);
// // //     }, 180);
// // //   }

// // //   // ── Image handling ──────────────────────────────────────────────────
// // //   function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
// // //     const files = e.target.files;
// // //     if (!files || files.length === 0) return;
// // //     setImages((prev) => [
// // //       ...prev,
// // //       ...Array.from(files).map((file) => ({
// // //         file,
// // //         url: URL.createObjectURL(file),
// // //       })),
// // //     ]);
// // //     e.target.value = "";
// // //   }

// // //   function removeNewImage(index: number) {
// // //     URL.revokeObjectURL(images[index].url);
// // //     setImages((prev) => prev.filter((_, i) => i !== index));
// // //   }

// // //   function removeExistingImage(imageId: string) {
// // //     setDeletedFileIds((prev) => [...prev, imageId]);
// // //     setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
// // //   }

// // //   async function uploadImages(): Promise<string[]> {
// // //     if (!images.length) return [];
// // //     setUploading(true);
// // //     const fileIds: string[] = [];

// // //     for (let i = 0; i < images.length; i++) {
// // //       const img = images[i];
// // //       if (img.fileId) {
// // //         fileIds.push(img.fileId);
// // //         continue;
// // //       }

// // //       const fd = new FormData();
// // //       fd.append("file", img.file);
// // //       fd.append("isPrivate", "true");
// // //       setImages((prev) =>
// // //         prev.map((p, idx) => (idx === i ? { ...p, uploadProgress: 10 } : p)),
// // //       );

// // //       let fakeProgress = 10;
// // //       const interval = setInterval(() => {
// // //         fakeProgress = Math.min(
// // //           fakeProgress + Math.floor(Math.random() * 15 + 5),
// // //           85,
// // //         );
// // //         const captured = fakeProgress;
// // //         setImages((prev) =>
// // //           prev.map((p, idx) =>
// // //             idx === i &&
// // //             typeof p.uploadProgress === "number" &&
// // //             p.uploadProgress < 100 &&
// // //             p.uploadProgress !== -1
// // //               ? { ...p, uploadProgress: captured }
// // //               : p,
// // //           ),
// // //         );
// // //       }, 300);

// // //       try {
// // //         const res = await fetch("/api/files/upload", {
// // //           method: "POST",
// // //           body: fd,
// // //         });
// // //         clearInterval(interval);
// // //         if (!res.ok) throw new Error(`Upload failed for ${img.file.name}`);
// // //         const data = await res.json();
// // //         setImages((prev) =>
// // //           prev.map((p, idx) =>
// // //             idx === i
// // //               ? { ...p, uploadProgress: 100, fileId: data.file._id }
// // //               : p,
// // //           ),
// // //         );
// // //         fileIds.push(data.file._id);
// // //       } catch (error) {
// // //         clearInterval(interval);
// // //         setImages((prev) =>
// // //           prev.map((p, idx) => (idx === i ? { ...p, uploadProgress: -1 } : p)),
// // //         );
// // //         setUploading(false);
// // //         throw error;
// // //       }
// // //     }

// // //     setUploading(false);
// // //     return fileIds;
// // //   }

// // //   async function onFormSubmit(values: PropertyFormValues) {
// // //     try {
// // //       const newFileIds = await uploadImages();
// // //       // boundaryPoints is passed alongside form values — API will save it to DB
// // //       onSubmit({
// // //         ...values,
// // //         fileIds: newFileIds,
// // //         deletedFileIds,
// // //         boundaryPoints,
// // //       });
// // //     } catch (error) {
// // //       console.error(error);
// // //     }
// // //   }

// // //   const currentStep = STEPS[step];

// // //   return (
// // //     <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
// // //       <input
// // //         ref={fileInputRef}
// // //         type="file"
// // //         multiple
// // //         accept="image/*"
// // //         onChange={handleImageChange}
// // //         className="hidden"
// // //         disabled={uploading}
// // //       />

// // //       {/* ── STEP INDICATOR ── */}
// // //       <div className="relative">
// // //         <div className="absolute top-5 left-8 right-8 h-px bg-border hidden sm:block" />
// // //         <div
// // //           className="absolute top-5 left-8 h-px bg-primary transition-all duration-500 hidden sm:block"
// // //           style={{
// // //             width: `calc((${step} / ${STEPS.length - 1}) * (100% - 4rem))`,
// // //           }}
// // //         />
// // //         <div className="relative flex justify-between items-start px-2">
// // //           {STEPS.map((s) => {
// // //             const Icon = s.icon;
// // //             const isCompleted = completedSteps.has(s.id);
// // //             const isCurrent = step === s.id;
// // //             const isReachable =
// // //               s.id < step ||
// // //               completedSteps.has(s.id) ||
// // //               completedSteps.has(s.id - 1);
// // //             return (
// // //               <button
// // //                 key={s.id}
// // //                 type="button"
// // //                 onClick={() => jumpTo(s.id)}
// // //                 disabled={!isReachable && !isCurrent}
// // //                 className="flex flex-col items-center gap-2 disabled:cursor-not-allowed"
// // //               >
// // //                 <div
// // //                   className={cn(
// // //                     "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 bg-background",
// // //                     isCurrent &&
// // //                       `${s.border} ${s.accent} text-white scale-110 shadow-lg`,
// // //                     isCompleted &&
// // //                       !isCurrent &&
// // //                       "border-primary bg-primary text-white",
// // //                     !isCurrent &&
// // //                       !isCompleted &&
// // //                       "border-border text-muted-foreground",
// // //                   )}
// // //                 >
// // //                   {isCompleted && !isCurrent ? (
// // //                     <Check size={16} />
// // //                   ) : (
// // //                     <Icon size={16} />
// // //                   )}
// // //                 </div>
// // //                 <span
// // //                   className={cn(
// // //                     "text-[10px] font-black uppercase tracking-wider transition-colors hidden sm:block",
// // //                     isCurrent ? "text-foreground" : "text-muted-foreground",
// // //                   )}
// // //                 >
// // //                   {s.short}
// // //                 </span>
// // //               </button>
// // //             );
// // //           })}
// // //         </div>
// // //       </div>

// // //       {/* ── STEP CARD ── */}
// // //       <div className="rounded-2xl border border-border/60 bg-muted/20 overflow-hidden">
// // //         <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50 bg-muted/30">
// // //           <div className={cn("w-1 h-6 rounded-full", currentStep.accent)} />
// // //           <div>
// // //             <h3 className="text-sm font-black uppercase tracking-widest">
// // //               {currentStep.label}
// // //             </h3>
// // //             <p className="text-[11px] text-muted-foreground mt-0.5">
// // //               Step {step + 1} of {STEPS.length}
// // //             </p>
// // //           </div>
// // //           {/* Show boundary count badge when on map step or if boundary already set */}
// // //           {(step === 3 || boundaryPoints.length > 0) &&
// // //             boundaryPoints.length >= 3 && (
// // //               <div className="ml-auto flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-700 dark:text-cyan-400 text-[10px] font-bold px-2.5 py-1 rounded-full">
// // //                 <Pentagon size={10} /> {boundaryPoints.length} pts
// // //               </div>
// // //             )}
// // //         </div>

// // //         <div
// // //           className={cn(
// // //             "p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-200 ease-out",
// // //             animating && direction === "forward" && "opacity-0 translate-x-3",
// // //             animating && direction === "back" && "opacity-0 -translate-x-3",
// // //             !animating && "opacity-100 translate-x-0",
// // //           )}
// // //         >
// // //           {/* ── STEP 0: Basic Info ── */}
// // //           {step === 0 && (
// // //             <>
// // //               <Field
// // //                 label="Property Title"
// // //                 error={errors.title?.message}
// // //                 className="sm:col-span-2"
// // //               >
// // //                 <Input
// // //                   placeholder="e.g. Modern Villa at Baneshwor"
// // //                   className="h-10 rounded-xl text-sm"
// // //                   {...register("title")}
// // //                 />
// // //               </Field>
// // //               <Field label="Price (NPR)" error={errors.price?.message}>
// // //                 <Input
// // //                   type="number"
// // //                   placeholder="e.g. 12500000"
// // //                   className="h-10 rounded-xl text-sm"
// // //                   {...register("price", { valueAsNumber: true })}
// // //                 />
// // //               </Field>
// // //               <Field label="Location" error={errors.location?.message}>
// // //                 <Select
// // //                   onValueChange={(v) => setValue("location", v)}
// // //                   value={locationValue}
// // //                 >
// // //                   <SelectTrigger className="h-10 rounded-xl text-sm w-full">
// // //                     <SelectValue placeholder="Select location" />
// // //                   </SelectTrigger>
// // //                   <SelectContent>
// // //                     {["Kathmandu", "Lalitpur", "Bhaktapur"].map((l) => (
// // //                       <SelectItem key={l} value={l}>
// // //                         {l}
// // //                       </SelectItem>
// // //                     ))}
// // //                   </SelectContent>
// // //                 </Select>
// // //               </Field>
// // //               <Field label="Property Type" error={errors.category?.message}>
// // //                 <Select
// // //                   onValueChange={(v) => setValue("category", v)}
// // //                   value={categoryValue}
// // //                 >
// // //                   <SelectTrigger className="h-10 rounded-xl text-sm w-full">
// // //                     <SelectValue placeholder="Select type" />
// // //                   </SelectTrigger>
// // //                   <SelectContent>
// // //                     {["House", "Apartment", "Land", "Colony"].map((t) => (
// // //                       <SelectItem key={t} value={t}>
// // //                         {t}
// // //                       </SelectItem>
// // //                     ))}
// // //                   </SelectContent>
// // //                 </Select>
// // //               </Field>
// // //               <Field label="Status" error={errors.status?.message}>
// // //                 <Select
// // //                   onValueChange={(v) => setValue("status", v as PropertyStatus)}
// // //                   value={statusValue}
// // //                 >
// // //                   <SelectTrigger className="h-10 rounded-xl text-sm w-full">
// // //                     <SelectValue placeholder="Select status" />
// // //                   </SelectTrigger>
// // //                   <SelectContent>
// // //                     <SelectItem value="available">Available</SelectItem>
// // //                   </SelectContent>
// // //                 </Select>
// // //               </Field>
// // //               <Field label="Description" className="sm:col-span-2">
// // //                 <Textarea
// // //                   placeholder="Describe the property..."
// // //                   rows={3}
// // //                   className="rounded-xl text-sm resize-none"
// // //                   {...register("description")}
// // //                 />
// // //               </Field>
// // //             </>
// // //           )}

// // //           {/* ── STEP 1: Property Details ── */}
// // //           {step === 1 && (
// // //             <>
// // //               <Field label="Area (e.g. 5 Aana)" error={errors.area?.message}>
// // //                 <Input
// // //                   placeholder="e.g. 5 Aana"
// // //                   className="h-10 rounded-xl text-sm"
// // //                   {...register("area")}
// // //                 />
// // //               </Field>
// // //               <Field label="Property Face" error={errors.face?.message}>
// // //                 <Select
// // //                   onValueChange={(v) => setValue("face", v)}
// // //                   value={faceValue}
// // //                 >
// // //                   <SelectTrigger className="h-10 rounded-xl text-sm w-full">
// // //                     <SelectValue placeholder="Select facing" />
// // //                   </SelectTrigger>
// // //                   <SelectContent>
// // //                     {[
// // //                       "North",
// // //                       "South",
// // //                       "East",
// // //                       "West",
// // //                       "North-East",
// // //                       "North-West",
// // //                       "South-East",
// // //                       "South-West",
// // //                     ].map((f) => (
// // //                       <SelectItem key={f} value={f}>
// // //                         {f}
// // //                       </SelectItem>
// // //                     ))}
// // //                   </SelectContent>
// // //                 </Select>
// // //               </Field>
// // //               <Field label="Road Type" error={errors.roadType?.message}>
// // //                 <Select
// // //                   onValueChange={(v) => setValue("roadType", v)}
// // //                   value={roadTypeValue}
// // //                 >
// // //                   <SelectTrigger className="h-10 rounded-xl text-sm w-full">
// // //                     <SelectValue placeholder="Select road type" />
// // //                   </SelectTrigger>
// // //                   <SelectContent>
// // //                     {["Blacktopped", "Graveled", "Dirt", "Goreto"].map((r) => (
// // //                       <SelectItem key={r} value={r}>
// // //                         {r}
// // //                       </SelectItem>
// // //                     ))}
// // //                   </SelectContent>
// // //                 </Select>
// // //               </Field>
// // //               <Field label="Road Access">
// // //                 <Input
// // //                   placeholder="e.g. 13 Feet"
// // //                   className="h-10 rounded-xl text-sm"
// // //                   {...register("roadAccess")}
// // //                 />
// // //               </Field>
// // //               <div className="sm:col-span-2 flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/30">
// // //                 <div>
// // //                   <p className="text-xs font-black uppercase tracking-widest">
// // //                     Negotiable
// // //                   </p>
// // //                   <p className="text-[11px] text-muted-foreground mt-0.5">
// // //                     Is the price open to negotiation?
// // //                   </p>
// // //                 </div>
// // //                 <Switch
// // //                   checked={negotiable}
// // //                   onCheckedChange={(v) => setValue("negotiable", v)}
// // //                 />
// // //               </div>
// // //             </>
// // //           )}

// // //           {/* ── STEP 2: Location Details ── */}
// // //           {step === 2 && (
// // //             <>
// // //               <Field label="Municipality">
// // //                 <Input
// // //                   placeholder="e.g. Suryabinayak"
// // //                   className="h-10 rounded-xl text-sm"
// // //                   {...register("municipality")}
// // //                 />
// // //               </Field>
// // //               <Field label="Ward No.">
// // //                 <Input
// // //                   placeholder="e.g. 05"
// // //                   className="h-10 rounded-xl text-sm"
// // //                   {...register("wardNo")}
// // //                 />
// // //               </Field>
// // //               <Field label="Distance from Ring Road" className="sm:col-span-2">
// // //                 <Input
// // //                   placeholder="e.g. 4km"
// // //                   className="h-10 rounded-xl text-sm"
// // //                   {...register("ringRoad")}
// // //                 />
// // //               </Field>
// // //             </>
// // //           )}

// // //           {/* ── STEP 3: Leaflet Map Pin + Boundary ── */}
// // //           {step === 3 && (
// // //             <LeafletMapPicker
// // //               lat={latValue && latValue !== 0 ? latValue : undefined}
// // //               lng={lngValue && lngValue !== 0 ? lngValue : undefined}
// // //               boundaryPoints={boundaryPoints}
// // //               onChange={(lat, lng) => {
// // //                 setValue("latitude", lat, { shouldDirty: true });
// // //                 setValue("longitude", lng, { shouldDirty: true });
// // //               }}
// // //               onClear={() => {
// // //                 setValue("latitude", undefined, { shouldDirty: true });
// // //                 setValue("longitude", undefined, { shouldDirty: true });
// // //               }}
// // //               onBoundaryChange={setBoundaryPoints}
// // //             />
// // //           )}

// // //           {/* ── STEP 4: Nearby Facilities ── */}
// // //           {step === 4 &&
// // //             [
// // //               { field: "nearHospital" as const, label: "Hospital" },
// // //               { field: "nearAirport" as const, label: "Airport" },
// // //               { field: "nearSupermarket" as const, label: "Supermarket" },
// // //               { field: "nearSchool" as const, label: "School" },
// // //               { field: "nearGym" as const, label: "Gym" },
// // //               { field: "nearTransport" as const, label: "Public Transport" },
// // //               { field: "nearAtm" as const, label: "ATM" },
// // //               { field: "nearRestaurant" as const, label: "Restaurant" },
// // //             ].map(({ field, label }) => (
// // //               <Field key={field} label={label}>
// // //                 <Input
// // //                   placeholder="e.g. 500m or 2km"
// // //                   className="h-10 rounded-xl text-sm"
// // //                   {...register(field)}
// // //                 />
// // //               </Field>
// // //             ))}

// // //           {/* ── STEP 5: Images ── */}
// // //           {step === 5 && (
// // //             <div className="sm:col-span-2">
// // //               {loadingExisting ? (
// // //                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
// // //                   {[1, 2, 3].map((i) => (
// // //                     <div
// // //                       key={i}
// // //                       className="h-32 bg-muted animate-pulse rounded-xl"
// // //                     />
// // //                   ))}
// // //                 </div>
// // //               ) : (
// // //                 <>
// // //                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
// // //                     {existingImages.map((img) => (
// // //                       <div
// // //                         key={img.id}
// // //                         className="relative group rounded-xl overflow-hidden border border-border/50"
// // //                       >
// // //                         <img
// // //                           src={img.url}
// // //                           alt={img.filename}
// // //                           className="h-32 w-full object-cover"
// // //                         />
// // //                         <div className="absolute top-2 left-2 bg-blue-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
// // //                           Saved
// // //                         </div>
// // //                         <button
// // //                           type="button"
// // //                           onClick={() => removeExistingImage(img.id)}
// // //                           disabled={uploading}
// // //                           className="absolute top-2 right-2 h-6 w-6 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
// // //                         >
// // //                           <X size={12} />
// // //                         </button>
// // //                       </div>
// // //                     ))}
// // //                     {images.map((img, i) => (
// // //                       <div
// // //                         key={i}
// // //                         className="relative group rounded-xl overflow-hidden border border-border/50"
// // //                       >
// // //                         <img
// // //                           src={img.url}
// // //                           alt="preview"
// // //                           className="h-32 w-full object-cover"
// // //                         />
// // //                         {typeof img.uploadProgress === "number" &&
// // //                           img.uploadProgress > 0 &&
// // //                           img.uploadProgress < 100 && (
// // //                             <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 px-3">
// // //                               <div className="w-full bg-white/20 rounded-full h-1.5">
// // //                                 <div
// // //                                   className="bg-white h-1.5 rounded-full transition-all"
// // //                                   style={{ width: `${img.uploadProgress}%` }}
// // //                                 />
// // //                               </div>
// // //                               <span className="text-white text-[10px] font-bold">
// // //                                 {img.uploadProgress}%
// // //                               </span>
// // //                             </div>
// // //                           )}
// // //                         {img.uploadProgress === -1 && (
// // //                           <div className="absolute inset-0 bg-destructive/80 flex items-center justify-center rounded-xl">
// // //                             <span className="text-white text-[10px] font-bold">
// // //                               Upload Failed
// // //                             </span>
// // //                           </div>
// // //                         )}
// // //                         {img.uploadProgress === 100 && (
// // //                           <div className="absolute top-2 left-2">
// // //                             <CheckCircle2
// // //                               size={18}
// // //                               className="text-green-400 drop-shadow"
// // //                             />
// // //                           </div>
// // //                         )}
// // //                         <button
// // //                           type="button"
// // //                           onClick={() => removeNewImage(i)}
// // //                           disabled={uploading}
// // //                           className="absolute top-2 right-2 h-6 w-6 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
// // //                         >
// // //                           <X size={12} />
// // //                         </button>
// // //                       </div>
// // //                     ))}
// // //                     <button
// // //                       type="button"
// // //                       onClick={() => fileInputRef.current?.click()}
// // //                       disabled={uploading}
// // //                       className="h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-40"
// // //                     >
// // //                       <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
// // //                         <Plus size={16} className="text-muted-foreground" />
// // //                       </div>
// // //                       <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
// // //                         Add Image
// // //                       </span>
// // //                     </button>
// // //                   </div>
// // //                   {(existingImages.length > 0 || images.length > 0) && (
// // //                     <p className="text-[11px] text-muted-foreground mt-3 font-semibold">
// // //                       {existingImages.length} saved &bull; {images.length} new
// // //                       {deletedFileIds.length > 0 &&
// // //                         ` • ${deletedFileIds.length} queued for deletion`}
// // //                     </p>
// // //                   )}
// // //                 </>
// // //               )}
// // //             </div>
// // //           )}
// // //         </div>
// // //       </div>

// // //       {/* ── NAVIGATION ── */}
// // //       <div className="flex items-center gap-3">
// // //         {step > 0 && (
// // //           <Button
// // //             type="button"
// // //             variant="outline"
// // //             onClick={goBack}
// // //             disabled={animating}
// // //             className="h-11 px-5 rounded-xl font-bold text-[11px] uppercase tracking-widest"
// // //           >
// // //             <ChevronLeft size={15} className="mr-1" /> Back
// // //           </Button>
// // //         )}
// // //         {step < STEPS.length - 1 ? (
// // //           <Button
// // //             type="button"
// // //             onClick={goNext}
// // //             disabled={animating}
// // //             className="flex-1 h-11 rounded-xl font-black text-[11px] uppercase tracking-widest"
// // //           >
// // //             {step === 3 && !latValue ? "Skip" : "Next"}{" "}
// // //             <ChevronRight size={15} className="ml-1" />
// // //           </Button>
// // //         ) : (
// // //           <Button
// // //             type="submit"
// // //             size="lg"
// // //             disabled={isSubmitting || uploading || animating}
// // //             className="flex-1 h-11 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg"
// // //           >
// // //             {uploading
// // //               ? "Uploading images..."
// // //               : isSubmitting
// // //                 ? "Saving..."
// // //                 : buttonText}
// // //           </Button>
// // //         )}
// // //       </div>
// // //     </form>
// // //   );
// // // }

// // "use client";

// // import { useState, useRef, useEffect, useCallback } from "react";
// // import { useForm } from "react-hook-form";
// // import { zodResolver } from "@hookform/resolvers/zod";
// // import * as z from "zod";
// // import dynamic from "next/dynamic";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { Textarea } from "@/components/ui/textarea";
// // import { Label } from "@/components/ui/label";
// // import {
// //   Select,
// //   SelectContent,
// //   SelectItem,
// //   SelectTrigger,
// //   SelectValue,
// // } from "@/components/ui/select";
// // import { Switch } from "@/components/ui/switch";
// // import {
// //   X,
// //   Plus,
// //   CheckCircle2,
// //   ChevronLeft,
// //   ChevronRight,
// //   Info,
// //   Building2,
// //   MapPin,
// //   Utensils,
// //   ImageIcon,
// //   Check,
// //   LocateFixed,
// //   Map,
// //   Crosshair,
// //   Trash2,
// //   Pentagon,
// //   Search,
// //   Upload,
// //   AlertCircle,
// // } from "lucide-react";
// // import { usePropertyImages } from "@/lib/client/queries/properties.queries";
// // import { cn } from "@/lib/utils";

// // // ── Schema ────────────────────────────────────────────────────────────
// // const formSchema = z.object({
// //   title: z.string().min(3, "Title must be at least 3 characters"),
// //   price: z.number().positive("Price must be positive"),
// //   location: z.string().min(1, "Location is required"),
// //   description: z.string().max(5000).optional(),
// //   category: z.string().min(1, "Property type is required"),
// //   status: z.enum(["available", "booked", "sold"]),
// //   area: z.string().min(1, "Area is required"),
// //   face: z.string().min(1, "Property Face is required"),
// //   roadType: z.string().min(1, "Property Road type is required"),
// //   roadAccess: z.string().optional(),
// //   negotiable: z.boolean(),
// //   municipality: z.string().optional(),
// //   wardNo: z.string().optional(),
// //   ringRoad: z.string().optional(),
// //   latitude: z.number().optional(),
// //   longitude: z.number().optional(),
// //   nearHospital: z.string().optional(),
// //   nearAirport: z.string().optional(),
// //   nearSupermarket: z.string().optional(),
// //   nearSchool: z.string().optional(),
// //   nearGym: z.string().optional(),
// //   nearTransport: z.string().optional(),
// //   nearAtm: z.string().optional(),
// //   nearRestaurant: z.string().optional(),
// // });

// // export type PropertyStatus = z.infer<typeof formSchema>["status"];
// // export type PropertyFormValues = z.infer<typeof formSchema>;

// // type PreviewFile = {
// //   file: File;
// //   url: string;
// //   uploadProgress?: number;
// //   fileId?: string;
// // };
// // type ExistingImage = { id: string; url: string; filename: string };

// // interface PropertyFormProps {
// //   initialData?: Partial<PropertyFormValues>;
// //   initialBoundary?: [number, number][];
// //   existingImages?: ExistingImage[];
// //   propertyId?: string;
// //   onSubmit: (
// //     values: PropertyFormValues & {
// //       fileIds: string[];
// //       deletedFileIds: string[];
// //       boundaryPoints: [number, number][];
// //     },
// //   ) => void;
// //   isSubmitting?: boolean;
// //   buttonText?: string;
// // }

// // // ── Steps ─────────────────────────────────────────────────────────────
// // const STEPS = [
// //   {
// //     id: 0,
// //     label: "Basic Info",
// //     short: "Basic",
// //     icon: Info,
// //     accent: "bg-primary",
// //     border: "border-primary",
// //     ring: "ring-primary/20",
// //   },
// //   {
// //     id: 1,
// //     label: "Property",
// //     short: "Property",
// //     icon: Building2,
// //     accent: "bg-amber-500",
// //     border: "border-amber-500",
// //     ring: "ring-amber-500/20",
// //   },
// //   {
// //     id: 2,
// //     label: "Location",
// //     short: "Location",
// //     icon: MapPin,
// //     accent: "bg-blue-500",
// //     border: "border-blue-500",
// //     ring: "ring-blue-500/20",
// //   },
// //   {
// //     id: 3,
// //     label: "Map Pin",
// //     short: "Map",
// //     icon: Map,
// //     accent: "bg-rose-500",
// //     border: "border-rose-500",
// //     ring: "ring-rose-500/20",
// //   },
// //   {
// //     id: 4,
// //     label: "Facilities",
// //     short: "Nearby",
// //     icon: Utensils,
// //     accent: "bg-green-500",
// //     border: "border-green-500",
// //     ring: "ring-green-500/20",
// //   },
// //   {
// //     id: 5,
// //     label: "Images",
// //     short: "Images",
// //     icon: ImageIcon,
// //     accent: "bg-purple-500",
// //     border: "border-purple-500",
// //     ring: "ring-purple-500/20",
// //   },
// // ];

// // const STEP_FIELDS: Record<number, (keyof PropertyFormValues)[]> = {
// //   0: ["title", "price", "location", "category", "status"],
// //   1: ["area", "face", "roadType", "roadAccess", "negotiable"],
// //   2: ["municipality", "wardNo", "ringRoad"],
// //   3: [],
// //   4: [],
// //   5: [],
// // };

// // // ── Tile styles ───────────────────────────────────────────────────────
// // const TILE_STYLES = {
// //   standard: {
// //     label: "Map",
// //     url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
// //     attribution: "&copy; OpenStreetMap",
// //   },
// //   satellite: {
// //     label: "Satellite",
// //     url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
// //     attribution: "Esri",
// //   },
// // };
// // type TileKey = keyof typeof TILE_STYLES;

// // // ── Nominatim result ──────────────────────────────────────────────────
// // interface NominatimResult {
// //   place_id: number;
// //   display_name: string;
// //   lat: string;
// //   lon: string;
// // }

// // // ── Leaflet dynamic imports ───────────────────────────────────────────
// // const MapContainer = dynamic(
// //   () => import("react-leaflet").then((m) => m.MapContainer),
// //   { ssr: false },
// // );
// // const TileLayer = dynamic(
// //   () => import("react-leaflet").then((m) => m.TileLayer),
// //   { ssr: false },
// // );
// // const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), {
// //   ssr: false,
// // });
// // const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), {
// //   ssr: false,
// // });
// // const Polygon = dynamic(() => import("react-leaflet").then((m) => m.Polygon), {
// //   ssr: false,
// // });

// // // ── Field wrapper ─────────────────────────────────────────────────────
// // function Field({
// //   label,
// //   error,
// //   className,
// //   hint,
// //   children,
// // }: {
// //   label: string;
// //   error?: string;
// //   className?: string;
// //   hint?: string;
// //   children: React.ReactNode;
// // }) {
// //   return (
// //     <div className={cn("flex flex-col gap-1.5", className)}>
// //       <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
// //         {label}
// //       </Label>
// //       {children}
// //       {hint && !error && (
// //         <p className="text-[11px] text-muted-foreground/70">{hint}</p>
// //       )}
// //       {error && (
// //         <div className="flex items-center gap-1.5">
// //           <AlertCircle size={11} className="text-destructive shrink-0" />
// //           <p className="text-[11px] text-destructive font-semibold">{error}</p>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// // // ── Inner map components ──────────────────────────────────────────────
// // function MapClickHandler({
// //   onMapClick,
// //   useMapEventsHook,
// // }: {
// //   onMapClick: (lat: number, lng: number) => void;
// //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
// //   useMapEventsHook: any;
// // }) {
// //   useMapEventsHook({
// //     click(e: { latlng: { lat: number; lng: number } }) {
// //       onMapClick(e.latlng.lat, e.latlng.lng);
// //     },
// //   });
// //   return null;
// // }

// // function FlyTo({
// //   lat,
// //   lng,
// //   useMapHook,
// // }: {
// //   lat: number;
// //   lng: number;
// //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
// //   useMapHook: any;
// // }) {
// //   const map = useMapHook();
// //   useEffect(() => {
// //     map.flyTo([lat, lng], 17, { duration: 0.8 });
// //   }, [lat, lng]);
// //   return null;
// // }

// // // ── Location search box using Nominatim (OpenStreetMap free geocoder) ─
// // function LocationSearch({
// //   onSelect,
// // }: {
// //   onSelect: (lat: number, lng: number, label: string) => void;
// // }) {
// //   const [query, setQuery] = useState("");
// //   const [results, setResults] = useState<NominatimResult[]>([]);
// //   const [loading, setLoading] = useState(false);
// //   const [open, setOpen] = useState(false);
// //   const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
// //   const wrapRef = useRef<HTMLDivElement>(null);

// //   // Close dropdown when clicking outside
// //   useEffect(() => {
// //     const handler = (e: MouseEvent) => {
// //       if (wrapRef.current && !wrapRef.current.contains(e.target as Node))
// //         setOpen(false);
// //     };
// //     document.addEventListener("mousedown", handler);
// //     return () => document.removeEventListener("mousedown", handler);
// //   }, []);

// //   const search = useCallback(async (q: string) => {
// //     if (q.trim().length < 3) {
// //       setResults([]);
// //       setOpen(false);
// //       return;
// //     }
// //     setLoading(true);
// //     try {
// //       const res = await fetch(
// //         `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&countrycodes=np`,
// //         { headers: { "Accept-Language": "en" } },
// //       );
// //       const data: NominatimResult[] = await res.json();
// //       setResults(data);
// //       setOpen(data.length > 0);
// //     } catch {
// //       /* ignore */
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, []);

// //   const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     const v = e.target.value;
// //     setQuery(v);
// //     if (timerRef.current) clearTimeout(timerRef.current);
// //     timerRef.current = setTimeout(() => search(v), 400);
// //   };

// //   return (
// //     <div ref={wrapRef} className="relative">
// //       <div className="relative">
// //         <Search
// //           size={13}
// //           className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
// //         />
// //         <input
// //           type="text"
// //           value={query}
// //           onChange={handleInput}
// //           onFocus={() => results.length > 0 && setOpen(true)}
// //           placeholder="Search location, e.g. Thamel Kathmandu…"
// //           className={cn(
// //             "w-full h-10 pl-8 pr-10 rounded-xl border border-border/60 bg-background",
// //             "text-sm text-foreground placeholder:text-muted-foreground/50",
// //             "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all",
// //           )}
// //         />
// //         {loading && (
// //           <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
// //         )}
// //       </div>

// //       {open && results.length > 0 && (
// //         <div className="absolute top-full left-0 right-0 mt-1.5 z-[2000] bg-card border border-border/60 rounded-xl shadow-2xl overflow-hidden">
// //           {results.map((r) => (
// //             <button
// //               key={r.place_id}
// //               type="button"
// //               onClick={() => {
// //                 onSelect(parseFloat(r.lat), parseFloat(r.lon), r.display_name);
// //                 setQuery(r.display_name.split(",").slice(0, 2).join(", "));
// //                 setOpen(false);
// //               }}
// //               className="w-full flex items-start gap-2.5 px-3 py-2.5 hover:bg-muted/60 transition-colors text-left border-b border-border/30 last:border-0"
// //             >
// //               <MapPin size={12} className="text-primary shrink-0 mt-0.5" />
// //               <span className="text-[12px] text-foreground line-clamp-2 leading-snug">
// //                 {r.display_name}
// //               </span>
// //             </button>
// //           ))}
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// // // ── LeafletMapPicker ──────────────────────────────────────────────────
// // interface LeafletMapPickerProps {
// //   lat?: number;
// //   lng?: number;
// //   boundaryPoints: [number, number][];
// //   onChange: (lat: number, lng: number) => void;
// //   onClear: () => void;
// //   onBoundaryChange: (points: [number, number][]) => void;
// // }

// // function LeafletMapPicker({
// //   lat,
// //   lng,
// //   boundaryPoints,
// //   onChange,
// //   onClear,
// //   onBoundaryChange,
// // }: LeafletMapPickerProps) {
// //   const [leafletReady, setLeafletReady] = useState(false);
// //   const [leafletLib, setLeafletLib] = useState<{
// //     useMapEvents: (typeof import("react-leaflet"))["useMapEvents"];
// //     useMap: (typeof import("react-leaflet"))["useMap"];
// //     divIcon: (typeof import("leaflet"))["divIcon"];
// //   } | null>(null);

// //   const [geoStatus, setGeoStatus] = useState<
// //     "idle" | "asking" | "granted" | "denied"
// //   >("idle");
// //   const [geoError, setGeoError] = useState("");
// //   const [tileKey, setTileKey] = useState<TileKey>("standard");
// //   const [drawMode, setDrawMode] = useState(false);
// //   // flyTo trigger — set a new value to trigger a fly animation
// //   const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);

// //   const centreLat = lat ?? 27.7172;
// //   const centreLng = lng ?? 85.324;

// //   useEffect(() => {
// //     Promise.all([import("leaflet"), import("react-leaflet")]).then(
// //       ([L, RL]) => {
// //         // @ts-expect-error — internal property
// //         delete L.Icon.Default.prototype._getIconUrl;
// //         L.Icon.Default.mergeOptions({
// //           iconRetinaUrl:
// //             "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
// //           iconUrl:
// //             "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
// //           shadowUrl:
// //             "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
// //         });
// //         setLeafletLib({
// //           useMapEvents: RL.useMapEvents,
// //           useMap: RL.useMap,
// //           divIcon: L.divIcon,
// //         });
// //         setLeafletReady(true);
// //       },
// //     );
// //   }, []);

// //   useEffect(() => {
// //     if (!navigator.geolocation) {
// //       setGeoStatus("denied");
// //       return;
// //     }
// //     setGeoStatus("asking");
// //     navigator.geolocation.getCurrentPosition(
// //       (pos) => {
// //         setGeoStatus("granted");
// //         if (!lat && !lng) {
// //           onChange(pos.coords.latitude, pos.coords.longitude);
// //           setFlyTarget([pos.coords.latitude, pos.coords.longitude]);
// //         }
// //       },
// //       (err) => {
// //         setGeoStatus("denied");
// //         setGeoError(
// //           err.code === 1
// //             ? "Location permission denied. Search a location or click the map."
// //             : "Could not get location. Search or click the map to set the pin.",
// //         );
// //       },
// //       { enableHighAccuracy: true, timeout: 8000 },
// //     );
// //   }, []);

// //   const handleMapClick = useCallback(
// //     (clickLat: number, clickLng: number) => {
// //       if (drawMode) {
// //         // Allow any number of points — no minimum restriction
// //         onBoundaryChange([...boundaryPoints, [clickLat, clickLng]]);
// //       } else {
// //         onChange(clickLat, clickLng);
// //         setFlyTarget([clickLat, clickLng]);
// //       }
// //     },
// //     [drawMode, boundaryPoints, onChange, onBoundaryChange],
// //   );

// //   const handleLocationSelect = (selLat: number, selLng: number) => {
// //     onChange(selLat, selLng);
// //     setFlyTarget([selLat, selLng]);
// //   };

// //   const goToCurrentLocation = () => {
// //     if (!navigator.geolocation) return;
// //     setGeoStatus("asking");
// //     navigator.geolocation.getCurrentPosition(
// //       (pos) => {
// //         setGeoStatus("granted");
// //         onChange(pos.coords.latitude, pos.coords.longitude);
// //         setFlyTarget([pos.coords.latitude, pos.coords.longitude]);
// //         setGeoError("");
// //       },
// //       () => {
// //         setGeoStatus("denied");
// //         setGeoError("Could not get location.");
// //       },
// //       { enableHighAccuracy: true, timeout: 8000 },
// //     );
// //   };

// //   const removeBoundaryPoint = (idx: number) => {
// //     onBoundaryChange(boundaryPoints.filter((_, i) => i !== idx));
// //   };

// //   // Custom teardrop pin icon
// //   const pinIcon = leafletLib?.divIcon({
// //     html: `<div style="
// //       width:28px;height:28px;border-radius:50% 50% 50% 0;
// //       background:#ef4444;border:3px solid white;
// //       transform:rotate(-45deg);box-shadow:0 2px 10px rgba(0,0,0,0.3);
// //     "></div>`,
// //     className: "",
// //     iconSize: [28, 28],
// //     iconAnchor: [14, 28],
// //     popupAnchor: [0, -32],
// //   });

// //   // Boundary dot icon — red to match theme
// //   const boundaryIcon = leafletLib?.divIcon({
// //     html: `<div style="width:10px;height:10px;border-radius:50%;background:#ef4444;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
// //     className: "",
// //     iconSize: [10, 10],
// //     iconAnchor: [5, 5],
// //   });

// //   const hasBoundary = boundaryPoints.length >= 3;
// //   const pointsNeeded = Math.max(0, 3 - boundaryPoints.length);

// //   return (
// //     <div className="sm:col-span-2 flex flex-col gap-3">
// //       {/* Location search */}
// //       <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-2">
// //         <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
// //           Search location
// //         </p>
// //         <LocationSearch onSelect={handleLocationSelect} />
// //         <p className="text-[10px] text-muted-foreground/60">
// //           Type a place name — results from OpenStreetMap. Or click directly on
// //           the map below.
// //         </p>
// //       </div>

// //       {/* Geo banners */}
// //       {geoStatus === "asking" && (
// //         <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/20">
// //           <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
// //           <span className="text-[12px] font-semibold text-primary">
// //             Requesting your location…
// //           </span>
// //         </div>
// //       )}
// //       {geoStatus === "denied" && geoError && (
// //         <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
// //           <MapPin size={13} className="text-amber-500 shrink-0" />
// //           <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
// //             {geoError}
// //           </span>
// //         </div>
// //       )}
// //       {geoStatus === "granted" && !lat && (
// //         <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-green-500/5 border border-green-500/20">
// //           <LocateFixed size={13} className="text-green-500 shrink-0" />
// //           <span className="text-[11px] font-semibold text-green-700 dark:text-green-400">
// //             Location found — click the map to pin the property
// //           </span>
// //         </div>
// //       )}

// //       {/* Toolbar */}
// //       <div className="flex items-center gap-2 flex-wrap">
// //         {/* Tile switcher */}
// //         <div className="flex items-center gap-0.5 bg-muted/60 border border-border/50 rounded-xl p-1">
// //           {(Object.keys(TILE_STYLES) as TileKey[]).map((k) => (
// //             <button
// //               key={k}
// //               type="button"
// //               onClick={() => setTileKey(k)}
// //               className={cn(
// //                 "px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all",
// //                 tileKey === k
// //                   ? "bg-background text-foreground shadow-sm border border-border/40"
// //                   : "text-muted-foreground hover:text-foreground",
// //               )}
// //             >
// //               {TILE_STYLES[k].label}
// //             </button>
// //           ))}
// //         </div>

// //         {/* GPS button */}
// //         <button
// //           type="button"
// //           onClick={goToCurrentLocation}
// //           disabled={geoStatus === "asking"}
// //           className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/50 bg-background hover:bg-muted/60 text-[11px] font-bold transition-colors disabled:opacity-50 shadow-sm"
// //         >
// //           <LocateFixed size={12} className="text-primary" />
// //           {geoStatus === "asking" ? "Locating…" : "My location"}
// //         </button>

// //         {/* Boundary draw toggle */}
// //         <button
// //           type="button"
// //           onClick={() => setDrawMode((v) => !v)}
// //           className={cn(
// //             "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all",
// //             drawMode
// //               ? "bg-rose-500 text-white border-rose-500 shadow-sm"
// //               : "border-border/50 bg-background hover:bg-muted/60 text-muted-foreground shadow-sm",
// //           )}
// //         >
// //           <Pentagon size={12} />
// //           {drawMode ? "Drawing…" : "Draw boundary"}
// //         </button>

// //         {boundaryPoints.length > 0 && (
// //           <button
// //             type="button"
// //             onClick={() => onBoundaryChange([])}
// //             className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 text-[11px] font-bold text-destructive transition-colors"
// //           >
// //             <Trash2 size={11} /> Clear boundary
// //           </button>
// //         )}

// //         {lat && lng && (
// //           <button
// //             type="button"
// //             onClick={onClear}
// //             className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 text-[11px] font-bold text-destructive transition-colors"
// //           >
// //             <X size={11} /> Clear pin
// //           </button>
// //         )}
// //       </div>

// //       {/* Map container */}
// //       <div className="relative rounded-2xl overflow-hidden border border-border/60 shadow-sm">
// //         {/* Pin status badge */}
// //         <div className="absolute top-3 right-3 z-[1000]">
// //           {lat && lng ? (
// //             <div className="flex items-center gap-1.5 bg-green-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg">
// //               <Check size={10} /> Pin set
// //             </div>
// //           ) : (
// //             <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white/80 text-[10px] font-bold px-3 py-1.5 rounded-full">
// //               <Crosshair size={10} />{" "}
// //               {drawMode ? "Click to draw" : "Click to pin"}
// //             </div>
// //           )}
// //         </div>

// //         {/* Draw mode hint */}
// //         {drawMode && (
// //           <div className="absolute bottom-[72px] left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 bg-rose-500 text-white text-[11px] font-bold px-4 py-2 rounded-full shadow-lg whitespace-nowrap">
// //             <Pentagon size={12} />
// //             {boundaryPoints.length === 0
// //               ? "Click to start drawing boundary"
// //               : `${boundaryPoints.length} point${boundaryPoints.length !== 1 ? "s" : ""} — keep clicking to add more`}
// //           </div>
// //         )}

// //         <link
// //           rel="stylesheet"
// //           href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
// //         />

// //         <div style={{ height: "380px" }}>
// //           {leafletReady && leafletLib ? (
// //             <MapContainer
// //               center={[centreLat, centreLng]}
// //               zoom={lat ? 17 : 13}
// //               className="h-full w-full"
// //               zoomControl
// //               style={{ cursor: drawMode ? "crosshair" : "default" }}
// //             >
// //               <TileLayer
// //                 key={tileKey}
// //                 url={TILE_STYLES[tileKey].url}
// //                 attribution={TILE_STYLES[tileKey].attribution}
// //               />

// //               <MapClickHandler
// //                 onMapClick={handleMapClick}
// //                 useMapEventsHook={leafletLib.useMapEvents}
// //               />

// //               {/* Fly to whenever flyTarget changes */}
// //               {flyTarget && (
// //                 <FlyTo
// //                   lat={flyTarget[0]}
// //                   lng={flyTarget[1]}
// //                   useMapHook={leafletLib.useMap}
// //                 />
// //               )}

// //               {/* Property pin */}
// //               {lat && lng && pinIcon && (
// //                 <Marker
// //                   position={[lat, lng]}
// //                   icon={pinIcon}
// //                   draggable
// //                   // @ts-expect-error
// //                   eventHandlers={{
// //                     dragend(e: {
// //                       target: { getLatLng: () => { lat: number; lng: number } };
// //                     }) {
// //                       const p = e.target.getLatLng();
// //                       onChange(p.lat, p.lng);
// //                     },
// //                   }}
// //                 >
// //                   <Popup>
// //                     <div className="p-1.5 min-w-[140px]">
// //                       <p className="text-xs font-bold mb-1">Property pin</p>
// //                       <p className="text-[10px] text-muted-foreground font-mono">
// //                         {lat.toFixed(6)}, {lng.toFixed(6)}
// //                       </p>
// //                       <p className="text-[10px] text-muted-foreground mt-1">
// //                         Drag to reposition
// //                       </p>
// //                     </div>
// //                   </Popup>
// //                 </Marker>
// //               )}

// //               {/* Boundary polygon — render as soon as we have 2+ points so user gets visual feedback */}
// //               {boundaryPoints.length >= 2 && (
// //                 <Polygon
// //                   positions={boundaryPoints}
// //                   pathOptions={{
// //                     color: "#ef4444",
// //                     fillColor: "#ef4444",
// //                     fillOpacity: 0.12,
// //                     weight: 2,
// //                     dashArray: "6 4",
// //                   }}
// //                 />
// //               )}

// //               {/* Boundary point markers — click to remove */}
// //               {boundaryPoints.map((pt, i) =>
// //                 boundaryIcon ? (
// //                   <Marker
// //                     key={i}
// //                     position={pt}
// //                     icon={boundaryIcon}
// //                     // @ts-expect-error
// //                     eventHandlers={{
// //                       click() {
// //                         removeBoundaryPoint(i);
// //                       },
// //                     }}
// //                   >
// //                     <Popup>
// //                       <span className="text-[10px]">
// //                         Click to remove point {i + 1}
// //                       </span>
// //                     </Popup>
// //                   </Marker>
// //                 ) : null,
// //               )}
// //             </MapContainer>
// //           ) : (
// //             <div className="h-full bg-muted flex items-center justify-center">
// //               <div className="flex flex-col items-center gap-3">
// //                 <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
// //                 <p className="text-xs text-muted-foreground font-medium">
// //                   Loading map…
// //                 </p>
// //               </div>
// //             </div>
// //           )}
// //         </div>
// //       </div>

// //       {/* Coordinate display */}
// //       {lat && lng && (
// //         <div className="grid grid-cols-2 gap-2">
// //           <div className="bg-muted/40 border border-border/50 rounded-xl px-3 py-2.5">
// //             <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">
// //               Latitude
// //             </p>
// //             <p className="text-[13px] font-mono font-bold">{lat.toFixed(6)}</p>
// //           </div>
// //           <div className="bg-muted/40 border border-border/50 rounded-xl px-3 py-2.5">
// //             <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">
// //               Longitude
// //             </p>
// //             <p className="text-[13px] font-mono font-bold">{lng.toFixed(6)}</p>
// //           </div>
// //         </div>
// //       )}

// //       {/* Boundary info */}
// //       {boundaryPoints.length > 0 && (
// //         <div
// //           className={cn(
// //             "rounded-xl px-4 py-3 border",
// //             hasBoundary
// //               ? "bg-rose-500/5 border-rose-500/20"
// //               : "bg-amber-500/5 border-amber-500/20",
// //           )}
// //         >
// //           <div className="flex items-center justify-between mb-2">
// //             <p
// //               className={cn(
// //                 "text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5",
// //                 hasBoundary
// //                   ? "text-rose-600 dark:text-rose-400"
// //                   : "text-amber-600 dark:text-amber-400",
// //               )}
// //             >
// //               <Pentagon size={11} />
// //               Boundary — {boundaryPoints.length} point
// //               {boundaryPoints.length !== 1 ? "s" : ""}
// //               {hasBoundary && (
// //                 <span className="text-green-600 dark:text-green-400 ml-1">
// //                   ✓ polygon closed
// //                 </span>
// //               )}
// //             </p>
// //             {!hasBoundary && (
// //               <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
// //                 {pointsNeeded} more to close
// //               </span>
// //             )}
// //           </div>
// //           <div className="flex flex-wrap gap-1.5">
// //             {boundaryPoints.map((pt, i) => (
// //               <button
// //                 key={i}
// //                 type="button"
// //                 onClick={() => removeBoundaryPoint(i)}
// //                 className="flex items-center gap-1 bg-rose-500/10 hover:bg-destructive/15 border border-rose-500/20 hover:border-destructive/30 rounded-lg px-2 py-1 text-[10px] font-mono transition-colors group"
// //               >
// //                 <span className="text-rose-700 dark:text-rose-400 group-hover:text-destructive">
// //                   {pt[0].toFixed(4)}, {pt[1].toFixed(4)}
// //                 </span>
// //                 <X
// //                   size={9}
// //                   className="text-muted-foreground group-hover:text-destructive"
// //                 />
// //               </button>
// //             ))}
// //           </div>
// //         </div>
// //       )}

// //       <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
// //         Search a location above or click the map to drop a pin. Drag the pin to
// //         fine-tune. Use{" "}
// //         <strong className="text-foreground/70">Draw boundary</strong> to outline
// //         the land area — click to add any number of points. This step is optional
// //         and can be set later.
// //       </p>
// //     </div>
// //   );
// // }

// // // ── Image thumbnail component ─────────────────────────────────────────
// // function ImageThumb({
// //   src,
// //   label,
// //   badge,
// //   badgeColor,
// //   uploading,
// //   progress,
// //   failed,
// //   onRemove,
// // }: {
// //   src: string;
// //   label?: string;
// //   badge?: string;
// //   badgeColor?: string;
// //   uploading?: boolean;
// //   progress?: number;
// //   failed?: boolean;
// //   onRemove: () => void;
// // }) {
// //   const [loaded, setLoaded] = useState(false);

// //   return (
// //     <div className="relative group rounded-xl overflow-hidden border border-border/50 bg-muted aspect-square">
// //       {/* Skeleton while loading */}
// //       {!loaded && !failed && (
// //         <div className="absolute inset-0 bg-muted animate-pulse" />
// //       )}

// //       <img
// //         src={src}
// //         alt={label ?? "image"}
// //         onLoad={() => setLoaded(true)}
// //         onError={() => setLoaded(true)}
// //         className={cn(
// //           "w-full h-full object-cover transition-opacity duration-300",
// //           loaded ? "opacity-100" : "opacity-0",
// //         )}
// //       />

// //       {/* Badge (e.g. "Saved") */}
// //       {badge && loaded && (
// //         <div
// //           className={cn(
// //             "absolute top-2 left-2 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase",
// //             badgeColor ?? "bg-blue-500",
// //           )}
// //         >
// //           {badge}
// //         </div>
// //       )}

// //       {/* Upload progress overlay */}
// //       {uploading &&
// //         typeof progress === "number" &&
// //         progress > 0 &&
// //         progress < 100 && (
// //           <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 px-3">
// //             <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
// //               <div
// //                 className="bg-white h-1.5 rounded-full transition-all duration-300"
// //                 style={{ width: `${progress}%` }}
// //               />
// //             </div>
// //             <span className="text-white text-[10px] font-bold">
// //               {progress}%
// //             </span>
// //           </div>
// //         )}

// //       {/* Success checkmark */}
// //       {progress === 100 && (
// //         <div className="absolute top-2 left-2">
// //           <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shadow">
// //             <Check size={11} className="text-white" />
// //           </div>
// //         </div>
// //       )}

// //       {/* Failed overlay */}
// //       {failed && (
// //         <div className="absolute inset-0 bg-destructive/80 flex flex-col items-center justify-center gap-1 rounded-xl">
// //           <AlertCircle size={18} className="text-white" />
// //           <span className="text-white text-[10px] font-bold">Failed</span>
// //         </div>
// //       )}

// //       {/* Remove button */}
// //       <button
// //         type="button"
// //         onClick={onRemove}
// //         disabled={
// //           uploading &&
// //           typeof progress === "number" &&
// //           progress > 0 &&
// //           progress < 100
// //         }
// //         className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow disabled:opacity-30"
// //       >
// //         <X size={11} />
// //       </button>
// //     </div>
// //   );
// // }

// // // ── Main Form ─────────────────────────────────────────────────────────
// // export default function PropertyForm({
// //   initialData,
// //   initialBoundary = [],
// //   existingImages: initialExistingImages,
// //   propertyId,
// //   onSubmit,
// //   isSubmitting = false,
// //   buttonText = "Save Property",
// // }: PropertyFormProps) {
// //   const [step, setStep] = useState(0);
// //   const [direction, setDirection] = useState<"forward" | "back">("forward");
// //   const [animating, setAnimating] = useState(false);
// //   const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

// //   const [images, setImages] = useState<PreviewFile[]>([]);
// //   const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
// //   const [deletedFileIds, setDeletedFileIds] = useState<string[]>([]);
// //   const [uploading, setUploading] = useState(false);

// //   // Boundary persists across steps
// //   const [boundaryPoints, setBoundaryPoints] =
// //     useState<[number, number][]>(initialBoundary);

// //   const fileInputRef = useRef<HTMLInputElement>(null);

// //   const {
// //     register,
// //     handleSubmit,
// //     setValue,
// //     watch,
// //     trigger,
// //     formState: { errors },
// //   } = useForm<PropertyFormValues>({
// //     resolver: zodResolver(formSchema),
// //     defaultValues: {
// //       title: initialData?.title || "",
// //       price: initialData?.price || 0,
// //       location: initialData?.location || "",
// //       description: initialData?.description || "",
// //       category: initialData?.category || "",
// //       status: initialData?.status || "available",
// //       area: initialData?.area || "",
// //       face: initialData?.face || "",
// //       roadType: initialData?.roadType || "",
// //       roadAccess: initialData?.roadAccess || "",
// //       negotiable: initialData?.negotiable ?? false,
// //       municipality: initialData?.municipality || "",
// //       wardNo: initialData?.wardNo || "",
// //       ringRoad: initialData?.ringRoad || "",
// //       latitude: initialData?.latitude,
// //       longitude: initialData?.longitude,
// //       nearHospital: initialData?.nearHospital || "",
// //       nearAirport: initialData?.nearAirport || "",
// //       nearSupermarket: initialData?.nearSupermarket || "",
// //       nearSchool: initialData?.nearSchool || "",
// //       nearGym: initialData?.nearGym || "",
// //       nearTransport: initialData?.nearTransport || "",
// //       nearAtm: initialData?.nearAtm || "",
// //       nearRestaurant: initialData?.nearRestaurant || "",
// //     },
// //   });

// //   const negotiable = watch("negotiable");
// //   const locationValue = watch("location");
// //   const categoryValue = watch("category");
// //   const statusValue = watch("status");
// //   const faceValue = watch("face");
// //   const roadTypeValue = watch("roadType");
// //   const latValue = watch("latitude");
// //   const lngValue = watch("longitude");

// //   const { data: fetchedImages = [], isLoading: loadingExisting } =
// //     usePropertyImages(propertyId);

// //   useEffect(() => {
// //     if (fetchedImages.length)
// //       setExistingImages(fetchedImages as ExistingImage[]);
// //     else if (!propertyId && initialExistingImages?.length)
// //       setExistingImages(initialExistingImages);
// //   }, [fetchedImages, propertyId, initialExistingImages]);

// //   // ── Navigation ──────────────────────────────────────────────────────
// //   async function goNext() {
// //     const valid = await trigger(STEP_FIELDS[step]);
// //     if (!valid) return;
// //     setCompletedSteps((prev) => new Set(prev).add(step));
// //     setDirection("forward");
// //     setAnimating(true);
// //     setTimeout(() => {
// //       setStep((s) => s + 1);
// //       setAnimating(false);
// //     }, 180);
// //   }

// //   function goBack() {
// //     setDirection("back");
// //     setAnimating(true);
// //     setTimeout(() => {
// //       setStep((s) => s - 1);
// //       setAnimating(false);
// //     }, 180);
// //   }

// //   function jumpTo(target: number) {
// //     const canJump =
// //       target < step ||
// //       completedSteps.has(target) ||
// //       completedSteps.has(target - 1);
// //     if (!canJump) return;
// //     setDirection(target > step ? "forward" : "back");
// //     setAnimating(true);
// //     setTimeout(() => {
// //       setStep(target);
// //       setAnimating(false);
// //     }, 180);
// //   }

// //   // ── Image handling ──────────────────────────────────────────────────
// //   function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
// //     const files = e.target.files;
// //     if (!files || files.length === 0) return;
// //     // Use functional update so React always sees the latest state
// //     setImages((prev) => [
// //       ...prev,
// //       ...Array.from(files).map((file) => ({
// //         file,
// //         url: URL.createObjectURL(file),
// //         uploadProgress: undefined,
// //         fileId: undefined,
// //       })),
// //     ]);
// //     // Reset so the same file can be re-selected
// //     e.target.value = "";
// //   }

// //   function removeNewImage(index: number) {
// //     setImages((prev) => {
// //       URL.revokeObjectURL(prev[index].url);
// //       return prev.filter((_, i) => i !== index);
// //     });
// //   }

// //   function removeExistingImage(imageId: string) {
// //     setDeletedFileIds((prev) => [...prev, imageId]);
// //     setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
// //   }

// //   async function uploadImages(): Promise<string[]> {
// //     if (!images.length) return [];
// //     setUploading(true);
// //     const fileIds: string[] = [];

// //     for (let i = 0; i < images.length; i++) {
// //       const img = images[i];
// //       if (img.fileId) {
// //         fileIds.push(img.fileId);
// //         continue;
// //       }

// //       const fd = new FormData();
// //       fd.append("file", img.file);
// //       fd.append("isPrivate", "true");

// //       setImages((prev) =>
// //         prev.map((p, idx) => (idx === i ? { ...p, uploadProgress: 10 } : p)),
// //       );

// //       let fakeProgress = 10;
// //       const interval = setInterval(() => {
// //         fakeProgress = Math.min(
// //           fakeProgress + Math.floor(Math.random() * 15 + 5),
// //           85,
// //         );
// //         const captured = fakeProgress;
// //         setImages((prev) =>
// //           prev.map((p, idx) =>
// //             idx === i &&
// //             typeof p.uploadProgress === "number" &&
// //             p.uploadProgress < 100 &&
// //             p.uploadProgress !== -1
// //               ? { ...p, uploadProgress: captured }
// //               : p,
// //           ),
// //         );
// //       }, 300);

// //       try {
// //         const res = await fetch("/api/files/upload", {
// //           method: "POST",
// //           body: fd,
// //         });
// //         clearInterval(interval);
// //         if (!res.ok) throw new Error(`Upload failed for ${img.file.name}`);
// //         const data = await res.json();
// //         setImages((prev) =>
// //           prev.map((p, idx) =>
// //             idx === i
// //               ? { ...p, uploadProgress: 100, fileId: data.file._id }
// //               : p,
// //           ),
// //         );
// //         fileIds.push(data.file._id);
// //       } catch (error) {
// //         clearInterval(interval);
// //         setImages((prev) =>
// //           prev.map((p, idx) => (idx === i ? { ...p, uploadProgress: -1 } : p)),
// //         );
// //         setUploading(false);
// //         throw error;
// //       }
// //     }

// //     setUploading(false);
// //     return fileIds;
// //   }

// //   async function onFormSubmit(values: PropertyFormValues) {
// //     try {
// //       const newFileIds = await uploadImages();
// //       onSubmit({
// //         ...values,
// //         fileIds: newFileIds,
// //         deletedFileIds,
// //         boundaryPoints,
// //       });
// //     } catch (error) {
// //       console.error(error);
// //     }
// //   }

// //   const currentStep = STEPS[step];

// //   return (
// //     <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
// //       {/* Always-mounted, hidden file input */}
// //       <input
// //         ref={fileInputRef}
// //         type="file"
// //         multiple
// //         accept="image/*"
// //         onChange={handleImageChange}
// //         className="hidden"
// //       />

// //       {/* ── STEP INDICATOR ──────────────────────────────────────── */}
// //       <div className="relative">
// //         {/* Track line */}
// //         <div className="absolute top-5 left-8 right-8 h-px bg-border hidden sm:block" />
// //         {/* Progress fill */}
// //         <div
// //           className="absolute top-5 left-8 h-px bg-primary transition-all duration-500 hidden sm:block"
// //           style={{
// //             width: `calc((${step} / ${STEPS.length - 1}) * (100% - 4rem))`,
// //           }}
// //         />
// //         <div className="relative flex justify-between items-start px-2">
// //           {STEPS.map((s) => {
// //             const Icon = s.icon;
// //             const isCompleted = completedSteps.has(s.id);
// //             const isCurrent = step === s.id;
// //             const isReachable =
// //               s.id < step ||
// //               completedSteps.has(s.id) ||
// //               completedSteps.has(s.id - 1);
// //             return (
// //               <button
// //                 key={s.id}
// //                 type="button"
// //                 onClick={() => jumpTo(s.id)}
// //                 disabled={!isReachable && !isCurrent}
// //                 className="flex flex-col items-center gap-2 disabled:cursor-not-allowed group"
// //               >
// //                 <div
// //                   className={cn(
// //                     "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 bg-background",
// //                     isCurrent &&
// //                       `${s.border} ${s.accent} text-white scale-110 shadow-lg ring-4 ${s.ring}`,
// //                     isCompleted &&
// //                       !isCurrent &&
// //                       "border-primary bg-primary text-white",
// //                     !isCurrent &&
// //                       !isCompleted &&
// //                       "border-border text-muted-foreground group-hover:border-primary/40",
// //                   )}
// //                 >
// //                   {isCompleted && !isCurrent ? (
// //                     <Check size={16} />
// //                   ) : (
// //                     <Icon size={16} />
// //                   )}
// //                 </div>
// //                 <span
// //                   className={cn(
// //                     "text-[10px] font-bold uppercase tracking-wider transition-colors hidden sm:block",
// //                     isCurrent ? "text-foreground" : "text-muted-foreground",
// //                   )}
// //                 >
// //                   {s.short}
// //                 </span>
// //               </button>
// //             );
// //           })}
// //         </div>
// //       </div>

// //       {/* ── STEP CARD ─────────────────────────────────────────────── */}
// //       <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
// //         {/* Card header */}
// //         <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50 bg-muted/20">
// //           <div className={cn("w-1.5 h-6 rounded-full", currentStep.accent)} />
// //           <div className="flex-1 min-w-0">
// //             <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
// //               {currentStep.label}
// //             </h3>
// //             <p className="text-[11px] text-muted-foreground mt-0.5">
// //               Step {step + 1} of {STEPS.length}
// //             </p>
// //           </div>
// //           {/* Boundary badge visible on all steps when boundary exists */}
// //           {boundaryPoints.length >= 3 && (
// //             <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-bold px-2.5 py-1 rounded-full">
// //               <Pentagon size={10} /> {boundaryPoints.length} pts
// //             </div>
// //           )}
// //         </div>

// //         {/* Card body */}
// //         <div
// //           className={cn(
// //             "p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-200 ease-out",
// //             animating && direction === "forward" && "opacity-0 translate-x-3",
// //             animating && direction === "back" && "opacity-0 -translate-x-3",
// //             !animating && "opacity-100 translate-x-0",
// //           )}
// //         >
// //           {/* ── STEP 0: Basic Info ── */}
// //           {step === 0 && (
// //             <>
// //               <Field
// //                 label="Property Title"
// //                 error={errors.title?.message}
// //                 className="sm:col-span-2"
// //               >
// //                 <Input
// //                   placeholder="e.g. Modern Villa at Baneshwor"
// //                   className="h-10 rounded-xl text-sm"
// //                   {...register("title")}
// //                 />
// //               </Field>
// //               <Field
// //                 label="Price (NPR)"
// //                 error={errors.price?.message}
// //                 hint="Enter the full price in Nepalese Rupees"
// //               >
// //                 <Input
// //                   type="number"
// //                   placeholder="e.g. 12500000"
// //                   className="h-10 rounded-xl text-sm"
// //                   {...register("price", { valueAsNumber: true })}
// //                 />
// //               </Field>
// //               <Field label="Location" error={errors.location?.message}>
// //                 <Select
// //                   onValueChange={(v) => setValue("location", v)}
// //                   value={locationValue}
// //                 >
// //                   <SelectTrigger className="h-10 rounded-xl text-sm w-full">
// //                     <SelectValue placeholder="Select district" />
// //                   </SelectTrigger>
// //                   <SelectContent>
// //                     {["Kathmandu", "Lalitpur", "Bhaktapur"].map((l) => (
// //                       <SelectItem key={l} value={l}>
// //                         {l}
// //                       </SelectItem>
// //                     ))}
// //                   </SelectContent>
// //                 </Select>
// //               </Field>
// //               <Field label="Property Type" error={errors.category?.message}>
// //                 <Select
// //                   onValueChange={(v) => setValue("category", v)}
// //                   value={categoryValue}
// //                 >
// //                   <SelectTrigger className="h-10 rounded-xl text-sm w-full">
// //                     <SelectValue placeholder="Select type" />
// //                   </SelectTrigger>
// //                   <SelectContent>
// //                     {["House", "Apartment", "Land", "Colony"].map((t) => (
// //                       <SelectItem key={t} value={t}>
// //                         {t}
// //                       </SelectItem>
// //                     ))}
// //                   </SelectContent>
// //                 </Select>
// //               </Field>
// //               <Field label="Status" error={errors.status?.message}>
// //                 <Select
// //                   onValueChange={(v) => setValue("status", v as PropertyStatus)}
// //                   value={statusValue}
// //                 >
// //                   <SelectTrigger className="h-10 rounded-xl text-sm w-full">
// //                     <SelectValue placeholder="Select status" />
// //                   </SelectTrigger>
// //                   <SelectContent>
// //                     <SelectItem value="available">Available</SelectItem>
// //                   </SelectContent>
// //                 </Select>
// //               </Field>
// //               <Field
// //                 label="Description"
// //                 className="sm:col-span-2"
// //                 hint="Describe the property, surroundings and highlights"
// //               >
// //                 <Textarea
// //                   placeholder="Describe the property…"
// //                   rows={3}
// //                   className="rounded-xl text-sm resize-none"
// //                   {...register("description")}
// //                 />
// //               </Field>
// //             </>
// //           )}

// //           {/* ── STEP 1: Property Details ── */}
// //           {step === 1 && (
// //             <>
// //               <Field
// //                 label="Area"
// //                 error={errors.area?.message}
// //                 hint="e.g. 5 Aana, 3 Ropani, 1050 sq.ft"
// //               >
// //                 <Input
// //                   placeholder="e.g. 5 Aana"
// //                   className="h-10 rounded-xl text-sm"
// //                   {...register("area")}
// //                 />
// //               </Field>
// //               <Field label="Property Face" error={errors.face?.message}>
// //                 <Select
// //                   onValueChange={(v) => setValue("face", v)}
// //                   value={faceValue}
// //                 >
// //                   <SelectTrigger className="h-10 rounded-xl text-sm w-full">
// //                     <SelectValue placeholder="Select facing" />
// //                   </SelectTrigger>
// //                   <SelectContent>
// //                     {[
// //                       "North",
// //                       "South",
// //                       "East",
// //                       "West",
// //                       "North-East",
// //                       "North-West",
// //                       "South-East",
// //                       "South-West",
// //                     ].map((f) => (
// //                       <SelectItem key={f} value={f}>
// //                         {f}
// //                       </SelectItem>
// //                     ))}
// //                   </SelectContent>
// //                 </Select>
// //               </Field>
// //               <Field label="Road Type" error={errors.roadType?.message}>
// //                 <Select
// //                   onValueChange={(v) => setValue("roadType", v)}
// //                   value={roadTypeValue}
// //                 >
// //                   <SelectTrigger className="h-10 rounded-xl text-sm w-full">
// //                     <SelectValue placeholder="Select road type" />
// //                   </SelectTrigger>
// //                   <SelectContent>
// //                     {["Blacktopped", "Graveled", "Dirt", "Goreto"].map((r) => (
// //                       <SelectItem key={r} value={r}>
// //                         {r}
// //                       </SelectItem>
// //                     ))}
// //                   </SelectContent>
// //                 </Select>
// //               </Field>
// //               <Field label="Road Access" hint="Width of the road in feet">
// //                 <Input
// //                   placeholder="e.g. 13 Feet"
// //                   className="h-10 rounded-xl text-sm"
// //                   {...register("roadAccess")}
// //                 />
// //               </Field>
// //               <div className="sm:col-span-2 flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20">
// //                 <div>
// //                   <p className="text-xs font-black uppercase tracking-widest">
// //                     Negotiable
// //                   </p>
// //                   <p className="text-[11px] text-muted-foreground mt-0.5">
// //                     Is the price open to negotiation?
// //                   </p>
// //                 </div>
// //                 <Switch
// //                   checked={negotiable}
// //                   onCheckedChange={(v) => setValue("negotiable", v)}
// //                 />
// //               </div>
// //             </>
// //           )}

// //           {/* ── STEP 2: Location Details ── */}
// //           {step === 2 && (
// //             <>
// //               <Field label="Municipality">
// //                 <Input
// //                   placeholder="e.g. Suryabinayak Municipality"
// //                   className="h-10 rounded-xl text-sm"
// //                   {...register("municipality")}
// //                 />
// //               </Field>
// //               <Field label="Ward No.">
// //                 <Input
// //                   placeholder="e.g. 07"
// //                   className="h-10 rounded-xl text-sm"
// //                   {...register("wardNo")}
// //                 />
// //               </Field>
// //               <Field
// //                 label="Distance from Ring Road"
// //                 className="sm:col-span-2"
// //                 hint="Approximate distance to the nearest ring road"
// //               >
// //                 <Input
// //                   placeholder="e.g. 4 km"
// //                   className="h-10 rounded-xl text-sm"
// //                   {...register("ringRoad")}
// //                 />
// //               </Field>
// //             </>
// //           )}

// //           {/* ── STEP 3: Map Pin + Boundary ── */}
// //           {step === 3 && (
// //             <LeafletMapPicker
// //               lat={latValue && latValue !== 0 ? latValue : undefined}
// //               lng={lngValue && lngValue !== 0 ? lngValue : undefined}
// //               boundaryPoints={boundaryPoints}
// //               onChange={(la, ln) => {
// //                 setValue("latitude", la, { shouldDirty: true });
// //                 setValue("longitude", ln, { shouldDirty: true });
// //               }}
// //               onClear={() => {
// //                 setValue("latitude", undefined, { shouldDirty: true });
// //                 setValue("longitude", undefined, { shouldDirty: true });
// //               }}
// //               onBoundaryChange={setBoundaryPoints}
// //             />
// //           )}

// //           {/* ── STEP 4: Nearby Facilities ── */}
// //           {step === 4 &&
// //             [
// //               {
// //                 field: "nearHospital" as const,
// //                 label: "Hospital",
// //                 hint: "e.g. 500m",
// //               },
// //               {
// //                 field: "nearAirport" as const,
// //                 label: "Airport",
// //                 hint: "e.g. 8 km",
// //               },
// //               {
// //                 field: "nearSupermarket" as const,
// //                 label: "Supermarket",
// //                 hint: "e.g. 300m",
// //               },
// //               {
// //                 field: "nearSchool" as const,
// //                 label: "School",
// //                 hint: "e.g. 200m",
// //               },
// //               { field: "nearGym" as const, label: "Gym", hint: "e.g. 1 km" },
// //               {
// //                 field: "nearTransport" as const,
// //                 label: "Public Transport",
// //                 hint: "e.g. 100m",
// //               },
// //               { field: "nearAtm" as const, label: "ATM", hint: "e.g. 150m" },
// //               {
// //                 field: "nearRestaurant" as const,
// //                 label: "Restaurant",
// //                 hint: "e.g. 400m",
// //               },
// //             ].map(({ field, label, hint }) => (
// //               <Field key={field} label={label} hint={hint}>
// //                 <Input
// //                   placeholder={hint}
// //                   className="h-10 rounded-xl text-sm"
// //                   {...register(field)}
// //                 />
// //               </Field>
// //             ))}

// //           {/* ── STEP 5: Images ── */}
// //           {step === 5 && (
// //             <div className="sm:col-span-2 space-y-4">
// //               {loadingExisting ? (
// //                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
// //                   {[1, 2, 3, 4].map((i) => (
// //                     <div
// //                       key={i}
// //                       className="aspect-square rounded-xl bg-muted animate-pulse"
// //                     />
// //                   ))}
// //                 </div>
// //               ) : (
// //                 <>
// //                   {/* Upload CTA when empty */}
// //                   {existingImages.length === 0 && images.length === 0 && (
// //                     <button
// //                       type="button"
// //                       onClick={() => fileInputRef.current?.click()}
// //                       className="w-full flex flex-col items-center justify-center gap-3 py-10 border-2 border-dashed border-border hover:border-primary rounded-2xl bg-muted/10 hover:bg-primary/5 transition-colors group"
// //                     >
// //                       <div className="w-12 h-12 rounded-2xl bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
// //                         <Upload
// //                           size={20}
// //                           className="text-muted-foreground group-hover:text-primary transition-colors"
// //                         />
// //                       </div>
// //                       <div className="text-center">
// //                         <p className="text-sm font-bold text-foreground">
// //                           Click to upload images
// //                         </p>
// //                         <p className="text-[11px] text-muted-foreground mt-0.5">
// //                           PNG, JPG, WEBP — max 10 images
// //                         </p>
// //                       </div>
// //                     </button>
// //                   )}

// //                   {/* Image grid */}
// //                   {(existingImages.length > 0 || images.length > 0) && (
// //                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
// //                       {/* Existing saved images */}
// //                       {existingImages.map((img) => (
// //                         <ImageThumb
// //                           key={img.id}
// //                           src={img.url}
// //                           label={img.filename}
// //                           badge="Saved"
// //                           badgeColor="bg-blue-500"
// //                           onRemove={() => removeExistingImage(img.id)}
// //                         />
// //                       ))}

// //                       {/* New images being uploaded */}
// //                       {images.map((img, i) => (
// //                         <ImageThumb
// //                           key={img.url}
// //                           src={img.url}
// //                           uploading={uploading}
// //                           progress={img.uploadProgress}
// //                           failed={img.uploadProgress === -1}
// //                           onRemove={() => removeNewImage(i)}
// //                         />
// //                       ))}

// //                       {/* Add more button */}
// //                       <button
// //                         type="button"
// //                         onClick={() => fileInputRef.current?.click()}
// //                         disabled={uploading}
// //                         className="aspect-square border-2 border-dashed border-border hover:border-primary rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-primary/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
// //                       >
// //                         <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
// //                           <Plus size={16} className="text-muted-foreground" />
// //                         </div>
// //                         <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
// //                           Add more
// //                         </span>
// //                       </button>
// //                     </div>
// //                   )}

// //                   {/* Stats */}
// //                   {(existingImages.length > 0 || images.length > 0) && (
// //                     <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-medium">
// //                       {existingImages.length > 0 && (
// //                         <span className="flex items-center gap-1">
// //                           <Check size={10} className="text-green-500" />
// //                           {existingImages.length} saved
// //                         </span>
// //                       )}
// //                       {images.length > 0 && (
// //                         <span className="flex items-center gap-1">
// //                           <Upload size={10} className="text-primary" />
// //                           {images.length} new
// //                         </span>
// //                       )}
// //                       {deletedFileIds.length > 0 && (
// //                         <span className="flex items-center gap-1 text-destructive">
// //                           <X size={10} />
// //                           {deletedFileIds.length} queued for deletion
// //                         </span>
// //                       )}
// //                     </div>
// //                   )}
// //                 </>
// //               )}
// //             </div>
// //           )}
// //         </div>
// //       </div>

// //       {/* ── NAVIGATION ──────────────────────────────────────────── */}
// //       <div className="flex items-center gap-3">
// //         {step > 0 && (
// //           <Button
// //             type="button"
// //             variant="outline"
// //             onClick={goBack}
// //             disabled={animating}
// //             className="h-11 px-5 rounded-xl font-bold text-[11px] uppercase tracking-widest"
// //           >
// //             <ChevronLeft size={15} className="mr-1" /> Back
// //           </Button>
// //         )}

// //         {step < STEPS.length - 1 ? (
// //           <Button
// //             type="button"
// //             onClick={goNext}
// //             disabled={animating}
// //             className="flex-1 h-11 rounded-xl font-black text-[11px] uppercase tracking-widest"
// //           >
// //             {step === 3 && !latValue ? "Skip" : "Next"}{" "}
// //             <ChevronRight size={15} className="ml-1" />
// //           </Button>
// //         ) : (
// //           <Button
// //             type="submit"
// //             size="lg"
// //             disabled={isSubmitting || uploading || animating}
// //             className="flex-1 h-11 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg"
// //           >
// //             {uploading
// //               ? "Uploading images…"
// //               : isSubmitting
// //                 ? "Saving…"
// //                 : buttonText}
// //           </Button>
// //         )}
// //       </div>
// //     </form>
// //   );
// // }

// "use client";

// import { useState, useRef, useEffect, useCallback } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import dynamic from "next/dynamic";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Switch } from "@/components/ui/switch";
// import {
//   X,
//   Plus,
//   CheckCircle2,
//   ChevronLeft,
//   ChevronRight,
//   Info,
//   Building2,
//   MapPin,
//   Utensils,
//   ImageIcon,
//   Check,
//   LocateFixed,
//   Map,
//   Crosshair,
//   Trash2,
//   Pentagon,
//   Search,
//   Upload,
//   AlertCircle,
// } from "lucide-react";
// import { usePropertyImages } from "@/lib/client/queries/properties.queries";
// import { cn } from "@/lib/utils";

// // ── Schema ────────────────────────────────────────────────────────────
// const formSchema = z.object({
//   title: z.string().min(3, "Title must be at least 3 characters"),
//   price: z.number().positive("Price must be positive"),
//   location: z.string().min(1, "Location is required"),
//   description: z.string().max(5000).optional(),
//   category: z.string().min(1, "Property type is required"),
//   status: z.enum(["available", "booked", "sold"]),
//   area: z.string().min(1, "Area is required"),
//   face: z.string().min(1, "Property Face is required"),
//   roadType: z.string().min(1, "Property Road type is required"),
//   roadAccess: z.string().optional(),
//   negotiable: z.boolean(),
//   municipality: z.string().optional(),
//   wardNo: z.string().optional(),
//   ringRoad: z.string().optional(),
//   latitude: z.number().optional(),
//   longitude: z.number().optional(),
//   nearHospital: z.string().optional(),
//   nearAirport: z.string().optional(),
//   nearSupermarket: z.string().optional(),
//   nearSchool: z.string().optional(),
//   nearGym: z.string().optional(),
//   nearTransport: z.string().optional(),
//   nearAtm: z.string().optional(),
//   nearRestaurant: z.string().optional(),
// });

// export type PropertyStatus = z.infer<typeof formSchema>["status"];
// export type PropertyFormValues = z.infer<typeof formSchema>;

// type PreviewFile = {
//   file: File;
//   url: string;
//   uploadProgress?: number;
//   fileId?: string;
// };
// type ExistingImage = { id: string; url: string; filename: string };

// interface PropertyFormProps {
//   initialData?: Partial<PropertyFormValues>;
//   initialBoundary?: [number, number][];
//   existingImages?: ExistingImage[];
//   propertyId?: string;
//   onSubmit: (
//     values: PropertyFormValues & {
//       fileIds: string[];
//       deletedFileIds: string[];
//       boundaryPoints: [number, number][];
//     },
//   ) => void;
//   isSubmitting?: boolean;
//   buttonText?: string;
// }

// // ── Steps ─────────────────────────────────────────────────────────────
// const STEPS = [
//   {
//     id: 0,
//     label: "Basic Info",
//     short: "Basic",
//     icon: Info,
//     accent: "bg-primary",
//     border: "border-primary",
//     ring: "ring-primary/20",
//   },
//   {
//     id: 1,
//     label: "Property",
//     short: "Property",
//     icon: Building2,
//     accent: "bg-amber-500",
//     border: "border-amber-500",
//     ring: "ring-amber-500/20",
//   },
//   {
//     id: 2,
//     label: "Location",
//     short: "Location",
//     icon: MapPin,
//     accent: "bg-blue-500",
//     border: "border-blue-500",
//     ring: "ring-blue-500/20",
//   },
//   {
//     id: 3,
//     label: "Map Pin",
//     short: "Map",
//     icon: Map,
//     accent: "bg-rose-500",
//     border: "border-rose-500",
//     ring: "ring-rose-500/20",
//   },
//   {
//     id: 4,
//     label: "Facilities",
//     short: "Nearby",
//     icon: Utensils,
//     accent: "bg-green-500",
//     border: "border-green-500",
//     ring: "ring-green-500/20",
//   },
//   {
//     id: 5,
//     label: "Images",
//     short: "Images",
//     icon: ImageIcon,
//     accent: "bg-purple-500",
//     border: "border-purple-500",
//     ring: "ring-purple-500/20",
//   },
// ];

// const STEP_FIELDS: Record<number, (keyof PropertyFormValues)[]> = {
//   0: ["title", "price", "location", "category", "status"],
//   1: ["area", "face", "roadType", "roadAccess", "negotiable"],
//   2: ["municipality", "wardNo", "ringRoad"],
//   3: [],
//   4: [],
//   5: [],
// };

// // ── Tile styles ───────────────────────────────────────────────────────
// const TILE_STYLES = {
//   standard: {
//     label: "Map",
//     url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
//     attribution: "&copy; OpenStreetMap",
//   },
//   satellite: {
//     label: "Satellite",
//     url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
//     attribution: "Esri",
//   },
// };
// type TileKey = keyof typeof TILE_STYLES;

// // ── Nominatim result ──────────────────────────────────────────────────
// interface NominatimResult {
//   place_id: number;
//   display_name: string;
//   lat: string;
//   lon: string;
// }

// // ── Leaflet dynamic imports ───────────────────────────────────────────
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
// const Polygon = dynamic(() => import("react-leaflet").then((m) => m.Polygon), {
//   ssr: false,
// });

// // ── Field wrapper ─────────────────────────────────────────────────────
// function Field({
//   label,
//   error,
//   className,
//   hint,
//   children,
// }: {
//   label: string;
//   error?: string;
//   className?: string;
//   hint?: string;
//   children: React.ReactNode;
// }) {
//   return (
//     <div className={cn("flex flex-col gap-1.5", className)}>
//       <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
//         {label}
//       </Label>
//       {children}
//       {hint && !error && (
//         <p className="text-[11px] text-muted-foreground/70">{hint}</p>
//       )}
//       {error && (
//         <div className="flex items-center gap-1.5">
//           <AlertCircle size={11} className="text-destructive shrink-0" />
//           <p className="text-[11px] text-destructive font-semibold">{error}</p>
//         </div>
//       )}
//     </div>
//   );
// }

// // ── Inner map components ──────────────────────────────────────────────
// function MapClickHandler({
//   onMapClick,
//   useMapEventsHook,
// }: {
//   onMapClick: (lat: number, lng: number) => void;
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   useMapEventsHook: any;
// }) {
//   useMapEventsHook({
//     click(e: { latlng: { lat: number; lng: number } }) {
//       onMapClick(e.latlng.lat, e.latlng.lng);
//     },
//   });
//   return null;
// }

// function FlyTo({
//   lat,
//   lng,
//   useMapHook,
// }: {
//   lat: number;
//   lng: number;
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   useMapHook: any;
// }) {
//   const map = useMapHook();
//   useEffect(() => {
//     map.flyTo([lat, lng], 17, { duration: 0.8 });
//   }, [lat, lng]);
//   return null;
// }

// // ── Location search box using Nominatim (OpenStreetMap free geocoder) ─
// function LocationSearch({
//   onSelect,
// }: {
//   onSelect: (lat: number, lng: number, label: string) => void;
// }) {
//   const [query, setQuery] = useState("");
//   const [results, setResults] = useState<NominatimResult[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [open, setOpen] = useState(false);
//   const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const wrapRef = useRef<HTMLDivElement>(null);

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handler = (e: MouseEvent) => {
//       if (wrapRef.current && !wrapRef.current.contains(e.target as Node))
//         setOpen(false);
//     };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   const search = useCallback(async (q: string) => {
//     if (q.trim().length < 3) {
//       setResults([]);
//       setOpen(false);
//       return;
//     }
//     setLoading(true);
//     try {
//       const res = await fetch(
//         `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&countrycodes=np`,
//         { headers: { "Accept-Language": "en" } },
//       );
//       const data: NominatimResult[] = await res.json();
//       setResults(data);
//       setOpen(data.length > 0);
//     } catch {
//       /* ignore */
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const v = e.target.value;
//     setQuery(v);
//     if (timerRef.current) clearTimeout(timerRef.current);
//     timerRef.current = setTimeout(() => search(v), 400);
//   };

//   return (
//     <div ref={wrapRef} className="relative">
//       <div className="relative">
//         <Search
//           size={13}
//           className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
//         />
//         <input
//           type="text"
//           value={query}
//           onChange={handleInput}
//           onFocus={() => results.length > 0 && setOpen(true)}
//           placeholder="Search location, e.g. Thamel Kathmandu…"
//           className={cn(
//             "w-full h-10 pl-8 pr-10 rounded-xl border border-border/60 bg-background",
//             "text-sm text-foreground placeholder:text-muted-foreground/50",
//             "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all",
//           )}
//         />
//         {loading && (
//           <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
//         )}
//       </div>

//       {open && results.length > 0 && (
//         <div className="absolute top-full left-0 right-0 mt-1.5 z-[2000] bg-card border border-border/60 rounded-xl shadow-2xl overflow-hidden">
//           {results.map((r) => (
//             <button
//               key={r.place_id}
//               type="button"
//               onClick={() => {
//                 onSelect(parseFloat(r.lat), parseFloat(r.lon), r.display_name);
//                 setQuery(r.display_name.split(",").slice(0, 2).join(", "));
//                 setOpen(false);
//               }}
//               className="w-full flex items-start gap-2.5 px-3 py-2.5 hover:bg-muted/60 transition-colors text-left border-b border-border/30 last:border-0"
//             >
//               <MapPin size={12} className="text-primary shrink-0 mt-0.5" />
//               <span className="text-[12px] text-foreground line-clamp-2 leading-snug">
//                 {r.display_name}
//               </span>
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// // ── LeafletMapPicker ──────────────────────────────────────────────────
// interface LeafletMapPickerProps {
//   lat?: number;
//   lng?: number;
//   boundaryPoints: [number, number][];
//   onChange: (lat: number, lng: number) => void;
//   onClear: () => void;
//   onBoundaryChange: (points: [number, number][]) => void;
// }

// function LeafletMapPicker({
//   lat,
//   lng,
//   boundaryPoints,
//   onChange,
//   onClear,
//   onBoundaryChange,
// }: LeafletMapPickerProps) {
//   const [leafletReady, setLeafletReady] = useState(false);
//   const [leafletLib, setLeafletLib] = useState<{
//     useMapEvents: (typeof import("react-leaflet"))["useMapEvents"];
//     useMap: (typeof import("react-leaflet"))["useMap"];
//     divIcon: (typeof import("leaflet"))["divIcon"];
//   } | null>(null);

//   const [geoStatus, setGeoStatus] = useState<
//     "idle" | "asking" | "granted" | "denied"
//   >("idle");
//   const [geoError, setGeoError] = useState("");
//   const [tileKey, setTileKey] = useState<TileKey>("standard");
//   const [drawMode, setDrawMode] = useState(false);
//   // flyTo trigger — set a new value to trigger a fly animation
//   const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);

//   const centreLat = lat ?? 27.7172;
//   const centreLng = lng ?? 85.324;

//   useEffect(() => {
//     Promise.all([import("leaflet"), import("react-leaflet")]).then(
//       ([L, RL]) => {
//         // @ts-expect-error — internal property
//         delete L.Icon.Default.prototype._getIconUrl;
//         L.Icon.Default.mergeOptions({
//           iconRetinaUrl:
//             "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
//           iconUrl:
//             "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
//           shadowUrl:
//             "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
//         });
//         setLeafletLib({
//           useMapEvents: RL.useMapEvents,
//           useMap: RL.useMap,
//           divIcon: L.divIcon,
//         });
//         setLeafletReady(true);
//       },
//     );
//   }, []);

//   useEffect(() => {
//     if (!navigator.geolocation) {
//       setGeoStatus("denied");
//       return;
//     }
//     setGeoStatus("asking");
//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         setGeoStatus("granted");
//         if (!lat && !lng) {
//           onChange(pos.coords.latitude, pos.coords.longitude);
//           setFlyTarget([pos.coords.latitude, pos.coords.longitude]);
//         }
//       },
//       (err) => {
//         setGeoStatus("denied");
//         setGeoError(
//           err.code === 1
//             ? "Location permission denied. Search a location or click the map."
//             : "Could not get location. Search or click the map to set the pin.",
//         );
//       },
//       { enableHighAccuracy: true, timeout: 8000 },
//     );
//   }, []);

//   const handleMapClick = useCallback(
//     (clickLat: number, clickLng: number) => {
//       if (drawMode) {
//         // Allow any number of points — no minimum restriction
//         onBoundaryChange([...boundaryPoints, [clickLat, clickLng]]);
//       } else {
//         onChange(clickLat, clickLng);
//         setFlyTarget([clickLat, clickLng]);
//       }
//     },
//     [drawMode, boundaryPoints, onChange, onBoundaryChange],
//   );

//   const handleLocationSelect = (selLat: number, selLng: number) => {
//     onChange(selLat, selLng);
//     setFlyTarget([selLat, selLng]);
//   };

//   const goToCurrentLocation = () => {
//     if (!navigator.geolocation) return;
//     setGeoStatus("asking");
//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         setGeoStatus("granted");
//         onChange(pos.coords.latitude, pos.coords.longitude);
//         setFlyTarget([pos.coords.latitude, pos.coords.longitude]);
//         setGeoError("");
//       },
//       () => {
//         setGeoStatus("denied");
//         setGeoError("Could not get location.");
//       },
//       { enableHighAccuracy: true, timeout: 8000 },
//     );
//   };

//   const removeBoundaryPoint = (idx: number) => {
//     onBoundaryChange(boundaryPoints.filter((_, i) => i !== idx));
//   };

//   // Custom teardrop pin icon
//   const pinIcon = leafletLib?.divIcon({
//     html: `<div style="
//       width:28px;height:28px;border-radius:50% 50% 50% 0;
//       background:#ef4444;border:3px solid white;
//       transform:rotate(-45deg);box-shadow:0 2px 10px rgba(0,0,0,0.3);
//     "></div>`,
//     className: "",
//     iconSize: [28, 28],
//     iconAnchor: [14, 28],
//     popupAnchor: [0, -32],
//   });

//   // Boundary dot icon — red to match theme
//   const boundaryIcon = leafletLib?.divIcon({
//     html: `<div style="width:10px;height:10px;border-radius:50%;background:#ef4444;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
//     className: "",
//     iconSize: [10, 10],
//     iconAnchor: [5, 5],
//   });

//   const hasBoundary = boundaryPoints.length >= 3;
//   const pointsNeeded = Math.max(0, 3 - boundaryPoints.length);

//   return (
//     <div className="sm:col-span-2 flex flex-col gap-3">
//       {/* Location search */}
//       <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-2">
//         <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
//           Search location
//         </p>
//         <LocationSearch onSelect={handleLocationSelect} />
//         <p className="text-[10px] text-muted-foreground/60">
//           Type a place name — results from OpenStreetMap. Or click directly on
//           the map below.
//         </p>
//       </div>

//       {/* Geo banners */}
//       {geoStatus === "asking" && (
//         <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/20">
//           <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
//           <span className="text-[12px] font-semibold text-primary">
//             Requesting your location…
//           </span>
//         </div>
//       )}
//       {geoStatus === "denied" && geoError && (
//         <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
//           <MapPin size={13} className="text-amber-500 shrink-0" />
//           <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
//             {geoError}
//           </span>
//         </div>
//       )}
//       {geoStatus === "granted" && !lat && (
//         <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-green-500/5 border border-green-500/20">
//           <LocateFixed size={13} className="text-green-500 shrink-0" />
//           <span className="text-[11px] font-semibold text-green-700 dark:text-green-400">
//             Location found — click the map to pin the property
//           </span>
//         </div>
//       )}

//       {/* Toolbar */}
//       <div className="flex items-center gap-2 flex-wrap">
//         {/* Tile switcher */}
//         <div className="flex items-center gap-0.5 bg-muted/60 border border-border/50 rounded-xl p-1">
//           {(Object.keys(TILE_STYLES) as TileKey[]).map((k) => (
//             <button
//               key={k}
//               type="button"
//               onClick={() => setTileKey(k)}
//               className={cn(
//                 "px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all",
//                 tileKey === k
//                   ? "bg-background text-foreground shadow-sm border border-border/40"
//                   : "text-muted-foreground hover:text-foreground",
//               )}
//             >
//               {TILE_STYLES[k].label}
//             </button>
//           ))}
//         </div>

//         {/* GPS button */}
//         <button
//           type="button"
//           onClick={goToCurrentLocation}
//           disabled={geoStatus === "asking"}
//           className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/50 bg-background hover:bg-muted/60 text-[11px] font-bold transition-colors disabled:opacity-50 shadow-sm"
//         >
//           <LocateFixed size={12} className="text-primary" />
//           {geoStatus === "asking" ? "Locating…" : "My location"}
//         </button>

//         {/* Boundary draw toggle */}
//         <button
//           type="button"
//           onClick={() => setDrawMode((v) => !v)}
//           className={cn(
//             "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all",
//             drawMode
//               ? "bg-rose-500 text-white border-rose-500 shadow-sm"
//               : "border-border/50 bg-background hover:bg-muted/60 text-muted-foreground shadow-sm",
//           )}
//         >
//           <Pentagon size={12} />
//           {drawMode ? "Drawing…" : "Draw boundary"}
//         </button>

//         {boundaryPoints.length > 0 && (
//           <button
//             type="button"
//             onClick={() => onBoundaryChange([])}
//             className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 text-[11px] font-bold text-destructive transition-colors"
//           >
//             <Trash2 size={11} /> Clear boundary
//           </button>
//         )}

//         {lat && lng && (
//           <button
//             type="button"
//             onClick={onClear}
//             className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 text-[11px] font-bold text-destructive transition-colors"
//           >
//             <X size={11} /> Clear pin
//           </button>
//         )}
//       </div>

//       {/* Map container */}
//       <div className="relative rounded-2xl overflow-hidden border border-border/60 shadow-sm">
//         {/* Pin status badge */}
//         <div className="absolute top-3 right-3 z-[1000]">
//           {lat && lng ? (
//             <div className="flex items-center gap-1.5 bg-green-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg">
//               <Check size={10} /> Pin set
//             </div>
//           ) : (
//             <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white/80 text-[10px] font-bold px-3 py-1.5 rounded-full">
//               <Crosshair size={10} />{" "}
//               {drawMode ? "Click to draw" : "Click to pin"}
//             </div>
//           )}
//         </div>

//         {/* Draw mode hint */}
//         {drawMode && (
//           <div className="absolute bottom-[72px] left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 bg-rose-500 text-white text-[11px] font-bold px-4 py-2 rounded-full shadow-lg whitespace-nowrap">
//             <Pentagon size={12} />
//             {boundaryPoints.length === 0
//               ? "Click to start drawing boundary"
//               : `${boundaryPoints.length} point${boundaryPoints.length !== 1 ? "s" : ""} — keep clicking to add more`}
//           </div>
//         )}

//         <link
//           rel="stylesheet"
//           href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
//         />

//         <div style={{ height: "380px" }}>
//           {leafletReady && leafletLib ? (
//             <MapContainer
//               center={[centreLat, centreLng]}
//               zoom={lat ? 17 : 13}
//               className="h-full w-full"
//               zoomControl
//               style={{ cursor: drawMode ? "crosshair" : "default" }}
//             >
//               <TileLayer
//                 key={tileKey}
//                 url={TILE_STYLES[tileKey].url}
//                 attribution={TILE_STYLES[tileKey].attribution}
//               />

//               <MapClickHandler
//                 onMapClick={handleMapClick}
//                 useMapEventsHook={leafletLib.useMapEvents}
//               />

//               {/* Fly to whenever flyTarget changes */}
//               {flyTarget && (
//                 <FlyTo
//                   lat={flyTarget[0]}
//                   lng={flyTarget[1]}
//                   useMapHook={leafletLib.useMap}
//                 />
//               )}

//               {/* Property pin */}
//               {lat && lng && pinIcon && (
//                 <Marker
//                   position={[lat, lng]}
//                   icon={pinIcon}
//                   draggable
//                   // @ts-expect-error
//                   eventHandlers={{
//                     dragend(e: {
//                       target: { getLatLng: () => { lat: number; lng: number } };
//                     }) {
//                       const p = e.target.getLatLng();
//                       onChange(p.lat, p.lng);
//                     },
//                   }}
//                 >
//                   <Popup>
//                     <div className="p-1.5 min-w-[140px]">
//                       <p className="text-xs font-bold mb-1">Property pin</p>
//                       <p className="text-[10px] text-muted-foreground font-mono">
//                         {lat.toFixed(6)}, {lng.toFixed(6)}
//                       </p>
//                       <p className="text-[10px] text-muted-foreground mt-1">
//                         Drag to reposition
//                       </p>
//                     </div>
//                   </Popup>
//                 </Marker>
//               )}

//               {/* Boundary polygon — render as soon as we have 2+ points so user gets visual feedback */}
//               {boundaryPoints.length >= 2 && (
//                 <Polygon
//                   positions={boundaryPoints}
//                   pathOptions={{
//                     color: "#ef4444",
//                     fillColor: "#ef4444",
//                     fillOpacity: 0.12,
//                     weight: 2,
//                     dashArray: "6 4",
//                   }}
//                 />
//               )}

//               {/* Boundary point markers — click to remove */}
//               {boundaryPoints.map((pt, i) =>
//                 boundaryIcon ? (
//                   <Marker
//                     key={i}
//                     position={pt}
//                     icon={boundaryIcon}
//                     // @ts-expect-error
//                     eventHandlers={{
//                       click() {
//                         removeBoundaryPoint(i);
//                       },
//                     }}
//                   >
//                     <Popup>
//                       <span className="text-[10px]">
//                         Click to remove point {i + 1}
//                       </span>
//                     </Popup>
//                   </Marker>
//                 ) : null,
//               )}
//             </MapContainer>
//           ) : (
//             <div className="h-full bg-muted flex items-center justify-center">
//               <div className="flex flex-col items-center gap-3">
//                 <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
//                 <p className="text-xs text-muted-foreground font-medium">
//                   Loading map…
//                 </p>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Coordinate display */}
//       {lat && lng && (
//         <div className="grid grid-cols-2 gap-2">
//           <div className="bg-muted/40 border border-border/50 rounded-xl px-3 py-2.5">
//             <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">
//               Latitude
//             </p>
//             <p className="text-[13px] font-mono font-bold">{lat.toFixed(6)}</p>
//           </div>
//           <div className="bg-muted/40 border border-border/50 rounded-xl px-3 py-2.5">
//             <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">
//               Longitude
//             </p>
//             <p className="text-[13px] font-mono font-bold">{lng.toFixed(6)}</p>
//           </div>
//         </div>
//       )}

//       {/* Boundary info */}
//       {boundaryPoints.length > 0 && (
//         <div
//           className={cn(
//             "rounded-xl px-4 py-3 border",
//             hasBoundary
//               ? "bg-rose-500/5 border-rose-500/20"
//               : "bg-amber-500/5 border-amber-500/20",
//           )}
//         >
//           <div className="flex items-center justify-between mb-2">
//             <p
//               className={cn(
//                 "text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5",
//                 hasBoundary
//                   ? "text-rose-600 dark:text-rose-400"
//                   : "text-amber-600 dark:text-amber-400",
//               )}
//             >
//               <Pentagon size={11} />
//               Boundary — {boundaryPoints.length} point
//               {boundaryPoints.length !== 1 ? "s" : ""}
//               {hasBoundary && (
//                 <span className="text-green-600 dark:text-green-400 ml-1">
//                   ✓ polygon closed
//                 </span>
//               )}
//             </p>
//             {!hasBoundary && (
//               <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
//                 {pointsNeeded} more to close
//               </span>
//             )}
//           </div>
//           <div className="flex flex-wrap gap-1.5">
//             {boundaryPoints.map((pt, i) => (
//               <button
//                 key={i}
//                 type="button"
//                 onClick={() => removeBoundaryPoint(i)}
//                 className="flex items-center gap-1 bg-rose-500/10 hover:bg-destructive/15 border border-rose-500/20 hover:border-destructive/30 rounded-lg px-2 py-1 text-[10px] font-mono transition-colors group"
//               >
//                 <span className="text-rose-700 dark:text-rose-400 group-hover:text-destructive">
//                   {pt[0].toFixed(4)}, {pt[1].toFixed(4)}
//                 </span>
//                 <X
//                   size={9}
//                   className="text-muted-foreground group-hover:text-destructive"
//                 />
//               </button>
//             ))}
//           </div>
//         </div>
//       )}

//       <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
//         Search a location above or click the map to drop a pin. Drag the pin to
//         fine-tune. Use{" "}
//         <strong className="text-foreground/70">Draw boundary</strong> to outline
//         the land area — click to add any number of points. This step is optional
//         and can be set later.
//       </p>
//     </div>
//   );
// }

// // ── Image thumbnail component ────────────────────────────────────────────
// // Blob URLs (from URL.createObjectURL) are synchronous — the browser already
// // has the data in memory and paints the <img> before onLoad fires.
// // Gating visibility on a `loaded` state causes permanent opacity-0 flicker.
// // Fix: always show the img; layer overlays on top instead.
// function ImageThumb({
//   src,
//   label,
//   badge,
//   badgeColor,
//   progress,
//   failed,
//   onRemove,
// }: {
//   src: string;
//   label?: string;
//   badge?: string;
//   badgeColor?: string;
//   progress?: number;
//   failed?: boolean;
//   onRemove: () => void;
// }) {
//   // Derive display state from progress value:
//   //   undefined → just added, no upload started yet
//   //   0 – 99   → uploading
//   //   100      → complete
//   //   -1       → failed  (also via failed prop)
//   const isUploading =
//     typeof progress === "number" && progress >= 0 && progress < 100;
//   const isDone = progress === 100;
//   const isFailed = failed === true || progress === -1;

//   return (
//     <div className="relative group rounded-xl overflow-hidden border border-border/50 bg-muted aspect-square">
//       {/* Image — unconditionally visible; bg-muted shows through for remote URLs still loading */}
//       <img
//         src={src}
//         alt={label ?? "preview"}
//         className="absolute inset-0 w-full h-full object-cover"
//       />

//       {/* Uploading progress overlay */}
//       {isUploading && (
//         <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 px-3">
//           <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
//             <div
//               className="bg-white h-1.5 rounded-full transition-all duration-300"
//               style={{ width: `${progress}%` }}
//             />
//           </div>
//           <span className="text-white text-[11px] font-bold tabular-nums">
//             {progress}%
//           </span>
//         </div>
//       )}

//       {/* Done — green check */}
//       {isDone && (
//         <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-md">
//           <Check size={12} className="text-white" />
//         </div>
//       )}

//       {/* Label badge (e.g. "Saved") for existing images */}
//       {badge && !isUploading && !isFailed && (
//         <div
//           className={cn(
//             "absolute top-2 left-2 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase shadow",
//             badgeColor ?? "bg-blue-500",
//           )}
//         >
//           {badge}
//         </div>
//       )}

//       {/* Failed overlay */}
//       {isFailed && (
//         <div className="absolute inset-0 bg-destructive/85 flex flex-col items-center justify-center gap-1.5">
//           <AlertCircle size={18} className="text-white" />
//           <span className="text-white text-[10px] font-bold">
//             Upload failed
//           </span>
//         </div>
//       )}

//       {/* Remove button */}
//       <button
//         type="button"
//         onClick={onRemove}
//         disabled={isUploading}
//         className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow disabled:opacity-30 disabled:cursor-not-allowed"
//       >
//         <X size={11} />
//       </button>
//     </div>
//   );
// }

// // ── Main Form ─────────────────────────────────────────────────────────
// export default function PropertyForm({
//   initialData,
//   initialBoundary = [],
//   existingImages: initialExistingImages,
//   propertyId,
//   onSubmit,
//   isSubmitting = false,
//   buttonText = "Save Property",
// }: PropertyFormProps) {
//   const [step, setStep] = useState(0);
//   const [direction, setDirection] = useState<"forward" | "back">("forward");
//   const [animating, setAnimating] = useState(false);
//   const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

//   const [images, setImages] = useState<PreviewFile[]>([]);
//   const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
//   const [deletedFileIds, setDeletedFileIds] = useState<string[]>([]);
//   const [uploading, setUploading] = useState(false);

//   // Boundary persists across steps
//   const [boundaryPoints, setBoundaryPoints] =
//     useState<[number, number][]>(initialBoundary);

//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     watch,
//     trigger,
//     formState: { errors },
//   } = useForm<PropertyFormValues>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       title: initialData?.title || "",
//       price: initialData?.price || 0,
//       location: initialData?.location || "",
//       description: initialData?.description || "",
//       category: initialData?.category || "",
//       status: initialData?.status || "available",
//       area: initialData?.area || "",
//       face: initialData?.face || "",
//       roadType: initialData?.roadType || "",
//       roadAccess: initialData?.roadAccess || "",
//       negotiable: initialData?.negotiable ?? false,
//       municipality: initialData?.municipality || "",
//       wardNo: initialData?.wardNo || "",
//       ringRoad: initialData?.ringRoad || "",
//       latitude: initialData?.latitude,
//       longitude: initialData?.longitude,
//       nearHospital: initialData?.nearHospital || "",
//       nearAirport: initialData?.nearAirport || "",
//       nearSupermarket: initialData?.nearSupermarket || "",
//       nearSchool: initialData?.nearSchool || "",
//       nearGym: initialData?.nearGym || "",
//       nearTransport: initialData?.nearTransport || "",
//       nearAtm: initialData?.nearAtm || "",
//       nearRestaurant: initialData?.nearRestaurant || "",
//     },
//   });

//   const negotiable = watch("negotiable");
//   const locationValue = watch("location");
//   const categoryValue = watch("category");
//   const statusValue = watch("status");
//   const faceValue = watch("face");
//   const roadTypeValue = watch("roadType");
//   const latValue = watch("latitude");
//   const lngValue = watch("longitude");

//   const { data: fetchedImages = [], isLoading: loadingExisting } =
//     usePropertyImages(propertyId);

//   useEffect(() => {
//     if (fetchedImages.length)
//       setExistingImages(fetchedImages as ExistingImage[]);
//     else if (!propertyId && initialExistingImages?.length)
//       setExistingImages(initialExistingImages);
//   }, [fetchedImages, propertyId, initialExistingImages]);

//   // ── Navigation ──────────────────────────────────────────────────────
//   async function goNext() {
//     const valid = await trigger(STEP_FIELDS[step]);
//     if (!valid) return;
//     setCompletedSteps((prev) => new Set(prev).add(step));
//     setDirection("forward");
//     setAnimating(true);
//     setTimeout(() => {
//       setStep((s) => s + 1);
//       setAnimating(false);
//     }, 180);
//   }

//   function goBack() {
//     setDirection("back");
//     setAnimating(true);
//     setTimeout(() => {
//       setStep((s) => s - 1);
//       setAnimating(false);
//     }, 180);
//   }

//   function jumpTo(target: number) {
//     const canJump =
//       target < step ||
//       completedSteps.has(target) ||
//       completedSteps.has(target - 1);
//     if (!canJump) return;
//     setDirection(target > step ? "forward" : "back");
//     setAnimating(true);
//     setTimeout(() => {
//       setStep(target);
//       setAnimating(false);
//     }, 180);
//   }

//   // ── Image handling ──────────────────────────────────────────────────
//   function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
//     const files = e.target.files;
//     if (!files || files.length === 0) return;
//     // Use functional update so React always sees the latest state
//     setImages((prev) => [
//       ...prev,
//       ...Array.from(files).map((file) => ({
//         file,
//         url: URL.createObjectURL(file),
//         uploadProgress: undefined,
//         fileId: undefined,
//       })),
//     ]);
//     // Reset so the same file can be re-selected
//     e.target.value = "";
//   }

//   function removeNewImage(index: number) {
//     setImages((prev) => {
//       URL.revokeObjectURL(prev[index].url);
//       return prev.filter((_, i) => i !== index);
//     });
//   }

//   function removeExistingImage(imageId: string) {
//     setDeletedFileIds((prev) => [...prev, imageId]);
//     setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
//   }

//   async function uploadImages(): Promise<string[]> {
//     if (!images.length) return [];
//     setUploading(true);
//     const fileIds: string[] = [];

//     for (let i = 0; i < images.length; i++) {
//       const img = images[i];
//       if (img.fileId) {
//         fileIds.push(img.fileId);
//         continue;
//       }

//       const fd = new FormData();
//       fd.append("file", img.file);
//       fd.append("isPrivate", "true");

//       setImages((prev) =>
//         prev.map((p, idx) => (idx === i ? { ...p, uploadProgress: 10 } : p)),
//       );

//       let fakeProgress = 10;
//       const interval = setInterval(() => {
//         fakeProgress = Math.min(
//           fakeProgress + Math.floor(Math.random() * 15 + 5),
//           85,
//         );
//         const captured = fakeProgress;
//         setImages((prev) =>
//           prev.map((p, idx) =>
//             idx === i &&
//             typeof p.uploadProgress === "number" &&
//             p.uploadProgress < 100 &&
//             p.uploadProgress !== -1
//               ? { ...p, uploadProgress: captured }
//               : p,
//           ),
//         );
//       }, 300);

//       try {
//         const res = await fetch("/api/files/upload", {
//           method: "POST",
//           body: fd,
//         });
//         clearInterval(interval);
//         if (!res.ok) throw new Error(`Upload failed for ${img.file.name}`);
//         const data = await res.json();
//         setImages((prev) =>
//           prev.map((p, idx) =>
//             idx === i
//               ? { ...p, uploadProgress: 100, fileId: data.file._id }
//               : p,
//           ),
//         );
//         fileIds.push(data.file._id);
//       } catch (error) {
//         clearInterval(interval);
//         setImages((prev) =>
//           prev.map((p, idx) => (idx === i ? { ...p, uploadProgress: -1 } : p)),
//         );
//         setUploading(false);
//         throw error;
//       }
//     }

//     setUploading(false);
//     return fileIds;
//   }

//   async function onFormSubmit(values: PropertyFormValues) {
//     try {
//       const newFileIds = await uploadImages();
//       onSubmit({
//         ...values,
//         fileIds: newFileIds,
//         deletedFileIds,
//         boundaryPoints,
//       });
//     } catch (error) {
//       console.error(error);
//     }
//   }

//   const currentStep = STEPS[step];

//   return (
//     <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
//       {/* Always-mounted, hidden file input */}
//       <input
//         ref={fileInputRef}
//         type="file"
//         multiple
//         // accept="image/*"
//         onChange={handleImageChange}
//         className="hidden"
//       />

//       {/* ── MAIN LAYOUT: vertical rail left + content right ──────── */}
//       <div className="flex rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden min-h-[520px]">
//         {/* ── LEFT: Vertical step rail (desktop) ─────────────────── */}
//         <div className="hidden sm:flex flex-col w-[172px] shrink-0 bg-muted/30 border-r border-border/50 pt-5 pb-4 px-3 gap-0.5 relative">
//           {/* Vertical track */}
//           <div className="absolute left-[43px] top-[64px] bottom-[64px] w-px bg-border/60" />
//           {/* Animated progress fill */}
//           <div
//             className="absolute left-[43px] top-[64px] w-px bg-primary transition-all duration-500 ease-out"
//             style={{
//               height: `calc((${step} / ${STEPS.length - 1}) * (100% - 128px))`,
//             }}
//           />

//           {STEPS.map((s) => {
//             const Icon = s.icon;
//             const isCompleted = completedSteps.has(s.id);
//             const isCurrent = step === s.id;
//             const isReachable =
//               s.id < step ||
//               completedSteps.has(s.id) ||
//               completedSteps.has(s.id - 1);
//             return (
//               <button
//                 key={s.id}
//                 type="button"
//                 onClick={() => jumpTo(s.id)}
//                 disabled={!isReachable && !isCurrent}
//                 className={cn(
//                   "relative flex items-center gap-2.5 px-2 py-2 rounded-xl transition-all text-left group disabled:cursor-not-allowed",
//                   isCurrent &&
//                     "bg-background shadow-sm border border-border/40",
//                   !isCurrent && isReachable && "hover:bg-background/60",
//                 )}
//               >
//                 {/* Dot */}
//                 <div
//                   className={cn(
//                     "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 shrink-0 z-10",
//                     isCurrent && `${s.border} ${s.accent} text-white shadow`,
//                     isCompleted &&
//                       !isCurrent &&
//                       "border-primary bg-primary text-white",
//                     !isCurrent &&
//                       !isCompleted &&
//                       "border-border bg-background text-muted-foreground",
//                   )}
//                 >
//                   {isCompleted && !isCurrent ? (
//                     <Check size={12} />
//                   ) : (
//                     <Icon size={12} />
//                   )}
//                 </div>
//                 {/* Label */}
//                 <div className="min-w-0 flex-1">
//                   <p
//                     className={cn(
//                       "text-[11px] font-bold leading-tight truncate",
//                       isCurrent
//                         ? "text-foreground"
//                         : isReachable
//                           ? "text-muted-foreground"
//                           : "text-muted-foreground/40",
//                     )}
//                   >
//                     {s.label}
//                   </p>
//                   {isCurrent && (
//                     <p className="text-[9px] text-muted-foreground/60 mt-0.5">
//                       {s.id + 1} / {STEPS.length}
//                     </p>
//                   )}
//                 </div>
//               </button>
//             );
//           })}

//           {/* Boundary badge pinned to bottom of rail */}
//           {boundaryPoints.length >= 3 && (
//             <div className="mt-auto pt-2 mx-1">
//               <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-bold px-2.5 py-1.5 rounded-xl">
//                 <Pentagon size={10} /> {boundaryPoints.length} pts
//               </div>
//             </div>
//           )}
//         </div>

//         {/* ── RIGHT: Content + nav ─────────────────────────────────── */}
//         <div className="flex-1 min-w-0 flex flex-col">
//           {/* Mobile: compact dot progress bar */}
//           <div className="sm:hidden flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-muted/20">
//             {STEPS.map((s) => {
//               const isCompleted = completedSteps.has(s.id);
//               const isCurrent = step === s.id;
//               return (
//                 <div
//                   key={s.id}
//                   className={cn(
//                     "h-1.5 rounded-full flex-1 transition-all duration-300",
//                     isCurrent ? `${s.accent}` : "",
//                     isCompleted && !isCurrent ? "bg-primary" : "",
//                     !isCurrent && !isCompleted ? "bg-border" : "",
//                   )}
//                 />
//               );
//             })}
//             <span className="text-[11px] font-bold text-foreground ml-1 shrink-0">
//               {currentStep.label}
//             </span>
//           </div>

//           {/* Step content — scrollable inside the card */}
//           <div className="flex-1 overflow-y-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border/50">
//             <div
//               className={cn(
//                 "p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-200 ease-out",
//                 animating &&
//                   direction === "forward" &&
//                   "opacity-0 translate-x-2",
//                 animating && direction === "back" && "opacity-0 -translate-x-2",
//                 !animating && "opacity-100 translate-x-0",
//               )}
//             >
//               {/* ── STEP 0: Basic Info ── */}
//               {step === 0 && (
//                 <>
//                   <Field
//                     label="Property Title"
//                     error={errors.title?.message}
//                     className="sm:col-span-2"
//                   >
//                     <Input
//                       placeholder="e.g. Modern Villa at Baneshwor"
//                       className="h-10 rounded-xl text-sm"
//                       {...register("title")}
//                     />
//                   </Field>
//                   <Field
//                     label="Price (NPR)"
//                     error={errors.price?.message}
//                     hint="Enter the full price in Nepalese Rupees"
//                   >
//                     <Input
//                       type="number"
//                       placeholder="e.g. 12500000"
//                       className="h-10 rounded-xl text-sm"
//                       {...register("price", { valueAsNumber: true })}
//                     />
//                   </Field>
//                   <Field label="Location" error={errors.location?.message}>
//                     <Select
//                       onValueChange={(v) => setValue("location", v)}
//                       value={locationValue}
//                     >
//                       <SelectTrigger className="h-10 rounded-xl text-sm w-full">
//                         <SelectValue placeholder="Select district" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {["Kathmandu", "Lalitpur", "Bhaktapur"].map((l) => (
//                           <SelectItem key={l} value={l}>
//                             {l}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </Field>
//                   <Field label="Property Type" error={errors.category?.message}>
//                     <Select
//                       onValueChange={(v) => setValue("category", v)}
//                       value={categoryValue}
//                     >
//                       <SelectTrigger className="h-10 rounded-xl text-sm w-full">
//                         <SelectValue placeholder="Select type" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {["House", "Apartment", "Land", "Colony"].map((t) => (
//                           <SelectItem key={t} value={t}>
//                             {t}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </Field>
//                   <Field label="Status" error={errors.status?.message}>
//                     <Select
//                       onValueChange={(v) =>
//                         setValue("status", v as PropertyStatus)
//                       }
//                       value={statusValue}
//                     >
//                       <SelectTrigger className="h-10 rounded-xl text-sm w-full">
//                         <SelectValue placeholder="Select status" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="available">Available</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </Field>
//                   <Field
//                     label="Description"
//                     className="sm:col-span-2"
//                     hint="Describe the property, surroundings and highlights"
//                   >
//                     <Textarea
//                       placeholder="Describe the property…"
//                       rows={3}
//                       className="rounded-xl text-sm resize-none"
//                       {...register("description")}
//                     />
//                   </Field>
//                 </>
//               )}

//               {/* ── STEP 1: Property Details ── */}
//               {step === 1 && (
//                 <>
//                   <Field
//                     label="Area"
//                     error={errors.area?.message}
//                     hint="e.g. 5 Aana, 3 Ropani, 1050 sq.ft"
//                   >
//                     <Input
//                       placeholder="e.g. 5 Aana"
//                       className="h-10 rounded-xl text-sm"
//                       {...register("area")}
//                     />
//                   </Field>
//                   <Field label="Property Face" error={errors.face?.message}>
//                     <Select
//                       onValueChange={(v) => setValue("face", v)}
//                       value={faceValue}
//                     >
//                       <SelectTrigger className="h-10 rounded-xl text-sm w-full">
//                         <SelectValue placeholder="Select facing" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {[
//                           "North",
//                           "South",
//                           "East",
//                           "West",
//                           "North-East",
//                           "North-West",
//                           "South-East",
//                           "South-West",
//                         ].map((f) => (
//                           <SelectItem key={f} value={f}>
//                             {f}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </Field>
//                   <Field label="Road Type" error={errors.roadType?.message}>
//                     <Select
//                       onValueChange={(v) => setValue("roadType", v)}
//                       value={roadTypeValue}
//                     >
//                       <SelectTrigger className="h-10 rounded-xl text-sm w-full">
//                         <SelectValue placeholder="Select road type" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {["Blacktopped", "Graveled", "Dirt", "Goreto"].map(
//                           (r) => (
//                             <SelectItem key={r} value={r}>
//                               {r}
//                             </SelectItem>
//                           ),
//                         )}
//                       </SelectContent>
//                     </Select>
//                   </Field>
//                   <Field label="Road Access" hint="Width of the road in feet">
//                     <Input
//                       placeholder="e.g. 13 Feet"
//                       className="h-10 rounded-xl text-sm"
//                       {...register("roadAccess")}
//                     />
//                   </Field>
//                   <div className="sm:col-span-2 flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20">
//                     <div>
//                       <p className="text-xs font-black uppercase tracking-widest">
//                         Negotiable
//                       </p>
//                       <p className="text-[11px] text-muted-foreground mt-0.5">
//                         Is the price open to negotiation?
//                       </p>
//                     </div>
//                     <Switch
//                       checked={negotiable}
//                       onCheckedChange={(v) => setValue("negotiable", v)}
//                     />
//                   </div>
//                 </>
//               )}

//               {/* ── STEP 2: Location Details ── */}
//               {step === 2 && (
//                 <>
//                   <Field label="Municipality">
//                     <Input
//                       placeholder="e.g. Suryabinayak Municipality"
//                       className="h-10 rounded-xl text-sm"
//                       {...register("municipality")}
//                     />
//                   </Field>
//                   <Field label="Ward No.">
//                     <Input
//                       placeholder="e.g. 07"
//                       className="h-10 rounded-xl text-sm"
//                       {...register("wardNo")}
//                     />
//                   </Field>
//                   <Field
//                     label="Distance from Ring Road"
//                     className="sm:col-span-2"
//                     hint="Approximate distance to the nearest ring road"
//                   >
//                     <Input
//                       placeholder="e.g. 4 km"
//                       className="h-10 rounded-xl text-sm"
//                       {...register("ringRoad")}
//                     />
//                   </Field>
//                 </>
//               )}

//               {/* ── STEP 3: Map Pin + Boundary ── */}
//               {step === 3 && (
//                 <LeafletMapPicker
//                   lat={latValue && latValue !== 0 ? latValue : undefined}
//                   lng={lngValue && lngValue !== 0 ? lngValue : undefined}
//                   boundaryPoints={boundaryPoints}
//                   onChange={(la, ln) => {
//                     setValue("latitude", la, { shouldDirty: true });
//                     setValue("longitude", ln, { shouldDirty: true });
//                   }}
//                   onClear={() => {
//                     setValue("latitude", undefined, { shouldDirty: true });
//                     setValue("longitude", undefined, { shouldDirty: true });
//                   }}
//                   onBoundaryChange={setBoundaryPoints}
//                 />
//               )}

//               {/* ── STEP 4: Nearby Facilities ── */}
//               {step === 4 &&
//                 [
//                   {
//                     field: "nearHospital" as const,
//                     label: "Hospital",
//                     hint: "e.g. 500m",
//                   },
//                   {
//                     field: "nearAirport" as const,
//                     label: "Airport",
//                     hint: "e.g. 8 km",
//                   },
//                   {
//                     field: "nearSupermarket" as const,
//                     label: "Supermarket",
//                     hint: "e.g. 300m",
//                   },
//                   {
//                     field: "nearSchool" as const,
//                     label: "School",
//                     hint: "e.g. 200m",
//                   },
//                   {
//                     field: "nearGym" as const,
//                     label: "Gym",
//                     hint: "e.g. 1 km",
//                   },
//                   {
//                     field: "nearTransport" as const,
//                     label: "Public Transport",
//                     hint: "e.g. 100m",
//                   },
//                   {
//                     field: "nearAtm" as const,
//                     label: "ATM",
//                     hint: "e.g. 150m",
//                   },
//                   {
//                     field: "nearRestaurant" as const,
//                     label: "Restaurant",
//                     hint: "e.g. 400m",
//                   },
//                 ].map(({ field, label, hint }) => (
//                   <Field key={field} label={label} hint={hint}>
//                     <Input
//                       placeholder={hint}
//                       className="h-10 rounded-xl text-sm"
//                       {...register(field)}
//                     />
//                   </Field>
//                 ))}

//               {/* ── STEP 5: Images ── */}
//               {step === 5 && (
//                 <div className="sm:col-span-2 space-y-4">
//                   {loadingExisting ? (
//                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
//                       {[1, 2, 3, 4].map((i) => (
//                         <div
//                           key={i}
//                           className="aspect-square rounded-xl bg-muted animate-pulse"
//                         />
//                       ))}
//                     </div>
//                   ) : (
//                     <>
//                       {existingImages.length === 0 && images.length === 0 && (
//                         <button
//                           type="button"
//                           onClick={() => fileInputRef.current?.click()}
//                           className="w-full flex flex-col items-center justify-center gap-3 py-10 border-2 border-dashed border-border hover:border-primary rounded-2xl bg-muted/10 hover:bg-primary/5 transition-colors group"
//                         >
//                           <div className="w-12 h-12 rounded-2xl bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
//                             <Upload
//                               size={20}
//                               className="text-muted-foreground group-hover:text-primary transition-colors"
//                             />
//                           </div>
//                           <div className="text-center">
//                             <p className="text-sm font-bold text-foreground">
//                               Click to upload images
//                             </p>
//                             <p className="text-[11px] text-muted-foreground mt-0.5">
//                               PNG, JPG, WEBP — max 10 images
//                             </p>
//                           </div>
//                         </button>
//                       )}

//                       {(existingImages.length > 0 || images.length > 0) && (
//                         <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
//                           {existingImages.map((img) => (
//                             <ImageThumb
//                               key={img.id}
//                               src={img.url}
//                               label={img.filename}
//                               badge="Saved"
//                               badgeColor="bg-blue-500"
//                               onRemove={() => removeExistingImage(img.id)}
//                             />
//                           ))}
//                           {images.map((img, i) => (
//                             <ImageThumb
//                               key={i}
//                               src={img.url}
//                               progress={img.uploadProgress}
//                               failed={img.uploadProgress === -1}
//                               onRemove={() => removeNewImage(i)}
//                             />
//                           ))}
//                           <button
//                             type="button"
//                             onClick={() => fileInputRef.current?.click()}
//                             disabled={uploading}
//                             className="aspect-square border-2 border-dashed border-border hover:border-primary rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-primary/5 transition-colors disabled:opacity-40"
//                           >
//                             <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
//                               <Plus
//                                 size={16}
//                                 className="text-muted-foreground"
//                               />
//                             </div>
//                             <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
//                               Add more
//                             </span>
//                           </button>
//                         </div>
//                       )}

//                       {(existingImages.length > 0 || images.length > 0) && (
//                         <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-medium">
//                           {existingImages.length > 0 && (
//                             <span className="flex items-center gap-1">
//                               <Check size={10} className="text-green-500" />
//                               {existingImages.length} saved
//                             </span>
//                           )}
//                           {images.length > 0 && (
//                             <span className="flex items-center gap-1">
//                               <Upload size={10} className="text-primary" />
//                               {images.length} new
//                             </span>
//                           )}
//                           {deletedFileIds.length > 0 && (
//                             <span className="flex items-center gap-1 text-destructive">
//                               <X size={10} />
//                               {deletedFileIds.length} to delete
//                             </span>
//                           )}
//                         </div>
//                       )}
//                     </>
//                   )}
//                 </div>
//               )}
//             </div>
//             {/* end scrollable grid */}
//           </div>
//           {/* end overflow-y-auto */}

//           {/* ── NAV BUTTONS — pinned to bottom of right panel ── */}
//           <div className="flex items-center gap-3 px-5 py-4 border-t border-border/50 bg-muted/10 shrink-0">
//             {step > 0 ? (
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={goBack}
//                 disabled={animating}
//                 className="h-10 px-5 rounded-xl font-bold text-[11px] uppercase tracking-widest"
//               >
//                 <ChevronLeft size={14} className="mr-1" /> Back
//               </Button>
//             ) : (
//               <div />
//             )}

//             {step < STEPS.length - 1 ? (
//               <Button
//                 type="button"
//                 onClick={goNext}
//                 disabled={animating}
//                 className="flex-1 h-10 rounded-xl font-black text-[11px] uppercase tracking-widest"
//               >
//                 {step === 3 && !latValue ? "Skip" : "Next"}{" "}
//                 <ChevronRight size={14} className="ml-1" />
//               </Button>
//             ) : (
//               <Button
//                 type="submit"
//                 size="lg"
//                 disabled={isSubmitting || uploading || animating}
//                 className="flex-1 h-10 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-md"
//               >
//                 {uploading
//                   ? "Uploading…"
//                   : isSubmitting
//                     ? "Saving…"
//                     : buttonText}
//               </Button>
//             )}
//           </div>
//         </div>
//         {/* end right panel */}
//       </div>
//       {/* end main layout */}
//     </form>
//   );
// }

// "use client";

// import { useState, useRef, useEffect, useCallback } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import dynamic from "next/dynamic";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Switch } from "@/components/ui/switch";
// import {
//   X,
//   Plus,
//   CheckCircle2,
//   ChevronLeft,
//   ChevronRight,
//   Info,
//   Building2,
//   MapPin,
//   Utensils,
//   ImageIcon,
//   Check,
//   LocateFixed,
//   Map,
//   Crosshair,
//   Trash2,
//   Pentagon,
//   Search,
//   Upload,
//   AlertCircle,
// } from "lucide-react";
// import { usePropertyImages } from "@/lib/client/queries/properties.queries";
// import { cn } from "@/lib/utils";

// // ── Schema ────────────────────────────────────────────────────────────
// const formSchema = z.object({
//   title: z.string().min(3, "Title must be at least 3 characters"),
//   price: z.number().positive("Price must be positive"),
//   location: z.string().min(1, "Location is required"),
//   description: z.string().max(5000).optional(),
//   category: z.string().min(1, "Property type is required"),
//   status: z.enum(["available", "booked", "sold"]),
//   area: z.string().min(1, "Area is required"),
//   face: z.string().min(1, "Property Face is required"),
//   roadType: z.string().min(1, "Property Road type is required"),
//   roadAccess: z.string().optional(),
//   negotiable: z.boolean(),
//   municipality: z.string().optional(),
//   wardNo: z.string().optional(),
//   ringRoad: z.string().optional(),
//   latitude: z.number().optional(),
//   longitude: z.number().optional(),
//   nearHospital: z.string().optional(),
//   nearAirport: z.string().optional(),
//   nearSupermarket: z.string().optional(),
//   nearSchool: z.string().optional(),
//   nearGym: z.string().optional(),
//   nearTransport: z.string().optional(),
//   nearAtm: z.string().optional(),
//   nearRestaurant: z.string().optional(),
// });

// export type PropertyStatus = z.infer<typeof formSchema>["status"];
// export type PropertyFormValues = z.infer<typeof formSchema>;

// type PreviewFile = {
//   file: File;
//   url: string;
//   uploadProgress?: number;
//   fileId?: string;
// };
// type ExistingImage = { id: string; url: string; filename: string };

// interface PropertyFormProps {
//   initialData?: Partial<PropertyFormValues>;
//   initialBoundary?: [number, number][];
//   existingImages?: ExistingImage[];
//   propertyId?: string;
//   onSubmit: (
//     values: PropertyFormValues & {
//       fileIds: string[];
//       deletedFileIds: string[];
//       boundaryPoints: [number, number][];
//     },
//   ) => void;
//   isSubmitting?: boolean;
//   buttonText?: string;
// }

// // ── Steps ─────────────────────────────────────────────────────────────
// const STEPS = [
//   {
//     id: 0,
//     label: "Basic Info",
//     short: "Basic",
//     icon: Info,
//     accent: "bg-primary",
//     border: "border-primary",
//     ring: "ring-primary/20",
//   },
//   {
//     id: 1,
//     label: "Property",
//     short: "Property",
//     icon: Building2,
//     accent: "bg-amber-500",
//     border: "border-amber-500",
//     ring: "ring-amber-500/20",
//   },
//   {
//     id: 2,
//     label: "Location",
//     short: "Location",
//     icon: MapPin,
//     accent: "bg-blue-500",
//     border: "border-blue-500",
//     ring: "ring-blue-500/20",
//   },
//   {
//     id: 3,
//     label: "Map Pin",
//     short: "Map",
//     icon: Map,
//     accent: "bg-rose-500",
//     border: "border-rose-500",
//     ring: "ring-rose-500/20",
//   },
//   {
//     id: 4,
//     label: "Facilities",
//     short: "Nearby",
//     icon: Utensils,
//     accent: "bg-green-500",
//     border: "border-green-500",
//     ring: "ring-green-500/20",
//   },
//   {
//     id: 5,
//     label: "Images",
//     short: "Images",
//     icon: ImageIcon,
//     accent: "bg-purple-500",
//     border: "border-purple-500",
//     ring: "ring-purple-500/20",
//   },
// ];

// const STEP_FIELDS: Record<number, (keyof PropertyFormValues)[]> = {
//   0: ["title", "price", "location", "category", "status"],
//   1: ["area", "face", "roadType", "roadAccess", "negotiable"],
//   2: ["municipality", "wardNo", "ringRoad"],
//   3: [],
//   4: [],
//   5: [],
// };

// // ── Tile styles ───────────────────────────────────────────────────────
// const TILE_STYLES = {
//   standard: {
//     label: "Map",
//     url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
//     attribution: "&copy; OpenStreetMap",
//   },
//   satellite: {
//     label: "Satellite",
//     url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
//     attribution: "Esri",
//   },
// };
// type TileKey = keyof typeof TILE_STYLES;

// // ── Nominatim result ──────────────────────────────────────────────────
// interface NominatimResult {
//   place_id: number;
//   display_name: string;
//   lat: string;
//   lon: string;
// }

// // ── Leaflet dynamic imports ───────────────────────────────────────────
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
// const Polygon = dynamic(() => import("react-leaflet").then((m) => m.Polygon), {
//   ssr: false,
// });

// // ── Field wrapper ─────────────────────────────────────────────────────
// function Field({
//   label,
//   error,
//   className,
//   hint,
//   children,
// }: {
//   label: string;
//   error?: string;
//   className?: string;
//   hint?: string;
//   children: React.ReactNode;
// }) {
//   return (
//     <div className={cn("flex flex-col gap-1.5", className)}>
//       <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
//         {label}
//       </Label>
//       {children}
//       {hint && !error && (
//         <p className="text-[11px] text-muted-foreground/70">{hint}</p>
//       )}
//       {error && (
//         <div className="flex items-center gap-1.5">
//           <AlertCircle size={11} className="text-destructive shrink-0" />
//           <p className="text-[11px] text-destructive font-semibold">{error}</p>
//         </div>
//       )}
//     </div>
//   );
// }

// // ── Inner map components ──────────────────────────────────────────────
// function MapClickHandler({
//   onMapClick,
//   useMapEventsHook,
// }: {
//   onMapClick: (lat: number, lng: number) => void;
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   useMapEventsHook: any;
// }) {
//   useMapEventsHook({
//     click(e: { latlng: { lat: number; lng: number } }) {
//       onMapClick(e.latlng.lat, e.latlng.lng);
//     },
//   });
//   return null;
// }

// function FlyTo({
//   lat,
//   lng,
//   useMapHook,
// }: {
//   lat: number;
//   lng: number;
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   useMapHook: any;
// }) {
//   const map = useMapHook();
//   useEffect(() => {
//     map.flyTo([lat, lng], 17, { duration: 0.8 });
//   }, [lat, lng]);
//   return null;
// }

// // ── Location search box using Nominatim (OpenStreetMap free geocoder) ─
// function LocationSearch({
//   onSelect,
// }: {
//   onSelect: (lat: number, lng: number, label: string) => void;
// }) {
//   const [query, setQuery] = useState("");
//   const [results, setResults] = useState<NominatimResult[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [open, setOpen] = useState(false);
//   const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const wrapRef = useRef<HTMLDivElement>(null);

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handler = (e: MouseEvent) => {
//       if (wrapRef.current && !wrapRef.current.contains(e.target as Node))
//         setOpen(false);
//     };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   const search = useCallback(async (q: string) => {
//     if (q.trim().length < 3) {
//       setResults([]);
//       setOpen(false);
//       return;
//     }
//     setLoading(true);
//     try {
//       const res = await fetch(
//         `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&countrycodes=np`,
//         { headers: { "Accept-Language": "en" } },
//       );
//       const data: NominatimResult[] = await res.json();
//       setResults(data);
//       setOpen(data.length > 0);
//     } catch {
//       /* ignore */
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const v = e.target.value;
//     setQuery(v);
//     if (timerRef.current) clearTimeout(timerRef.current);
//     timerRef.current = setTimeout(() => search(v), 400);
//   };

//   return (
//     <div ref={wrapRef} className="relative">
//       <div className="relative">
//         <Search
//           size={13}
//           className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
//         />
//         <input
//           type="text"
//           value={query}
//           onChange={handleInput}
//           onFocus={() => results.length > 0 && setOpen(true)}
//           placeholder="Search location, e.g. Thamel Kathmandu…"
//           className={cn(
//             "w-full h-10 pl-8 pr-10 rounded-xl border border-border/60 bg-background",
//             "text-sm text-foreground placeholder:text-muted-foreground/50",
//             "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all",
//           )}
//         />
//         {loading && (
//           <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
//         )}
//       </div>

//       {open && results.length > 0 && (
//         <div className="absolute top-full left-0 right-0 mt-1.5 z-[2000] bg-card border border-border/60 rounded-xl shadow-2xl overflow-hidden">
//           {results.map((r) => (
//             <button
//               key={r.place_id}
//               type="button"
//               onClick={() => {
//                 onSelect(parseFloat(r.lat), parseFloat(r.lon), r.display_name);
//                 setQuery(r.display_name.split(",").slice(0, 2).join(", "));
//                 setOpen(false);
//               }}
//               className="w-full flex items-start gap-2.5 px-3 py-2.5 hover:bg-muted/60 transition-colors text-left border-b border-border/30 last:border-0"
//             >
//               <MapPin size={12} className="text-primary shrink-0 mt-0.5" />
//               <span className="text-[12px] text-foreground line-clamp-2 leading-snug">
//                 {r.display_name}
//               </span>
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// // ── LeafletMapPicker ──────────────────────────────────────────────────
// interface LeafletMapPickerProps {
//   lat?: number;
//   lng?: number;
//   boundaryPoints: [number, number][];
//   onChange: (lat: number, lng: number) => void;
//   onClear: () => void;
//   onBoundaryChange: (points: [number, number][]) => void;
// }

// function LeafletMapPicker({
//   lat,
//   lng,
//   boundaryPoints,
//   onChange,
//   onClear,
//   onBoundaryChange,
// }: LeafletMapPickerProps) {
//   const [leafletReady, setLeafletReady] = useState(false);
//   const [leafletLib, setLeafletLib] = useState<{
//     useMapEvents: (typeof import("react-leaflet"))["useMapEvents"];
//     useMap: (typeof import("react-leaflet"))["useMap"];
//     divIcon: (typeof import("leaflet"))["divIcon"];
//   } | null>(null);

//   const [geoStatus, setGeoStatus] = useState<
//     "idle" | "asking" | "granted" | "denied"
//   >("idle");
//   const [geoError, setGeoError] = useState("");
//   const [tileKey, setTileKey] = useState<TileKey>("standard");
//   const [drawMode, setDrawMode] = useState(false);
//   // flyTo trigger — set a new value to trigger a fly animation
//   const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);

//   const centreLat = lat ?? 27.7172;
//   const centreLng = lng ?? 85.324;

//   useEffect(() => {
//     Promise.all([import("leaflet"), import("react-leaflet")]).then(
//       ([L, RL]) => {
//         // @ts-expect-error — internal property
//         delete L.Icon.Default.prototype._getIconUrl;
//         L.Icon.Default.mergeOptions({
//           iconRetinaUrl:
//             "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
//           iconUrl:
//             "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
//           shadowUrl:
//             "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
//         });
//         setLeafletLib({
//           useMapEvents: RL.useMapEvents,
//           useMap: RL.useMap,
//           divIcon: L.divIcon,
//         });
//         setLeafletReady(true);
//       },
//     );
//   }, []);

//   useEffect(() => {
//     if (!navigator.geolocation) {
//       setGeoStatus("denied");
//       return;
//     }
//     setGeoStatus("asking");
//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         setGeoStatus("granted");
//         if (!lat && !lng) {
//           onChange(pos.coords.latitude, pos.coords.longitude);
//           setFlyTarget([pos.coords.latitude, pos.coords.longitude]);
//         }
//       },
//       (err) => {
//         setGeoStatus("denied");
//         setGeoError(
//           err.code === 1
//             ? "Location permission denied. Search a location or click the map."
//             : "Could not get location. Search or click the map to set the pin.",
//         );
//       },
//       { enableHighAccuracy: true, timeout: 8000 },
//     );
//   }, []);

//   const handleMapClick = useCallback(
//     (clickLat: number, clickLng: number) => {
//       if (drawMode) {
//         // Allow any number of points — no minimum restriction
//         onBoundaryChange([...boundaryPoints, [clickLat, clickLng]]);
//       } else {
//         onChange(clickLat, clickLng);
//         setFlyTarget([clickLat, clickLng]);
//       }
//     },
//     [drawMode, boundaryPoints, onChange, onBoundaryChange],
//   );

//   const handleLocationSelect = (selLat: number, selLng: number) => {
//     onChange(selLat, selLng);
//     setFlyTarget([selLat, selLng]);
//   };

//   const goToCurrentLocation = () => {
//     if (!navigator.geolocation) return;
//     setGeoStatus("asking");
//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         setGeoStatus("granted");
//         onChange(pos.coords.latitude, pos.coords.longitude);
//         setFlyTarget([pos.coords.latitude, pos.coords.longitude]);
//         setGeoError("");
//       },
//       () => {
//         setGeoStatus("denied");
//         setGeoError("Could not get location.");
//       },
//       { enableHighAccuracy: true, timeout: 8000 },
//     );
//   };

//   const removeBoundaryPoint = (idx: number) => {
//     onBoundaryChange(boundaryPoints.filter((_, i) => i !== idx));
//   };

//   // Custom teardrop pin icon
//   const pinIcon = leafletLib?.divIcon({
//     html: `<div style="
//       width:28px;height:28px;border-radius:50% 50% 50% 0;
//       background:#ef4444;border:3px solid white;
//       transform:rotate(-45deg);box-shadow:0 2px 10px rgba(0,0,0,0.3);
//     "></div>`,
//     className: "",
//     iconSize: [28, 28],
//     iconAnchor: [14, 28],
//     popupAnchor: [0, -32],
//   });

//   // Boundary dot icon — red to match theme
//   const boundaryIcon = leafletLib?.divIcon({
//     html: `<div style="width:10px;height:10px;border-radius:50%;background:#ef4444;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
//     className: "",
//     iconSize: [10, 10],
//     iconAnchor: [5, 5],
//   });

//   const hasBoundary = boundaryPoints.length >= 3;
//   const pointsNeeded = Math.max(0, 3 - boundaryPoints.length);

//   return (
//     <div className="sm:col-span-2 flex flex-col gap-3">
//       {/* Location search */}
//       <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-2">
//         <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
//           Search location
//         </p>
//         <LocationSearch onSelect={handleLocationSelect} />
//         <p className="text-[10px] text-muted-foreground/60">
//           Type a place name — results from OpenStreetMap. Or click directly on
//           the map below.
//         </p>
//       </div>

//       {/* Geo banners */}
//       {geoStatus === "asking" && (
//         <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/20">
//           <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
//           <span className="text-[12px] font-semibold text-primary">
//             Requesting your location…
//           </span>
//         </div>
//       )}
//       {geoStatus === "denied" && geoError && (
//         <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
//           <MapPin size={13} className="text-amber-500 shrink-0" />
//           <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
//             {geoError}
//           </span>
//         </div>
//       )}
//       {geoStatus === "granted" && !lat && (
//         <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-green-500/5 border border-green-500/20">
//           <LocateFixed size={13} className="text-green-500 shrink-0" />
//           <span className="text-[11px] font-semibold text-green-700 dark:text-green-400">
//             Location found — click the map to pin the property
//           </span>
//         </div>
//       )}

//       {/* Toolbar */}
//       <div className="flex items-center gap-2 flex-wrap">
//         {/* Tile switcher */}
//         <div className="flex items-center gap-0.5 bg-muted/60 border border-border/50 rounded-xl p-1">
//           {(Object.keys(TILE_STYLES) as TileKey[]).map((k) => (
//             <button
//               key={k}
//               type="button"
//               onClick={() => setTileKey(k)}
//               className={cn(
//                 "px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all",
//                 tileKey === k
//                   ? "bg-background text-foreground shadow-sm border border-border/40"
//                   : "text-muted-foreground hover:text-foreground",
//               )}
//             >
//               {TILE_STYLES[k].label}
//             </button>
//           ))}
//         </div>

//         {/* GPS button */}
//         <button
//           type="button"
//           onClick={goToCurrentLocation}
//           disabled={geoStatus === "asking"}
//           className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/50 bg-background hover:bg-muted/60 text-[11px] font-bold transition-colors disabled:opacity-50 shadow-sm"
//         >
//           <LocateFixed size={12} className="text-primary" />
//           {geoStatus === "asking" ? "Locating…" : "My location"}
//         </button>

//         {/* Boundary draw toggle */}
//         <button
//           type="button"
//           onClick={() => setDrawMode((v) => !v)}
//           className={cn(
//             "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all",
//             drawMode
//               ? "bg-rose-500 text-white border-rose-500 shadow-sm"
//               : "border-border/50 bg-background hover:bg-muted/60 text-muted-foreground shadow-sm",
//           )}
//         >
//           <Pentagon size={12} />
//           {drawMode ? "Drawing…" : "Draw boundary"}
//         </button>

//         {boundaryPoints.length > 0 && (
//           <button
//             type="button"
//             onClick={() => onBoundaryChange([])}
//             className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 text-[11px] font-bold text-destructive transition-colors"
//           >
//             <Trash2 size={11} /> Clear boundary
//           </button>
//         )}

//         {lat && lng && (
//           <button
//             type="button"
//             onClick={onClear}
//             className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 text-[11px] font-bold text-destructive transition-colors"
//           >
//             <X size={11} /> Clear pin
//           </button>
//         )}
//       </div>

//       {/* Map container */}
//       <div className="relative rounded-2xl overflow-hidden border border-border/60 shadow-sm">
//         {/* Pin status badge */}
//         <div className="absolute top-3 right-3 z-[1000]">
//           {lat && lng ? (
//             <div className="flex items-center gap-1.5 bg-green-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg">
//               <Check size={10} /> Pin set
//             </div>
//           ) : (
//             <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white/80 text-[10px] font-bold px-3 py-1.5 rounded-full">
//               <Crosshair size={10} />{" "}
//               {drawMode ? "Click to draw" : "Click to pin"}
//             </div>
//           )}
//         </div>

//         {/* Draw mode hint */}
//         {drawMode && (
//           <div className="absolute bottom-[72px] left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 bg-rose-500 text-white text-[11px] font-bold px-4 py-2 rounded-full shadow-lg whitespace-nowrap">
//             <Pentagon size={12} />
//             {boundaryPoints.length === 0
//               ? "Click to start drawing boundary"
//               : `${boundaryPoints.length} point${boundaryPoints.length !== 1 ? "s" : ""} — keep clicking to add more`}
//           </div>
//         )}

//         <link
//           rel="stylesheet"
//           href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
//         />

//         <div style={{ height: "380px" }}>
//           {leafletReady && leafletLib ? (
//             <MapContainer
//               center={[centreLat, centreLng]}
//               zoom={lat ? 17 : 13}
//               className="h-full w-full"
//               zoomControl
//               style={{ cursor: drawMode ? "crosshair" : "default" }}
//             >
//               <TileLayer
//                 key={tileKey}
//                 url={TILE_STYLES[tileKey].url}
//                 attribution={TILE_STYLES[tileKey].attribution}
//               />

//               <MapClickHandler
//                 onMapClick={handleMapClick}
//                 useMapEventsHook={leafletLib.useMapEvents}
//               />

//               {/* Fly to whenever flyTarget changes */}
//               {flyTarget && (
//                 <FlyTo
//                   lat={flyTarget[0]}
//                   lng={flyTarget[1]}
//                   useMapHook={leafletLib.useMap}
//                 />
//               )}

//               {/* Property pin */}
//               {lat && lng && pinIcon && (
//                 <Marker
//                   position={[lat, lng]}
//                   icon={pinIcon}
//                   draggable
//                   // @ts-expect-error
//                   eventHandlers={{
//                     dragend(e: {
//                       target: { getLatLng: () => { lat: number; lng: number } };
//                     }) {
//                       const p = e.target.getLatLng();
//                       onChange(p.lat, p.lng);
//                     },
//                   }}
//                 >
//                   <Popup>
//                     <div className="p-1.5 min-w-[140px]">
//                       <p className="text-xs font-bold mb-1">Property pin</p>
//                       <p className="text-[10px] text-muted-foreground font-mono">
//                         {lat.toFixed(6)}, {lng.toFixed(6)}
//                       </p>
//                       <p className="text-[10px] text-muted-foreground mt-1">
//                         Drag to reposition
//                       </p>
//                     </div>
//                   </Popup>
//                 </Marker>
//               )}

//               {/* Boundary polygon — render as soon as we have 2+ points so user gets visual feedback */}
//               {boundaryPoints.length >= 2 && (
//                 <Polygon
//                   positions={boundaryPoints}
//                   pathOptions={{
//                     color: "#ef4444",
//                     fillColor: "#ef4444",
//                     fillOpacity: 0.12,
//                     weight: 2,
//                     dashArray: "6 4",
//                   }}
//                 />
//               )}

//               {/* Boundary point markers — click to remove */}
//               {boundaryPoints.map((pt, i) =>
//                 boundaryIcon ? (
//                   <Marker
//                     key={i}
//                     position={pt}
//                     icon={boundaryIcon}
//                     eventHandlers={{
//                       click() {
//                         removeBoundaryPoint(i);
//                       },
//                     }}
//                   >
//                     <Popup>
//                       <span className="text-[10px]">
//                         Click to remove point {i + 1}
//                       </span>
//                     </Popup>
//                   </Marker>
//                 ) : null,
//               )}
//             </MapContainer>
//           ) : (
//             <div className="h-full bg-muted flex items-center justify-center">
//               <div className="flex flex-col items-center gap-3">
//                 <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
//                 <p className="text-xs text-muted-foreground font-medium">
//                   Loading map…
//                 </p>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Coordinate display */}
//       {lat && lng && (
//         <div className="grid grid-cols-2 gap-2">
//           <div className="bg-muted/40 border border-border/50 rounded-xl px-3 py-2.5">
//             <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">
//               Latitude
//             </p>
//             <p className="text-[13px] font-mono font-bold">{lat.toFixed(6)}</p>
//           </div>
//           <div className="bg-muted/40 border border-border/50 rounded-xl px-3 py-2.5">
//             <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">
//               Longitude
//             </p>
//             <p className="text-[13px] font-mono font-bold">{lng.toFixed(6)}</p>
//           </div>
//         </div>
//       )}

//       {/* Boundary info */}
//       {boundaryPoints.length > 0 && (
//         <div
//           className={cn(
//             "rounded-xl px-4 py-3 border",
//             hasBoundary
//               ? "bg-rose-500/5 border-rose-500/20"
//               : "bg-amber-500/5 border-amber-500/20",
//           )}
//         >
//           <div className="flex items-center justify-between mb-2">
//             <p
//               className={cn(
//                 "text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5",
//                 hasBoundary
//                   ? "text-rose-600 dark:text-rose-400"
//                   : "text-amber-600 dark:text-amber-400",
//               )}
//             >
//               <Pentagon size={11} />
//               Boundary — {boundaryPoints.length} point
//               {boundaryPoints.length !== 1 ? "s" : ""}
//               {hasBoundary && (
//                 <span className="text-green-600 dark:text-green-400 ml-1">
//                   ✓ polygon closed
//                 </span>
//               )}
//             </p>
//             {!hasBoundary && (
//               <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
//                 {pointsNeeded} more to close
//               </span>
//             )}
//           </div>
//           <div className="flex flex-wrap gap-1.5">
//             {boundaryPoints.map((pt, i) => (
//               <button
//                 key={i}
//                 type="button"
//                 onClick={() => removeBoundaryPoint(i)}
//                 className="flex items-center gap-1 bg-rose-500/10 hover:bg-destructive/15 border border-rose-500/20 hover:border-destructive/30 rounded-lg px-2 py-1 text-[10px] font-mono transition-colors group"
//               >
//                 <span className="text-rose-700 dark:text-rose-400 group-hover:text-destructive">
//                   {pt[0].toFixed(4)}, {pt[1].toFixed(4)}
//                 </span>
//                 <X
//                   size={9}
//                   className="text-muted-foreground group-hover:text-destructive"
//                 />
//               </button>
//             ))}
//           </div>
//         </div>
//       )}

//       <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
//         Search a location above or click the map to drop a pin. Drag the pin to
//         fine-tune. Use{" "}
//         <strong className="text-foreground/70">Draw boundary</strong> to outline
//         the land area — click to add any number of points. This step is optional
//         and can be set later.
//       </p>
//     </div>
//   );
// }

// // ── Image thumbnail component ────────────────────────────────────────────
// // Blob URLs (from URL.createObjectURL) are synchronous — the browser already
// // has the data in memory and paints the <img> before onLoad fires.
// // Gating visibility on a `loaded` state causes permanent opacity-0 flicker.
// // Fix: always show the img; layer overlays on top instead.
// function ImageThumb({
//   src,
//   label,
//   badge,
//   badgeColor,
//   progress,
//   failed,
//   onRemove,
// }: {
//   src: string;
//   label?: string;
//   badge?: string;
//   badgeColor?: string;
//   progress?: number;
//   failed?: boolean;
//   onRemove: () => void;
// }) {
//   // Derive display state from progress value:
//   //   undefined → just added, no upload started yet
//   //   0 – 99   → uploading
//   //   100      → complete
//   //   -1       → failed  (also via failed prop)
//   const isUploading =
//     typeof progress === "number" && progress >= 0 && progress < 100;
//   const isDone = progress === 100;
//   const isFailed = failed === true || progress === -1;

//   return (
//     <div className="relative group rounded-xl overflow-hidden border border-border/50 bg-muted aspect-square">
//       {/* Image — unconditionally visible; bg-muted shows through for remote URLs still loading */}
//       <img
//         src={src}
//         alt={label ?? "preview"}
//         className="absolute inset-0 w-full h-full object-cover"
//       />

//       {/* Uploading progress overlay */}
//       {isUploading && (
//         <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 px-3">
//           <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
//             <div
//               className="bg-white h-1.5 rounded-full transition-all duration-300"
//               style={{ width: `${progress}%` }}
//             />
//           </div>
//           <span className="text-white text-[11px] font-bold tabular-nums">
//             {progress}%
//           </span>
//         </div>
//       )}

//       {/* Done — green check */}
//       {isDone && (
//         <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-md">
//           <Check size={12} className="text-white" />
//         </div>
//       )}

//       {/* Label badge (e.g. "Saved") for existing images */}
//       {badge && !isUploading && !isFailed && (
//         <div
//           className={cn(
//             "absolute top-2 left-2 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase shadow",
//             badgeColor ?? "bg-blue-500",
//           )}
//         >
//           {badge}
//         </div>
//       )}

//       {/* Failed overlay */}
//       {isFailed && (
//         <div className="absolute inset-0 bg-destructive/85 flex flex-col items-center justify-center gap-1.5">
//           <AlertCircle size={18} className="text-white" />
//           <span className="text-white text-[10px] font-bold">
//             Upload failed
//           </span>
//         </div>
//       )}

//       {/* Remove button */}
//       <button
//         type="button"
//         onClick={onRemove}
//         disabled={isUploading}
//         className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow disabled:opacity-30 disabled:cursor-not-allowed"
//       >
//         <X size={11} />
//       </button>
//     </div>
//   );
// }

// // ── Main Form ─────────────────────────────────────────────────────────
// export default function PropertyForm({
//   initialData,
//   initialBoundary = [],
//   existingImages: initialExistingImages,
//   propertyId,
//   onSubmit,
//   isSubmitting = false,
//   buttonText = "Save Property",
// }: PropertyFormProps) {
//   const [step, setStep] = useState(0);
//   const [direction, setDirection] = useState<"forward" | "back">("forward");
//   const [animating, setAnimating] = useState(false);
//   const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

//   const [images, setImages] = useState<PreviewFile[]>([]);
//   const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
//   const [deletedFileIds, setDeletedFileIds] = useState<string[]>([]);
//   const [uploading, setUploading] = useState(false);

//   // Boundary persists across steps
//   const [boundaryPoints, setBoundaryPoints] =
//     useState<[number, number][]>(initialBoundary);

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     watch,
//     trigger,
//     formState: { errors },
//   } = useForm<PropertyFormValues>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       title: initialData?.title || "",
//       price: initialData?.price || 0,
//       location: initialData?.location || "",
//       description: initialData?.description || "",
//       category: initialData?.category || "",
//       status: initialData?.status || "available",
//       area: initialData?.area || "",
//       face: initialData?.face || "",
//       roadType: initialData?.roadType || "",
//       roadAccess: initialData?.roadAccess || "",
//       negotiable: initialData?.negotiable ?? false,
//       municipality: initialData?.municipality || "",
//       wardNo: initialData?.wardNo || "",
//       ringRoad: initialData?.ringRoad || "",
//       latitude: initialData?.latitude,
//       longitude: initialData?.longitude,
//       nearHospital: initialData?.nearHospital || "",
//       nearAirport: initialData?.nearAirport || "",
//       nearSupermarket: initialData?.nearSupermarket || "",
//       nearSchool: initialData?.nearSchool || "",
//       nearGym: initialData?.nearGym || "",
//       nearTransport: initialData?.nearTransport || "",
//       nearAtm: initialData?.nearAtm || "",
//       nearRestaurant: initialData?.nearRestaurant || "",
//     },
//   });

//   const negotiable = watch("negotiable");
//   const locationValue = watch("location");
//   const categoryValue = watch("category");
//   const statusValue = watch("status");
//   const faceValue = watch("face");
//   const roadTypeValue = watch("roadType");
//   const latValue = watch("latitude");
//   const lngValue = watch("longitude");

//   const { data: fetchedImages = [], isLoading: loadingExisting } =
//     usePropertyImages(propertyId);

//   useEffect(() => {
//     if (fetchedImages.length)
//       setExistingImages(fetchedImages as ExistingImage[]);
//     else if (!propertyId && initialExistingImages?.length)
//       setExistingImages(initialExistingImages);
//   }, [fetchedImages, propertyId, initialExistingImages]);

//   // ── Navigation ──────────────────────────────────────────────────────
//   async function goNext() {
//     const valid = await trigger(STEP_FIELDS[step]);
//     if (!valid) return;
//     setCompletedSteps((prev) => new Set(prev).add(step));
//     setDirection("forward");
//     setAnimating(true);
//     setTimeout(() => {
//       setStep((s) => s + 1);
//       setAnimating(false);
//     }, 180);
//   }

//   function goBack() {
//     setDirection("back");
//     setAnimating(true);
//     setTimeout(() => {
//       setStep((s) => s - 1);
//       setAnimating(false);
//     }, 180);
//   }

//   function jumpTo(target: number) {
//     const canJump =
//       target < step ||
//       completedSteps.has(target) ||
//       completedSteps.has(target - 1);
//     if (!canJump) return;
//     setDirection(target > step ? "forward" : "back");
//     setAnimating(true);
//     setTimeout(() => {
//       setStep(target);
//       setAnimating(false);
//     }, 180);
//   }

//   // ── Image handling ──────────────────────────────────────────────────
//   function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
//     const files = e.target.files;
//     if (!files || files.length === 0) return;
//     // Capture the files array immediately before any async work
//     const picked = Array.from(files).map((file) => ({
//       file,
//       url: URL.createObjectURL(file),
//       uploadProgress: undefined as number | undefined,
//       fileId: undefined as string | undefined,
//     }));
//     setImages((prev) => [...prev, ...picked]);
//     // Reset AFTER state update so the same file can be picked again
//     setTimeout(() => {
//       e.target.value = "";
//     }, 0);
//   }

//   function removeNewImage(index: number) {
//     setImages((prev) => {
//       URL.revokeObjectURL(prev[index].url);
//       return prev.filter((_, i) => i !== index);
//     });
//   }

//   function removeExistingImage(imageId: string) {
//     setDeletedFileIds((prev) => [...prev, imageId]);
//     setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
//   }

//   async function uploadImages(): Promise<string[]> {
//     if (!images.length) return [];
//     setUploading(true);
//     const fileIds: string[] = [];

//     for (let i = 0; i < images.length; i++) {
//       const img = images[i];
//       if (img.fileId) {
//         fileIds.push(img.fileId);
//         continue;
//       }

//       const fd = new FormData();
//       fd.append("file", img.file);
//       fd.append("isPrivate", "true");

//       setImages((prev) =>
//         prev.map((p, idx) => (idx === i ? { ...p, uploadProgress: 10 } : p)),
//       );

//       let fakeProgress = 10;
//       const interval = setInterval(() => {
//         fakeProgress = Math.min(
//           fakeProgress + Math.floor(Math.random() * 15 + 5),
//           85,
//         );
//         const captured = fakeProgress;
//         setImages((prev) =>
//           prev.map((p, idx) =>
//             idx === i &&
//             typeof p.uploadProgress === "number" &&
//             p.uploadProgress < 100 &&
//             p.uploadProgress !== -1
//               ? { ...p, uploadProgress: captured }
//               : p,
//           ),
//         );
//       }, 300);

//       try {
//         const res = await fetch("/api/files/upload", {
//           method: "POST",
//           body: fd,
//         });
//         clearInterval(interval);
//         if (!res.ok) throw new Error(`Upload failed for ${img.file.name}`);
//         const data = await res.json();
//         setImages((prev) =>
//           prev.map((p, idx) =>
//             idx === i
//               ? { ...p, uploadProgress: 100, fileId: data.file._id }
//               : p,
//           ),
//         );
//         fileIds.push(data.file._id);
//       } catch (error) {
//         clearInterval(interval);
//         setImages((prev) =>
//           prev.map((p, idx) => (idx === i ? { ...p, uploadProgress: -1 } : p)),
//         );
//         setUploading(false);
//         throw error;
//       }
//     }

//     setUploading(false);
//     return fileIds;
//   }

//   async function onFormSubmit(values: PropertyFormValues) {
//     try {
//       const newFileIds = await uploadImages();
//       onSubmit({
//         ...values,
//         fileIds: newFileIds,
//         deletedFileIds,
//         boundaryPoints,
//       });
//     } catch (error) {
//       console.error(error);
//     }
//   }

//   const currentStep = STEPS[step];

//   return (
//     <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
//       {/* ── MAIN LAYOUT: vertical rail left + content right ──────── */}
//       <div className="flex rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
//         {/* ── LEFT: Vertical step rail (desktop) ─────────────────── */}
//         <div className="hidden sm:flex flex-col w-[172px] shrink-0 bg-muted/30 border-r border-border/50 pt-5 pb-4 px-3 gap-0.5 relative">
//           {/* Vertical track */}
//           <div className="absolute left-[43px] top-[64px] bottom-[64px] w-px bg-border/60" />
//           {/* Animated progress fill */}
//           <div
//             className="absolute left-[43px] top-[64px] w-px bg-primary transition-all duration-500 ease-out"
//             style={{
//               height: `calc((${step} / ${STEPS.length - 1}) * (100% - 128px))`,
//             }}
//           />

//           {STEPS.map((s) => {
//             const Icon = s.icon;
//             const isCompleted = completedSteps.has(s.id);
//             const isCurrent = step === s.id;
//             const isReachable =
//               s.id < step ||
//               completedSteps.has(s.id) ||
//               completedSteps.has(s.id - 1);
//             return (
//               <button
//                 key={s.id}
//                 type="button"
//                 onClick={() => jumpTo(s.id)}
//                 disabled={!isReachable && !isCurrent}
//                 className={cn(
//                   "relative flex items-center gap-2.5 px-2 py-2 rounded-xl transition-all text-left group disabled:cursor-not-allowed",
//                   isCurrent &&
//                     "bg-background shadow-sm border border-border/40",
//                   !isCurrent && isReachable && "hover:bg-background/60",
//                 )}
//               >
//                 {/* Dot */}
//                 <div
//                   className={cn(
//                     "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 shrink-0 z-10",
//                     isCurrent && `${s.border} ${s.accent} text-white shadow`,
//                     isCompleted &&
//                       !isCurrent &&
//                       "border-primary bg-primary text-white",
//                     !isCurrent &&
//                       !isCompleted &&
//                       "border-border bg-background text-muted-foreground",
//                   )}
//                 >
//                   {isCompleted && !isCurrent ? (
//                     <Check size={12} />
//                   ) : (
//                     <Icon size={12} />
//                   )}
//                 </div>
//                 {/* Label */}
//                 <div className="min-w-0 flex-1">
//                   <p
//                     className={cn(
//                       "text-[11px] font-bold leading-tight truncate",
//                       isCurrent
//                         ? "text-foreground"
//                         : isReachable
//                           ? "text-muted-foreground"
//                           : "text-muted-foreground/40",
//                     )}
//                   >
//                     {s.label}
//                   </p>
//                   {isCurrent && (
//                     <p className="text-[9px] text-muted-foreground/60 mt-0.5">
//                       {s.id + 1} / {STEPS.length}
//                     </p>
//                   )}
//                 </div>
//               </button>
//             );
//           })}

//           {/* Boundary badge pinned to bottom of rail */}
//           {boundaryPoints.length >= 3 && (
//             <div className="mt-auto pt-2 mx-1">
//               <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-bold px-2.5 py-1.5 rounded-xl">
//                 <Pentagon size={10} /> {boundaryPoints.length} pts
//               </div>
//             </div>
//           )}
//         </div>

//         {/* ── RIGHT: Content + nav ─────────────────────────────────── */}
//         <div className="flex-1 min-w-0 flex flex-col">
//           {/* Mobile: compact dot progress bar */}
//           <div className="sm:hidden flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-muted/20">
//             {STEPS.map((s) => {
//               const isCompleted = completedSteps.has(s.id);
//               const isCurrent = step === s.id;
//               return (
//                 <div
//                   key={s.id}
//                   className={cn(
//                     "h-1.5 rounded-full flex-1 transition-all duration-300",
//                     isCurrent ? `${s.accent}` : "",
//                     isCompleted && !isCurrent ? "bg-primary" : "",
//                     !isCurrent && !isCompleted ? "bg-border" : "",
//                   )}
//                 />
//               );
//             })}
//             <span className="text-[11px] font-bold text-foreground ml-1 shrink-0">
//               {currentStep.label}
//             </span>
//           </div>

//           {/* Step content — scrollable inside the card */}
//           <div className="flex-1">
//             <div
//               className={cn(
//                 "p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-200 ease-out",
//                 animating &&
//                   direction === "forward" &&
//                   "opacity-0 translate-x-2",
//                 animating && direction === "back" && "opacity-0 -translate-x-2",
//                 !animating && "opacity-100 translate-x-0",
//               )}
//             >
//               {/* ── STEP 0: Basic Info ── */}
//               {step === 0 && (
//                 <>
//                   <Field
//                     label="Property Title"
//                     error={errors.title?.message}
//                     className="sm:col-span-2"
//                   >
//                     <Input
//                       placeholder="e.g. Modern Villa at Baneshwor"
//                       className="h-10 rounded-xl text-sm"
//                       {...register("title")}
//                     />
//                   </Field>
//                   <Field
//                     label="Price (NPR)"
//                     error={errors.price?.message}
//                     hint="Enter the full price in Nepalese Rupees"
//                   >
//                     <Input
//                       type="number"
//                       placeholder="e.g. 12500000"
//                       className="h-10 rounded-xl text-sm"
//                       {...register("price", { valueAsNumber: true })}
//                     />
//                   </Field>
//                   <Field label="Location" error={errors.location?.message}>
//                     <Select
//                       onValueChange={(v) => setValue("location", v)}
//                       value={locationValue}
//                     >
//                       <SelectTrigger className="h-10 rounded-xl text-sm w-full">
//                         <SelectValue placeholder="Select district" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {["Kathmandu", "Lalitpur", "Bhaktapur"].map((l) => (
//                           <SelectItem key={l} value={l}>
//                             {l}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </Field>
//                   <Field label="Property Type" error={errors.category?.message}>
//                     <Select
//                       onValueChange={(v) => setValue("category", v)}
//                       value={categoryValue}
//                     >
//                       <SelectTrigger className="h-10 rounded-xl text-sm w-full">
//                         <SelectValue placeholder="Select type" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {["House", "Apartment", "Land", "Colony"].map((t) => (
//                           <SelectItem key={t} value={t}>
//                             {t}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </Field>
//                   <Field label="Status" error={errors.status?.message}>
//                     <Select
//                       onValueChange={(v) =>
//                         setValue("status", v as PropertyStatus)
//                       }
//                       value={statusValue}
//                     >
//                       <SelectTrigger className="h-10 rounded-xl text-sm w-full">
//                         <SelectValue placeholder="Select status" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="available">Available</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </Field>
//                   <Field
//                     label="Description"
//                     className="sm:col-span-2"
//                     hint="Describe the property, surroundings and highlights"
//                   >
//                     <Textarea
//                       placeholder="Describe the property…"
//                       rows={3}
//                       className="rounded-xl text-sm resize-none"
//                       {...register("description")}
//                     />
//                   </Field>
//                 </>
//               )}

//               {/* ── STEP 1: Property Details ── */}
//               {step === 1 && (
//                 <>
//                   <Field
//                     label="Area"
//                     error={errors.area?.message}
//                     hint="e.g. 5 Aana, 3 Ropani, 1050 sq.ft"
//                   >
//                     <Input
//                       placeholder="e.g. 5 Aana"
//                       className="h-10 rounded-xl text-sm"
//                       {...register("area")}
//                     />
//                   </Field>
//                   <Field label="Property Face" error={errors.face?.message}>
//                     <Select
//                       onValueChange={(v) => setValue("face", v)}
//                       value={faceValue}
//                     >
//                       <SelectTrigger className="h-10 rounded-xl text-sm w-full">
//                         <SelectValue placeholder="Select facing" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {[
//                           "North",
//                           "South",
//                           "East",
//                           "West",
//                           "North-East",
//                           "North-West",
//                           "South-East",
//                           "South-West",
//                         ].map((f) => (
//                           <SelectItem key={f} value={f}>
//                             {f}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </Field>
//                   <Field label="Road Type" error={errors.roadType?.message}>
//                     <Select
//                       onValueChange={(v) => setValue("roadType", v)}
//                       value={roadTypeValue}
//                     >
//                       <SelectTrigger className="h-10 rounded-xl text-sm w-full">
//                         <SelectValue placeholder="Select road type" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {["Blacktopped", "Graveled", "Dirt", "Goreto"].map(
//                           (r) => (
//                             <SelectItem key={r} value={r}>
//                               {r}
//                             </SelectItem>
//                           ),
//                         )}
//                       </SelectContent>
//                     </Select>
//                   </Field>
//                   <Field label="Road Access" hint="Width of the road in feet">
//                     <Input
//                       placeholder="e.g. 13 Feet"
//                       className="h-10 rounded-xl text-sm"
//                       {...register("roadAccess")}
//                     />
//                   </Field>
//                   <div className="sm:col-span-2 flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20">
//                     <div>
//                       <p className="text-xs font-black uppercase tracking-widest">
//                         Negotiable
//                       </p>
//                       <p className="text-[11px] text-muted-foreground mt-0.5">
//                         Is the price open to negotiation?
//                       </p>
//                     </div>
//                     <Switch
//                       checked={negotiable}
//                       onCheckedChange={(v) => setValue("negotiable", v)}
//                     />
//                   </div>
//                 </>
//               )}

//               {/* ── STEP 2: Location Details ── */}
//               {step === 2 && (
//                 <>
//                   <Field label="Municipality">
//                     <Input
//                       placeholder="e.g. Suryabinayak Municipality"
//                       className="h-10 rounded-xl text-sm"
//                       {...register("municipality")}
//                     />
//                   </Field>
//                   <Field label="Ward No.">
//                     <Input
//                       placeholder="e.g. 07"
//                       className="h-10 rounded-xl text-sm"
//                       {...register("wardNo")}
//                     />
//                   </Field>
//                   <Field
//                     label="Distance from Ring Road"
//                     className="sm:col-span-2"
//                     hint="Approximate distance to the nearest ring road"
//                   >
//                     <Input
//                       placeholder="e.g. 4 km"
//                       className="h-10 rounded-xl text-sm"
//                       {...register("ringRoad")}
//                     />
//                   </Field>
//                 </>
//               )}

//               {/* ── STEP 3: Map Pin + Boundary ── */}
//               {step === 3 && (
//                 <LeafletMapPicker
//                   lat={latValue && latValue !== 0 ? latValue : undefined}
//                   lng={lngValue && lngValue !== 0 ? lngValue : undefined}
//                   boundaryPoints={boundaryPoints}
//                   onChange={(la, ln) => {
//                     setValue("latitude", la, { shouldDirty: true });
//                     setValue("longitude", ln, { shouldDirty: true });
//                   }}
//                   onClear={() => {
//                     setValue("latitude", undefined, { shouldDirty: true });
//                     setValue("longitude", undefined, { shouldDirty: true });
//                   }}
//                   onBoundaryChange={setBoundaryPoints}
//                 />
//               )}

//               {/* ── STEP 4: Nearby Facilities ── */}
//               {step === 4 &&
//                 [
//                   {
//                     field: "nearHospital" as const,
//                     label: "Hospital",
//                     hint: "e.g. 500m",
//                   },
//                   {
//                     field: "nearAirport" as const,
//                     label: "Airport",
//                     hint: "e.g. 8 km",
//                   },
//                   {
//                     field: "nearSupermarket" as const,
//                     label: "Supermarket",
//                     hint: "e.g. 300m",
//                   },
//                   {
//                     field: "nearSchool" as const,
//                     label: "School",
//                     hint: "e.g. 200m",
//                   },
//                   {
//                     field: "nearGym" as const,
//                     label: "Gym",
//                     hint: "e.g. 1 km",
//                   },
//                   {
//                     field: "nearTransport" as const,
//                     label: "Public Transport",
//                     hint: "e.g. 100m",
//                   },
//                   {
//                     field: "nearAtm" as const,
//                     label: "ATM",
//                     hint: "e.g. 150m",
//                   },
//                   {
//                     field: "nearRestaurant" as const,
//                     label: "Restaurant",
//                     hint: "e.g. 400m",
//                   },
//                 ].map(({ field, label, hint }) => (
//                   <Field key={field} label={label} hint={hint}>
//                     <Input
//                       placeholder={hint}
//                       className="h-10 rounded-xl text-sm"
//                       {...register(field)}
//                     />
//                   </Field>
//                 ))}

//               {/* ── STEP 5: Images ── */}
//               {step === 5 && (
//                 <div className="sm:col-span-2 space-y-3">
//                   <p className="text-[11px] text-muted-foreground font-medium">
//                     Add up to 10 photos. Click the{" "}
//                     <strong className="text-foreground">+</strong> box to pick
//                     files — they preview instantly.
//                   </p>

//                   {/* Always-visible grid: + box first, then thumbnails */}
//                   {loadingExisting ? (
//                     <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
//                       {[1, 2, 3].map((i) => (
//                         <div
//                           key={i}
//                           className="aspect-square rounded-xl bg-muted animate-pulse"
//                         />
//                       ))}
//                     </div>
//                   ) : (
//                     <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
//                       {/* Add button — ALWAYS first, uses <label> so no .click() needed */}
//                       <label
//                         className={cn(
//                           "aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all",
//                           uploading
//                             ? "border-border/40 opacity-50 cursor-not-allowed"
//                             : "border-border hover:border-primary hover:bg-primary/5 group",
//                         )}
//                       >
//                         <input
//                           type="file"
//                           multiple
//                           accept="image/*"
//                           className="sr-only"
//                           disabled={uploading}
//                           onChange={handleImageChange}
//                         />
//                         <div className="w-9 h-9 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
//                           <Plus
//                             size={18}
//                             className="text-muted-foreground group-hover:text-primary transition-colors"
//                           />
//                         </div>
//                         <span className="text-[10px] font-bold text-muted-foreground group-hover:text-primary uppercase tracking-wide transition-colors">
//                           Add photos
//                         </span>
//                       </label>

//                       {/* Existing saved images */}
//                       {existingImages.map((img) => (
//                         <ImageThumb
//                           key={img.id}
//                           src={img.url}
//                           label={img.filename}
//                           badge="Saved"
//                           badgeColor="bg-blue-500"
//                           onRemove={() => removeExistingImage(img.id)}
//                         />
//                       ))}

//                       {/* New images — appear immediately on pick */}
//                       {images.map((img, i) => (
//                         <ImageThumb
//                           key={i}
//                           src={img.url}
//                           progress={img.uploadProgress}
//                           failed={img.uploadProgress === -1}
//                           onRemove={() => removeNewImage(i)}
//                         />
//                       ))}
//                     </div>
//                   )}

//                   {/* Stats row */}
//                   {(existingImages.length > 0 || images.length > 0) && (
//                     <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-medium pt-1">
//                       {existingImages.length > 0 && (
//                         <span className="flex items-center gap-1">
//                           <Check size={10} className="text-green-500" />
//                           {existingImages.length} saved
//                         </span>
//                       )}
//                       {images.filter((i) => i.uploadProgress === undefined)
//                         .length > 0 && (
//                         <span className="flex items-center gap-1">
//                           <ImageIcon size={10} className="text-primary" />
//                           {
//                             images.filter((i) => i.uploadProgress === undefined)
//                               .length
//                           }{" "}
//                           ready to upload
//                         </span>
//                       )}
//                       {images.filter(
//                         (i) =>
//                           typeof i.uploadProgress === "number" &&
//                           i.uploadProgress >= 0 &&
//                           i.uploadProgress < 100,
//                       ).length > 0 && (
//                         <span className="flex items-center gap-1">
//                           <Upload size={10} className="text-amber-500" />
//                           uploading…
//                         </span>
//                       )}
//                       {images.filter((i) => i.uploadProgress === 100).length >
//                         0 && (
//                         <span className="flex items-center gap-1">
//                           <Check size={10} className="text-green-500" />
//                           {
//                             images.filter((i) => i.uploadProgress === 100)
//                               .length
//                           }{" "}
//                           uploaded
//                         </span>
//                       )}
//                       {deletedFileIds.length > 0 && (
//                         <span className="flex items-center gap-1 text-destructive">
//                           <X size={10} />
//                           {deletedFileIds.length} to delete
//                         </span>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//             {/* end scrollable grid */}
//           </div>
//           {/* end overflow-y-auto */}

//           {/* ── NAV BUTTONS — pinned to bottom of right panel ── */}
//           <div className="flex items-center gap-3 px-5 py-4 border-t border-border/50 bg-muted/10 shrink-0">
//             {step > 0 ? (
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={goBack}
//                 disabled={animating}
//                 className="h-10 px-5 rounded-xl font-bold text-[11px] uppercase tracking-widest"
//               >
//                 <ChevronLeft size={14} className="mr-1" /> Back
//               </Button>
//             ) : (
//               <div />
//             )}

//             {step < STEPS.length - 1 ? (
//               <Button
//                 type="button"
//                 onClick={goNext}
//                 disabled={animating}
//                 className="flex-1 h-10 rounded-xl font-black text-[11px] uppercase tracking-widest"
//               >
//                 {step === 3 && !latValue ? "Skip" : "Next"}{" "}
//                 <ChevronRight size={14} className="ml-1" />
//               </Button>
//             ) : (
//               <Button
//                 type="submit"
//                 size="lg"
//                 disabled={isSubmitting || uploading || animating}
//                 className="flex-1 h-10 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-md"
//               >
//                 {uploading
//                   ? "Uploading…"
//                   : isSubmitting
//                     ? "Saving…"
//                     : buttonText}
//               </Button>
//             )}
//           </div>
//         </div>
//         {/* end right panel */}
//       </div>
//       {/* end main layout */}
//     </form>
//   );
// }

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
  ChevronLeft,
  ChevronRight,
  Info,
  Building2,
  MapPin,
  Utensils,
  ImageIcon,
  Check,
  LocateFixed,
  Map,
  Crosshair,
  Trash2,
  Pentagon,
  Search,
  Upload,
  AlertCircle,
} from "lucide-react";
import { usePropertyImages } from "@/lib/client/queries/properties.queries";
import { cn } from "@/lib/utils";

// ── Schema ────────────────────────────────────────────────────────────
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
  /** key used for dedup: `${name}-${size}-${lastModified}` */
  key: string;
  uploadProgress?: number;
  fileId?: string;
};
type ExistingImage = { id: string; url: string; filename: string };

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

// ── Steps ─────────────────────────────────────────────────────────────
const STEPS = [
  {
    id: 0,
    label: "Basic Info",
    short: "Basic",
    icon: Info,
    accent: "bg-primary",
    border: "border-primary",
    ring: "ring-primary/20",
  },
  {
    id: 1,
    label: "Property",
    short: "Property",
    icon: Building2,
    accent: "bg-amber-500",
    border: "border-amber-500",
    ring: "ring-amber-500/20",
  },
  {
    id: 2,
    label: "Location",
    short: "Location",
    icon: MapPin,
    accent: "bg-blue-500",
    border: "border-blue-500",
    ring: "ring-blue-500/20",
  },
  {
    id: 3,
    label: "Map Pin",
    short: "Map",
    icon: Map,
    accent: "bg-rose-500",
    border: "border-rose-500",
    ring: "ring-rose-500/20",
  },
  {
    id: 4,
    label: "Facilities",
    short: "Nearby",
    icon: Utensils,
    accent: "bg-green-500",
    border: "border-green-500",
    ring: "ring-green-500/20",
  },
  {
    id: 5,
    label: "Images",
    short: "Images",
    icon: ImageIcon,
    accent: "bg-purple-500",
    border: "border-purple-500",
    ring: "ring-purple-500/20",
  },
];

const STEP_FIELDS: Record<number, (keyof PropertyFormValues)[]> = {
  0: ["title", "price", "location", "category", "status"],
  1: ["area", "face", "roadType", "roadAccess", "negotiable"],
  2: ["municipality", "wardNo", "ringRoad"],
  3: [],
  4: [],
  5: [],
};

// ── Tile styles ───────────────────────────────────────────────────────
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

// ── Nominatim result ──────────────────────────────────────────────────
interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

// ── Leaflet dynamic imports ───────────────────────────────────────────
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

// ── Field wrapper ─────────────────────────────────────────────────────
function Field({
  label,
  error,
  className,
  hint,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </Label>
      {children}
      {hint && !error && (
        <p className="text-[11px] text-muted-foreground/70">{hint}</p>
      )}
      {error && (
        <div className="flex items-center gap-1.5">
          <AlertCircle size={11} className="text-destructive shrink-0" />
          <p className="text-[11px] text-destructive font-semibold">{error}</p>
        </div>
      )}
    </div>
  );
}

// ── Inner map components ──────────────────────────────────────────────
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

// ── Location search box using Nominatim ──────────────────────────────
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
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
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

// ── LeafletMapPicker ──────────────────────────────────────────────────
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

  const handleLocationSelect = (selLat: number, selLng: number) => {
    onChange(selLat, selLng);
    setFlyTarget([selLat, selLng]);
  };

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

  const removeBoundaryPoint = (idx: number) => {
    onBoundaryChange(boundaryPoints.filter((_, i) => i !== idx));
  };

  const pinIcon = leafletLib?.divIcon({
    html: `<div style="
width:28px;height:28px;border-radius:50% 50% 50% 0;
background:#ef4444;border:3px solid white;
transform:rotate(-45deg);box-shadow:0 2px 10px rgba(0,0,0,0.3);
"></div>`,
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
  const pointsNeeded = Math.max(0, 3 - boundaryPoints.length);

  return (
    <div className="sm:col-span-2 flex flex-col gap-3">
      <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Search location
        </p>
        <LocationSearch onSelect={handleLocationSelect} />
        <p className="text-[10px] text-muted-foreground/60">
          Type a place name — results from OpenStreetMap. Or click directly on
          the map below.
        </p>
      </div>

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
          <Pentagon size={12} />
          {drawMode ? "Drawing…" : "Draw boundary"}
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
                {pointsNeeded} more to close
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
        Search a location above or click the map to drop a pin. Drag the pin to
        fine-tune. Use{" "}
        <strong className="text-foreground/70">Draw boundary</strong> to outline
        the land area — click to add any number of points. This step is optional
        and can be set later.
      </p>
    </div>
  );
}

// ── Image thumbnail component ─────────────────────────────────────────
function ImageThumb({
  src,
  label,
  badge,
  badgeColor,
  progress,
  failed,
  onRemove,
}: {
  src: string;
  label?: string;
  badge?: string;
  badgeColor?: string;
  progress?: number;
  failed?: boolean;
  onRemove: () => void;
}) {
  const isUploading =
    typeof progress === "number" && progress >= 0 && progress < 100;
  const isDone = progress === 100;
  const isFailed = failed === true || progress === -1;

  return (
    <div className="relative group rounded-xl overflow-hidden border border-border/50 bg-muted aspect-square">
      <img
        src={src}
        alt={label ?? "preview"}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {isUploading && (
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 px-3">
          <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-white h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-white text-[11px] font-bold tabular-nums">
            {progress}%
          </span>
        </div>
      )}

      {isDone && (
        <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-md">
          <Check size={12} className="text-white" />
        </div>
      )}

      {badge && !isUploading && !isFailed && (
        <div
          className={cn(
            "absolute top-2 left-2 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase shadow",
            badgeColor ?? "bg-blue-500",
          )}
        >
          {badge}
        </div>
      )}

      {isFailed && (
        <div className="absolute inset-0 bg-destructive/85 flex flex-col items-center justify-center gap-1.5">
          <AlertCircle size={18} className="text-white" />
          <span className="text-white text-[10px] font-bold">
            Upload failed
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={onRemove}
        disabled={isUploading}
        className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <X size={11} />
      </button>
    </div>
  );
}

// ── Horizontal step progress bar ──────────────────────────────────────
function StepProgressBar({
  steps,
  currentStep,
  completedSteps,
  onJump,
}: {
  steps: typeof STEPS;
  currentStep: number;
  completedSteps: Set<number>;
  onJump: (idx: number) => void;
}) {
  return (
    <div className="w-full px-4 pt-4 pb-3 border-b border-border/50 bg-muted/10">
      {/* Track + dots row */}
      <div className="relative flex items-center">
        {/* Full background track */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-border/60 rounded-full" />
        {/* Filled progress track */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-primary rounded-full transition-all duration-500 ease-out"
          style={{
            width:
              currentStep === 0
                ? "0%"
                : `${(currentStep / (steps.length - 1)) * 100}%`,
          }}
        />

        {/* Step nodes */}
        <div className="relative z-10 flex w-full justify-between">
          {steps.map((s) => {
            const Icon = s.icon;
            const isCompleted = completedSteps.has(s.id);
            const isCurrent = currentStep === s.id;
            const isReachable =
              s.id < currentStep ||
              completedSteps.has(s.id) ||
              completedSteps.has(s.id - 1);

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onJump(s.id)}
                disabled={!isReachable && !isCurrent}
                title={s.label}
                className={cn(
                  "flex flex-col items-center gap-1.5 group disabled:cursor-not-allowed focus:outline-none",
                )}
              >
                {/* Circle */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 shrink-0",
                    isCurrent &&
                      `${s.border} ${s.accent} text-white shadow-md ring-4 ${s.ring}`,
                    isCompleted &&
                      !isCurrent &&
                      "border-primary bg-primary text-white shadow-sm",
                    !isCurrent &&
                      !isCompleted &&
                      isReachable &&
                      "border-border bg-background text-muted-foreground group-hover:border-primary/50 group-hover:text-primary transition-colors",
                    !isCurrent &&
                      !isCompleted &&
                      !isReachable &&
                      "border-border/40 bg-muted/30 text-muted-foreground/40",
                  )}
                >
                  {isCompleted && !isCurrent ? (
                    <Check size={13} />
                  ) : (
                    <Icon size={13} />
                  )}
                </div>

                {/* Label — hidden on very small screens */}
                <span
                  className={cn(
                    "hidden sm:block text-[10px] font-bold uppercase tracking-wider leading-none transition-colors whitespace-nowrap",
                    isCurrent
                      ? "text-foreground"
                      : isCompleted
                        ? "text-primary"
                        : isReachable
                          ? "text-muted-foreground group-hover:text-foreground"
                          : "text-muted-foreground/40",
                  )}
                >
                  {s.short}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile: current step label below dots */}
      <p className="sm:hidden mt-2 text-center text-[11px] font-bold text-foreground">
        {steps[currentStep].label}{" "}
        <span className="text-muted-foreground font-normal">
          ({currentStep + 1}/{steps.length})
        </span>
      </p>
    </div>
  );
}

// ── Main Form ─────────────────────────────────────────────────────────
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

  // ── Image state ──────────────────────────────────────────────────────
  // `images` holds only NEW (locally-picked) files not yet persisted.
  // Each item carries a stable `key` (name+size+lastModified) for dedup.
  const [images, setImages] = useState<PreviewFile[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [deletedFileIds, setDeletedFileIds] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Ref to the hidden file input so we can reset its value after picking
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [boundaryPoints, setBoundaryPoints] =
    useState<[number, number][]>(initialBoundary);

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
    if (fetchedImages.length)
      setExistingImages(fetchedImages as ExistingImage[]);
    else if (!propertyId && initialExistingImages?.length)
      setExistingImages(initialExistingImages);
  }, [fetchedImages, propertyId, initialExistingImages]);

  // ── Navigation ──────────────────────────────────────────────────────
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

  // ── Image handling ──────────────────────────────────────────────────
  /**
   * Builds a stable dedup key for a File object.
   * Same file picked twice will have the same key and be skipped.
   */
  function fileKey(f: File) {
    return `${f.name}-${f.size}-${f.lastModified}`;
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setImages((prev) => {
      // Build a set of already-tracked keys so we never add duplicates
      const existingKeys = new Set(prev.map((p) => p.key));

      const fresh = Array.from(files)
        .filter((f) => {
          const k = fileKey(f);
          if (existingKeys.has(k)) return false; // skip duplicate
          existingKeys.add(k); // prevent duplicates within the same pick
          return true;
        })
        .map((f) => ({
          file: f,
          url: URL.createObjectURL(f),
          key: fileKey(f),
          uploadProgress: undefined as number | undefined,
          fileId: undefined as string | undefined,
        }));

      return [...prev, ...fresh];
    });

    // Reset the input value so the same file can be re-selected after removal
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function removeNewImage(key: string) {
    setImages((prev) => {
      const target = prev.find((p) => p.key === key);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((p) => p.key !== key);
    });
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

      // Already successfully uploaded — reuse its id
      if (img.fileId) {
        fileIds.push(img.fileId);
        continue;
      }

      // Skip images that previously failed (don't block the whole submit)
      if (img.uploadProgress === -1) continue;

      const fd = new FormData();
      fd.append("file", img.file);
      fd.append("isPrivate", "true");

      const targetKey = img.key;

      setImages((prev) =>
        prev.map((p) =>
          p.key === targetKey ? { ...p, uploadProgress: 10 } : p,
        ),
      );

      let fakeProgress = 10;
      const interval = setInterval(() => {
        fakeProgress = Math.min(
          fakeProgress + Math.floor(Math.random() * 15 + 5),
          85,
        );
        const captured = fakeProgress;
        setImages((prev) =>
          prev.map((p) =>
            p.key === targetKey &&
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
        setImages((prev) =>
          prev.map((p) =>
            p.key === targetKey
              ? { ...p, uploadProgress: 100, fileId: data.file._id }
              : p,
          ),
        );
        fileIds.push(data.file._id);
      } catch (error) {
        clearInterval(interval);
        setImages((prev) =>
          prev.map((p) =>
            p.key === targetKey ? { ...p, uploadProgress: -1 } : p,
          ),
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
      <div className="flex flex-col rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
        {/* ── TOP: Horizontal step progress bar ──────────────────── */}
        <StepProgressBar
          steps={STEPS}
          currentStep={step}
          completedSteps={completedSteps}
          onJump={jumpTo}
        />

        {/* ── CONTENT ─────────────────────────────────────────────── */}
        <div className="flex-1">
          <div
            className={cn(
              "p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-200 ease-out",
              animating && direction === "forward" && "opacity-0 translate-x-2",
              animating && direction === "back" && "opacity-0 -translate-x-2",
              !animating && "opacity-100 translate-x-0",
            )}
          >
            {/* ── STEP 0: Basic Info ── */}
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
                <Field
                  label="Price (NPR)"
                  error={errors.price?.message}
                  hint="Enter the full price in Nepalese Rupees"
                >
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
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Kathmandu", "Lalitpur", "Bhaktapur"].map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
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
                    onValueChange={(v) =>
                      setValue("status", v as PropertyStatus)
                    }
                    value={statusValue}
                  >
                    <SelectTrigger className="h-10 rounded-xl text-sm w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field
                  label="Description"
                  className="sm:col-span-2"
                  hint="Describe the property, surroundings and highlights"
                >
                  <Textarea
                    placeholder="Describe the property…"
                    rows={3}
                    className="rounded-xl text-sm resize-none"
                    {...register("description")}
                  />
                </Field>
              </>
            )}

            {/* ── STEP 1: Property Details ── */}
            {step === 1 && (
              <>
                <Field
                  label="Area"
                  error={errors.area?.message}
                  hint="e.g. 5 Aana, 3 Ropani, 1050 sq.ft"
                >
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
                      {["Blacktopped", "Graveled", "Dirt", "Goreto"].map(
                        (r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Road Access" hint="Width of the road in feet">
                  <Input
                    placeholder="e.g. 13 Feet"
                    className="h-10 rounded-xl text-sm"
                    {...register("roadAccess")}
                  />
                </Field>
                <div className="sm:col-span-2 flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20">
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

            {/* ── STEP 2: Location Details ── */}
            {step === 2 && (
              <>
                <Field label="Municipality">
                  <Input
                    placeholder="e.g. Suryabinayak Municipality"
                    className="h-10 rounded-xl text-sm"
                    {...register("municipality")}
                  />
                </Field>
                <Field label="Ward No.">
                  <Input
                    placeholder="e.g. 07"
                    className="h-10 rounded-xl text-sm"
                    {...register("wardNo")}
                  />
                </Field>
                <Field
                  label="Distance from Ring Road"
                  className="sm:col-span-2"
                  hint="Approximate distance to the nearest ring road"
                >
                  <Input
                    placeholder="e.g. 4 km"
                    className="h-10 rounded-xl text-sm"
                    {...register("ringRoad")}
                  />
                </Field>
              </>
            )}

            {/* ── STEP 3: Map Pin + Boundary ── */}
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

            {/* ── STEP 4: Nearby Facilities ── */}
            {step === 4 &&
              [
                {
                  field: "nearHospital" as const,
                  label: "Hospital",
                  hint: "e.g. 500m",
                },
                {
                  field: "nearAirport" as const,
                  label: "Airport",
                  hint: "e.g. 8 km",
                },
                {
                  field: "nearSupermarket" as const,
                  label: "Supermarket",
                  hint: "e.g. 300m",
                },
                {
                  field: "nearSchool" as const,
                  label: "School",
                  hint: "e.g. 200m",
                },
                {
                  field: "nearGym" as const,
                  label: "Gym",
                  hint: "e.g. 1 km",
                },
                {
                  field: "nearTransport" as const,
                  label: "Public Transport",
                  hint: "e.g. 100m",
                },
                {
                  field: "nearAtm" as const,
                  label: "ATM",
                  hint: "e.g. 150m",
                },
                {
                  field: "nearRestaurant" as const,
                  label: "Restaurant",
                  hint: "e.g. 400m",
                },
              ].map(({ field, label, hint }) => (
                <Field key={field} label={label} hint={hint}>
                  <Input
                    placeholder={hint}
                    className="h-10 rounded-xl text-sm"
                    {...register(field)}
                  />
                </Field>
              ))}

            {/* ── STEP 5: Images ── */}
            {step === 5 && (
              <div className="sm:col-span-2 space-y-3">
                <p className="text-[11px] text-muted-foreground font-medium">
                  Add up to 10 photos. Click the{" "}
                  <strong className="text-foreground">+</strong> box to pick
                  files — they preview instantly. Already-uploaded images show a
                  green check and won&apos;t be re-uploaded.
                </p>

                {loadingExisting ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-xl bg-muted animate-pulse"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {/* ── Add button — uses a ref-controlled hidden input ── */}
                    <label
                      className={cn(
                        "aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all",
                        uploading
                          ? "border-border/40 opacity-50 cursor-not-allowed"
                          : "border-border hover:border-primary hover:bg-primary/5 group",
                      )}
                    >
                      {/*
                       * The input is NOT registered with react-hook-form — it's
                       * purely controlled via handleImageChange + fileInputRef.
                       * We reset its value immediately after reading the files so
                       * that picking the same file again after removing it works.
                       */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        className="sr-only"
                        disabled={uploading}
                        onChange={handleImageChange}
                      />
                      <div className="w-9 h-9 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                        <Plus
                          size={18}
                          className="text-muted-foreground group-hover:text-primary transition-colors"
                        />
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground group-hover:text-primary uppercase tracking-wide transition-colors">
                        Add photos
                      </span>
                    </label>

                    {/* Existing saved images */}
                    {existingImages.map((img) => (
                      <ImageThumb
                        key={img.id}
                        src={img.url}
                        label={img.filename}
                        badge="Saved"
                        badgeColor="bg-blue-500"
                        onRemove={() => removeExistingImage(img.id)}
                      />
                    ))}

                    {/* New images — keyed by stable file key, not array index */}
                    {images.map((img) => (
                      <ImageThumb
                        key={img.key}
                        src={img.url}
                        progress={img.uploadProgress}
                        failed={img.uploadProgress === -1}
                        onRemove={() => removeNewImage(img.key)}
                      />
                    ))}
                  </div>
                )}

                {/* Stats row */}
                {(existingImages.length > 0 || images.length > 0) && (
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-medium pt-1 flex-wrap">
                    {existingImages.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Check size={10} className="text-green-500" />
                        {existingImages.length} saved
                      </span>
                    )}
                    {images.filter((i) => i.uploadProgress === undefined)
                      .length > 0 && (
                      <span className="flex items-center gap-1">
                        <ImageIcon size={10} className="text-primary" />
                        {
                          images.filter((i) => i.uploadProgress === undefined)
                            .length
                        }{" "}
                        ready to upload
                      </span>
                    )}
                    {images.filter(
                      (i) =>
                        typeof i.uploadProgress === "number" &&
                        i.uploadProgress >= 0 &&
                        i.uploadProgress < 100,
                    ).length > 0 && (
                      <span className="flex items-center gap-1">
                        <Upload size={10} className="text-amber-500" />
                        uploading…
                      </span>
                    )}
                    {images.filter((i) => i.uploadProgress === 100).length >
                      0 && (
                      <span className="flex items-center gap-1">
                        <Check size={10} className="text-green-500" />
                        {
                          images.filter((i) => i.uploadProgress === 100).length
                        }{" "}
                        uploaded
                      </span>
                    )}
                    {deletedFileIds.length > 0 && (
                      <span className="flex items-center gap-1 text-destructive">
                        <X size={10} />
                        {deletedFileIds.length} to delete
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── NAV BUTTONS ─────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-5 py-4 border-t border-border/50 bg-muted/10 shrink-0">
          {step > 0 ? (
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              disabled={animating}
              className="h-10 px-5 rounded-xl font-bold text-[11px] uppercase tracking-widest"
            >
              <ChevronLeft size={14} className="mr-1" /> Back
            </Button>
          ) : (
            <div />
          )}

          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={goNext}
              disabled={animating}
              className="flex-1 h-10 rounded-xl font-black text-[11px] uppercase tracking-widest"
            >
              {step === 3 && !latValue ? "Skip" : "Next"}{" "}
              <ChevronRight size={14} className="ml-1" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting || uploading || animating}
              className="flex-1 h-10 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-md"
            >
              {uploading ? "Uploading…" : isSubmitting ? "Saving…" : buttonText}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
