// // // 'use client'

// // // import React, { useState, useRef } from 'react'
// // // import dynamic from 'next/dynamic'
// // // import { Search, ArrowRight, LocateFixed } from 'lucide-react'
// // // import { Button } from '@/components/ui/button'
// // // import L from 'leaflet'

// // // const LeafletMap = dynamic(() => import('./LeafletMap'), {
// // //     ssr: false
// // // })

// // // interface HeroSectionProps {
// // //     searchQuery: string
// // //     setSearchQuery: (query: string) => void
// // // }

// // // // Default center (Kathmandu)
// // // const DEFAULT_CENTER: [number, number] = [27.7172, 85.324]

// // // // Temporary text → coordinate mapping
// // // const LOCATION_MAP: Record<string, [number, number]> = {
// // //     kathmandu: [27.7172, 85.324],
// // //     lalitpur: [27.6644, 85.3188],
// // //     bhaktapur: [27.671, 85.4298],
// // //     pokhara: [28.2096, 83.9856]
// // // }

// // // const HeroSection: React.FC<HeroSectionProps> = ({
// // //     searchQuery,
// // //     setSearchQuery
// // // }) => {
// // //     const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER)
// // //     const mapRef = useRef<L.Map | null>(null)

// // //     // 🔍 Search by text
// // //     const handleSearch = () => {
// // //         const key = searchQuery.toLowerCase().trim()
// // //         if (LOCATION_MAP[key]) {
// // //             setMapCenter(LOCATION_MAP[key])
// // //             mapRef.current?.setView(LOCATION_MAP[key], 13)
// // //         }
// // //     }

// // //     // 📍 Use browser location
// // //     const handleUseMyLocation = () => {
// // //         if (!navigator.geolocation) {
// // //             alert('Geolocation is not supported by your browser')
// // //             return
// // //         }

// // //         navigator.geolocation.getCurrentPosition(
// // //             pos => {
// // //                 const coords: [number, number] = [
// // //                     pos.coords.latitude,
// // //                     pos.coords.longitude
// // //                 ]
// // //                 setMapCenter(coords)
// // //                 setSearchQuery('Near my location')
// // //                 mapRef.current?.setView(coords, 16)
// // //             },
// // //             () => alert('Location access denied'),
// // //             { enableHighAccuracy: true }
// // //         )
// // //     }

// // //     return (
// // //         <section className="relative p-6">
// // //             <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
// // //                 {/* LEFT */}
// // //                 <div className="relative z-10">
// // //                     <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
// // //                         Find Your Perfect
// // //                         <span className="block text-orange-500 mt-2">
// // //                             Property in Nepal
// // //                         </span>
// // //                     </h1>

// // //                     <p className="mt-6 text-lg text-gray-600 max-w-xl">
// // //                         Explore verified homes, apartments, and land with real-time location visibility.
// // //                     </p>

// // //                     <div className="mt-10 bg-white p-5 rounded-2xl shadow-xl">
// // //                         <div className="flex flex-col sm:flex-row gap-3 items-center">
// // //                             <div className="flex-1 relative">
// // //                                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
// // //                                 <input
// // //                                     value={searchQuery}
// // //                                     onChange={e => setSearchQuery(e.target.value)}
// // //                                     placeholder="Kathmandu, Lalitpur, Pokhara..."
// // //                                     className="w-full pl-12 py-4 border rounded-xl"
// // //                                 />
// // //                             </div>

// // //                             <Button
// // //                                 onClick={handleSearch}
// // //                                 className="bg-orange-500 text-white px-6 py-4 rounded-xl flex items-center gap-2"
// // //                             >
// // //                                 Search
// // //                                 <ArrowRight className="h-5 w-5" />
// // //                             </Button>
// // //                         </div>

// // //                         <Button
// // //                             onClick={handleUseMyLocation}
// // //                             variant="outline"
// // //                             className="mt-4 w-full flex items-center justify-center gap-2"
// // //                         >
// // //                             <LocateFixed className="h-5 w-5" />
// // //                             Use my current location
// // //                         </Button>
// // //                     </div>
// // //                 </div>

// // //                 {/* RIGHT MAP */}
// // //                 <div className="h-130 w-full rounded-3xl overflow-hidden shadow-2xl">
// // //                     <LeafletMap center={mapCenter} mapRef={mapRef} />
// // //                 </div>
// // //             </div>
// // //         </section>
// // //     )
// // // }

// // // export default HeroSection

// // 'use client'

// // import React, { useState, useRef } from 'react'
// // import dynamic from 'next/dynamic'
// // import { Search, ArrowRight, LocateFixed } from 'lucide-react'
// // import { Button } from '@/components/ui/button'
// // import L from 'leaflet'

// // const LeafletMap = dynamic(() => import('./leaflet-map'), { ssr: false })

// // interface HeroSectionProps {
// //     searchQuery: string
// //     setSearchQuery: (query: string) => void
// // }

// // // Default center (Kathmandu)
// // const DEFAULT_CENTER: [number, number] = [27.7172, 85.324]

// // // Temporary text → coordinate mapping
// // const LOCATION_MAP: Record<string, [number, number]> = {
// //     kathmandu: [27.7172, 85.324],
// //     lalitpur: [27.6644, 85.3188],
// //     bhaktapur: [27.671, 85.4298],
// //     pokhara: [28.2096, 83.9856]
// // }

// // const HeroSection: React.FC<HeroSectionProps> = ({
// //     searchQuery,
// //     setSearchQuery
// // }) => {
// //     const [mapCenter, setMapCenter] =
// //         useState<[number, number]>(DEFAULT_CENTER)
// //     const mapRef = useRef<L.Map | null>(null)

// //     // 🔍 Search by text
// //     const handleSearch = () => {
// //         const key = searchQuery.toLowerCase().trim()
// //         if (LOCATION_MAP[key]) {
// //             setMapCenter(LOCATION_MAP[key])
// //             mapRef.current?.setView(LOCATION_MAP[key], 13)
// //         }
// //     }

// //     // 📍 Use browser location
// //     const handleUseMyLocation = () => {
// //         if (!navigator.geolocation) {
// //             alert('Geolocation is not supported by your browser')
// //             return
// //         }

// //         navigator.geolocation.getCurrentPosition(
// //             pos => {
// //                 const coords: [number, number] = [
// //                     pos.coords.latitude,
// //                     pos.coords.longitude
// //                 ]
// //                 setMapCenter(coords)
// //                 setSearchQuery('Near my location')
// //                 mapRef.current?.setView(coords, 16)
// //             },
// //             () => alert('Location access denied'),
// //             { enableHighAccuracy: true }
// //         )
// //     }

// //     return (
// //         <section className="relative py-16 px-6">
// //             <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
// //                 {/* LEFT */}
// //                 <div className="relative z-10">
// //                     <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-foreground">
// //                         Find Your Perfect
// //                         <span className="block text-primary mt-2">
// //                             Property in Nepal
// //                         </span>
// //                     </h1>

// //                     <p className="mt-6 text-lg text-muted-foreground max-w-xl">
// //                         Explore verified homes, apartments, and land with real-time location visibility.
// //                     </p>

// //                     <div className="mt-10 bg-background border border-border p-5 rounded-2xl shadow-sm">
// //                         <div className="flex flex-col sm:flex-row gap-3 items-center">
// //                             <div className="flex-1 relative">
// //                                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
// //                                 <input
// //                                     value={searchQuery}
// //                                     onChange={e => setSearchQuery(e.target.value)}
// //                                     placeholder="Kathmandu, Lalitpur, Pokhara..."
// //                                     className="
// //                     w-full pl-12 py-4 rounded-xl
// //                     bg-background
// //                     border border-border
// //                     text-foreground
// //                     placeholder:text-muted-foreground
// //                     focus:outline-none
// //                     focus:ring-2 focus:ring-ring
// //                   "
// //                                 />
// //                             </div>

// //                             <Button
// //                                 onClick={handleSearch}
// //                                 size="lg"
// //                                 className="flex items-center gap-2 rounded-xl"
// //                             >
// //                                 Search
// //                                 <ArrowRight className="h-5 w-5" />
// //                             </Button>
// //                         </div>

// //                         <Button
// //                             onClick={handleUseMyLocation}
// //                             variant="outline"
// //                             className="mt-4 w-full flex items-center justify-center gap-2"
// //                         >
// //                             <LocateFixed className="h-5 w-5" />
// //                             Use my current location
// //                         </Button>
// //                     </div>
// //                 </div>

// //                 {/* RIGHT MAP */}
// //                 <div className="h-130 w-full rounded-3xl overflow-hidden border border-border shadow-sm">
// //                     <LeafletMap center={mapCenter} mapRef={mapRef} />
// //                 </div>
// //             </div>
// //         </section>
// //     )
// // }

// // export default HeroSection

// "use client";

// import { useState, useRef, useEffect, Suspense } from "react";
// import dynamic from "next/dynamic";
// import { Search, LocateFixed } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Skeleton } from "@/components/ui/skeleton";

// import {
//   useNepalGeocoding,
//   useReverseGeocode,
// } from "@/lib/client/queries/nepalgeocoding.queries";
// import { useDebounce } from "@/hooks/use-debounce";

// const LeafletMap = dynamic(() => import("./leaflet-map"), {
//   ssr: false,
//   loading: () => (
//     <div className="h-full w-full bg-muted/30 flex items-center justify-center">
//       <Skeleton className="h-12 w-12 rounded-full animate-pulse" />
//     </div>
//   ),
// });

// interface HeroSectionProps {
//   searchQuery: string;
//   setSearchQuery: (query: string) => void;
// }

// const DEFAULT_CENTER: [number, number] = [27.7172, 85.324];
// const DEFAULT_CITY = "Kathmandu";

// export default function HeroSection({
//   searchQuery,
//   setSearchQuery,
// }: HeroSectionProps) {
//   const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
//   const [currentCity, setCurrentCity] = useState<string>(DEFAULT_CITY);
//   const [userLat, setUserLat] = useState<number | null>(null);
//   const [userLon, setUserLon] = useState<number | null>(null);
//   const mapRef = useRef<any>(null);
//   const [isUserLocation, setIsUserLocation] = useState(false);
//   const [isLocating, setIsLocating] = useState(false);

//   const debouncedQuery = useDebounce(searchQuery, 400);
//   const { data: coords, isLoading: isGeocoding } =
//     useNepalGeocoding(debouncedQuery);
//   const { data: reverseCity, isLoading: isReverseLoading } = useReverseGeocode(
//     userLat,
//     userLon,
//   );

//   useEffect(() => {
//     if (coords) {
//       setMapCenter(coords);
//       setCurrentCity(debouncedQuery.trim() || DEFAULT_CITY);
//       mapRef.current?.setView(coords, 13);
//       setIsUserLocation(false);
//     }
//   }, [coords, debouncedQuery]);

//   useEffect(() => {
//     if (reverseCity) {
//       setCurrentCity(reverseCity);
//       setSearchQuery(reverseCity);
//     }
//   }, [reverseCity]);

//   const handleUseMyLocation = () => {
//     if (!navigator.geolocation) {
//       alert("Geolocation not supported");
//       return;
//     }

//     setIsLocating(true);
//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         const lat = pos.coords.latitude;
//         const lon = pos.coords.longitude;
//         setUserLat(lat);
//         setUserLon(lon);

//         setMapCenter([lat, lon]);
//         mapRef.current?.setView([lat, lon], 16);
//         setIsUserLocation(true);
//         setSearchQuery("");
//         setIsLocating(false);
//       },
//       () => {
//         alert("Location access denied");
//         setIsLocating(false);
//       },
//       { enableHighAccuracy: true },
//     );
//   };

//   return (
//     <section className="relative py-16 px-6 bg-linear-to-br from-background to-muted/30 dark:from-background dark:to-muted/10 overflow-hidden">
//       <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
//         <div className="relative z-30">
//           <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-foreground">
//             Find Your Perfect
//             <span className="block text-primary mt-2">
//               Property in {currentCity || "Nepal"}
//             </span>
//           </h1>

//           <p className="mt-6 text-lg text-muted-foreground max-w-xl">
//             Explore verified homes, apartments, and land with real-time location
//             visibility.
//           </p>

//           <div className="mt-10 bg-card border border-border p-5 rounded-2xl shadow-lg dark:shadow-primary/5">
//             <div className="relative">
//               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
//               <input
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 disabled={isLocating || isReverseLoading}
//                 placeholder="Kathmandu, Lalitpur, Pokhara, ..."
//                 className="
//                   w-full pl-12 pr-5 py-4 rounded-xl
//                   bg-background border border-border/70
//                   text-foreground placeholder:text-muted-foreground/80
//                   focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40
//                   transition-all duration-200 shadow-sm
//                   disabled:opacity-50 disabled:cursor-not-allowed
//                 "
//               />
//               {(isGeocoding || isReverseLoading || isLocating) && (
//                 <div className="absolute right-4 top-1/2 -translate-y-1/2">
//                   <div className="h-4 w-4 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
//                 </div>
//               )}
//             </div>

//             <Button
//               onClick={handleUseMyLocation}
//               disabled={isGeocoding || isLocating || isReverseLoading}
//               variant="outline"
//               className="mt-4 w-full gap-2 hover:bg-primary hover:text-primary-foreground dark:text-white dark:hover:bg-primary/80 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               <LocateFixed className="h-5 w-5" />
//               Use my current location
//             </Button>
//           </div>
//         </div>

//         <div className="relative z-10 rounded-3xl overflow-hidden border border-border shadow-2xl h-120 lg:h-140 bg-card">
//           <Suspense fallback={<Skeleton className="h-full w-full" />}>
//             <LeafletMap
//               center={mapCenter}
//               mapRef={mapRef}
//               isUserLocation={isUserLocation}
//             />
//           </Suspense>
//         </div>
//       </div>
//     </section>
//   );
// }

"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { Search, LocateFixed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useNepalGeocoding,
  useReverseGeocode,
} from "@/lib/client/queries/nepalgeocoding.queries";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";
// import {
//   useNepalGeocoding,
//   useReverseGeocode,
// } from "@/hooks/services/useNepalGeocoding";

const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-muted/30 flex items-center justify-center">
      <Skeleton className="h-12 w-12 rounded-full animate-pulse" />
    </div>
  ),
});

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const DEFAULT_CENTER: [number, number] = [27.7172, 85.324];
const DEFAULT_CITY = "Kathmandu";

export default function HeroSection({
  searchQuery,
  setSearchQuery,
}: HeroSectionProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [currentCity, setCurrentCity] = useState<string>(DEFAULT_CITY);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLon, setUserLon] = useState<number | null>(null);
  const mapRef = useRef<any>(null);
  const [isUserLocation, setIsUserLocation] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const debouncedQuery = useDebounce(searchQuery, 400);
  const { data: coords, isLoading: isGeocoding } =
    useNepalGeocoding(debouncedQuery);
  const { data: reverseCity, isLoading: isReverseLoading } = useReverseGeocode(
    userLat,
    userLon,
  );

  useEffect(() => {
    if (coords) {
      setMapCenter(coords);
      setCurrentCity(debouncedQuery.trim() || DEFAULT_CITY);
      mapRef.current?.setView(coords, 13);
      setIsUserLocation(false);
    }
  }, [coords, debouncedQuery]);

  //   useEffect(() => {
  //     if (reverseCity) {
  //       setCurrentCity(reverseCity);
  //       setSearchQuery(reverseCity);
  //     }
  //   }, [reverseCity]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setUserLat(lat);
        setUserLon(lon);

        setMapCenter([lat, lon]);
        mapRef.current?.setView([lat, lon], 16);
        setIsUserLocation(true);
        setSearchQuery("");
        setIsLocating(false);
      },
      () => {
        toast.error("Location access denied");
        setIsLocating(false);
      },
      { enableHighAccuracy: true },
    );
  };

  return (
    <section className="relative py-16 px-6 bg-linear-to-br from-background to-muted/30 dark:from-background dark:to-muted/10 overflow-hidden">
      <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="relative z-30">
          <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-foreground">
            Find Your Perfect
            <span className="block text-primary mt-2">
              Property in {currentCity || "Nepal"}
            </span>
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-xl">
            Explore verified homes, apartments, and land with real-time location
            visibility.
          </p>

          <div className="mt-10 bg-card border border-border p-5 rounded-2xl shadow-lg dark:shadow-primary/5">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isLocating || isReverseLoading}
                placeholder="Kathmandu, Lalitpur, Pokhara, ..."
                className="
                  w-full pl-12 pr-5 py-4 rounded-xl
                  bg-background border border-border/70
                  text-foreground placeholder:text-muted-foreground/80
                  focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40
                  transition-all duration-200 shadow-sm
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              />
              {(isGeocoding || isReverseLoading || isLocating) && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="h-4 w-4 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
                </div>
              )}
            </div>

            <Button
              onClick={handleUseMyLocation}
              disabled={isGeocoding || isLocating || isReverseLoading}
              variant="outline"
              className="mt-4 w-full gap-2 hover:bg-primary hover:text-primary-foreground dark:text-white dark:hover:bg-primary/80 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LocateFixed className="h-5 w-5" />
              Use my current location
            </Button>
          </div>
        </div>

        <div className="relative z-10 rounded-3xl overflow-hidden border border-border shadow-2xl h-120 lg:h-140 bg-card">
          <Suspense fallback={<Skeleton className="h-full w-full" />}>
            <LeafletMap
              center={mapCenter}
              mapRef={mapRef}
              isUserLocation={isUserLocation}
            />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
