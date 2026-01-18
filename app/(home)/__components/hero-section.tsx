// 'use client'

// import React, { useState, useRef } from 'react'
// import dynamic from 'next/dynamic'
// import { Search, ArrowRight, LocateFixed } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import L from 'leaflet'

// const LeafletMap = dynamic(() => import('./LeafletMap'), {
//     ssr: false
// })

// interface HeroSectionProps {
//     searchQuery: string
//     setSearchQuery: (query: string) => void
// }

// // Default center (Kathmandu)
// const DEFAULT_CENTER: [number, number] = [27.7172, 85.324]

// // Temporary text → coordinate mapping
// const LOCATION_MAP: Record<string, [number, number]> = {
//     kathmandu: [27.7172, 85.324],
//     lalitpur: [27.6644, 85.3188],
//     bhaktapur: [27.671, 85.4298],
//     pokhara: [28.2096, 83.9856]
// }

// const HeroSection: React.FC<HeroSectionProps> = ({
//     searchQuery,
//     setSearchQuery
// }) => {
//     const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER)
//     const mapRef = useRef<L.Map | null>(null)

//     // 🔍 Search by text
//     const handleSearch = () => {
//         const key = searchQuery.toLowerCase().trim()
//         if (LOCATION_MAP[key]) {
//             setMapCenter(LOCATION_MAP[key])
//             mapRef.current?.setView(LOCATION_MAP[key], 13)
//         }
//     }

//     // 📍 Use browser location
//     const handleUseMyLocation = () => {
//         if (!navigator.geolocation) {
//             alert('Geolocation is not supported by your browser')
//             return
//         }

//         navigator.geolocation.getCurrentPosition(
//             pos => {
//                 const coords: [number, number] = [
//                     pos.coords.latitude,
//                     pos.coords.longitude
//                 ]
//                 setMapCenter(coords)
//                 setSearchQuery('Near my location')
//                 mapRef.current?.setView(coords, 16)
//             },
//             () => alert('Location access denied'),
//             { enableHighAccuracy: true }
//         )
//     }

//     return (
//         <section className="relative p-6">
//             <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
//                 {/* LEFT */}
//                 <div className="relative z-10">
//                     <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
//                         Find Your Perfect
//                         <span className="block text-orange-500 mt-2">
//                             Property in Nepal
//                         </span>
//                     </h1>

//                     <p className="mt-6 text-lg text-gray-600 max-w-xl">
//                         Explore verified homes, apartments, and land with real-time location visibility.
//                     </p>

//                     <div className="mt-10 bg-white p-5 rounded-2xl shadow-xl">
//                         <div className="flex flex-col sm:flex-row gap-3 items-center">
//                             <div className="flex-1 relative">
//                                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
//                                 <input
//                                     value={searchQuery}
//                                     onChange={e => setSearchQuery(e.target.value)}
//                                     placeholder="Kathmandu, Lalitpur, Pokhara..."
//                                     className="w-full pl-12 py-4 border rounded-xl"
//                                 />
//                             </div>

//                             <Button
//                                 onClick={handleSearch}
//                                 className="bg-orange-500 text-white px-6 py-4 rounded-xl flex items-center gap-2"
//                             >
//                                 Search
//                                 <ArrowRight className="h-5 w-5" />
//                             </Button>
//                         </div>

//                         <Button
//                             onClick={handleUseMyLocation}
//                             variant="outline"
//                             className="mt-4 w-full flex items-center justify-center gap-2"
//                         >
//                             <LocateFixed className="h-5 w-5" />
//                             Use my current location
//                         </Button>
//                     </div>
//                 </div>

//                 {/* RIGHT MAP */}
//                 <div className="h-130 w-full rounded-3xl overflow-hidden shadow-2xl">
//                     <LeafletMap center={mapCenter} mapRef={mapRef} />
//                 </div>
//             </div>
//         </section>
//     )
// }

// export default HeroSection

'use client'

import React, { useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Search, ArrowRight, LocateFixed } from 'lucide-react'
import { Button } from '@/components/ui/button'
import L from 'leaflet'

const LeafletMap = dynamic(() => import('./LeafletMap'), { ssr: false })

interface HeroSectionProps {
    searchQuery: string
    setSearchQuery: (query: string) => void
}

// Default center (Kathmandu)
const DEFAULT_CENTER: [number, number] = [27.7172, 85.324]

// Temporary text → coordinate mapping
const LOCATION_MAP: Record<string, [number, number]> = {
    kathmandu: [27.7172, 85.324],
    lalitpur: [27.6644, 85.3188],
    bhaktapur: [27.671, 85.4298],
    pokhara: [28.2096, 83.9856]
}

const HeroSection: React.FC<HeroSectionProps> = ({
    searchQuery,
    setSearchQuery
}) => {
    const [mapCenter, setMapCenter] =
        useState<[number, number]>(DEFAULT_CENTER)
    const mapRef = useRef<L.Map | null>(null)

    // 🔍 Search by text
    const handleSearch = () => {
        const key = searchQuery.toLowerCase().trim()
        if (LOCATION_MAP[key]) {
            setMapCenter(LOCATION_MAP[key])
            mapRef.current?.setView(LOCATION_MAP[key], 13)
        }
    }

    // 📍 Use browser location
    const handleUseMyLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser')
            return
        }

        navigator.geolocation.getCurrentPosition(
            pos => {
                const coords: [number, number] = [
                    pos.coords.latitude,
                    pos.coords.longitude
                ]
                setMapCenter(coords)
                setSearchQuery('Near my location')
                mapRef.current?.setView(coords, 16)
            },
            () => alert('Location access denied'),
            { enableHighAccuracy: true }
        )
    }

    return (
        <section className="relative py-16 px-6">
            <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* LEFT */}
                <div className="relative z-10">
                    <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-foreground">
                        Find Your Perfect
                        <span className="block text-primary mt-2">
                            Property in Nepal
                        </span>
                    </h1>

                    <p className="mt-6 text-lg text-muted-foreground max-w-xl">
                        Explore verified homes, apartments, and land with real-time location visibility.
                    </p>

                    <div className="mt-10 bg-background border border-border p-5 rounded-2xl shadow-sm">
                        <div className="flex flex-col sm:flex-row gap-3 items-center">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Kathmandu, Lalitpur, Pokhara..."
                                    className="
                    w-full pl-12 py-4 rounded-xl
                    bg-background
                    border border-border
                    text-foreground
                    placeholder:text-muted-foreground
                    focus:outline-none
                    focus:ring-2 focus:ring-ring
                  "
                                />
                            </div>

                            <Button
                                onClick={handleSearch}
                                size="lg"
                                className="flex items-center gap-2 rounded-xl"
                            >
                                Search
                                <ArrowRight className="h-5 w-5" />
                            </Button>
                        </div>

                        <Button
                            onClick={handleUseMyLocation}
                            variant="outline"
                            className="mt-4 w-full flex items-center justify-center gap-2"
                        >
                            <LocateFixed className="h-5 w-5" />
                            Use my current location
                        </Button>
                    </div>
                </div>

                {/* RIGHT MAP */}
                <div className="h-130 w-full rounded-3xl overflow-hidden border border-border shadow-sm">
                    <LeafletMap center={mapCenter} mapRef={mapRef} />
                </div>
            </div>
        </section>
    )
}

export default HeroSection
