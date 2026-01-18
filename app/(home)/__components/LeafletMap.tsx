'use client'

import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'

interface LeafletMapProps {
    center: [number, number]
    mapRef: React.MutableRefObject<L.Map | null>
}

export default function LeafletMap({ center, mapRef }: LeafletMapProps) {
    useEffect(() => {
        // Fix marker icon (client-only)
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
            iconRetinaUrl:
                'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl:
                'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl:
                'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
        })
    }, [])

    return (
        <MapContainer
            center={center}
            zoom={13}
            className="h-full w-full"
            ref={mapRef}
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={center} />
        </MapContainer>
    )
}
