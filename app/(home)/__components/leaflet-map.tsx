// 'use client'

// import { MapContainer, TileLayer, Marker } from 'react-leaflet'
// import L from 'leaflet'
// import 'leaflet/dist/leaflet.css'
// import { useEffect } from 'react'

// interface LeafletMapProps {
//     center: [number, number]
//     mapRef: React.MutableRefObject<L.Map | null>
// }

// export default function LeafletMap({ center, mapRef }: LeafletMapProps) {
//     useEffect(() => {
//         // Fix marker icon (client-only)
//         delete (L.Icon.Default.prototype as any)._getIconUrl
//         L.Icon.Default.mergeOptions({
//             iconRetinaUrl:
//                 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
//             iconUrl:
//                 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
//             shadowUrl:
//                 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
//         })
//     }, [])

//     return (
//         <MapContainer
//             center={center}
//             zoom={13}
//             className="h-full w-full"
//             ref={mapRef}
//         >
//             <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//             <Marker position={center} />
//         </MapContainer>
//     )
// }

"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import L from "leaflet";
import { MapPin, MapPinned } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface MapUpdaterProps {
  center: [number, number];
  mapRef: React.MutableRefObject<any>;
}

function MapUpdater({ center, mapRef }: MapUpdaterProps) {
  const map = useMap();

  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);

  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);

  return null;
}

interface LeafletMapProps {
  center: [number, number];
  mapRef: React.MutableRefObject<any>;
  isUserLocation?: boolean;
}

export default function LeafletMap({
  center,
  mapRef,
  isUserLocation = false,
}: LeafletMapProps) {
  const SelectedIcon = isUserLocation ? MapPinned : MapPin;
  function createMapPinIcon() {
    const iconMarkup = renderToStaticMarkup(
      <SelectedIcon
        size={36}
        strokeWidth={2.2}
        // color={isUserLocation ? "#16a34a" : "#0891b2"}
        // fill={isUserLocation ? "#16a34a" : "#0891b2"}
      />,
    );

    return L.divIcon({
      html: iconMarkup,
      className: "mappin-marker",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });
  }
  return (
    <div className="h-full w-full">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full"
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={center} icon={createMapPinIcon()}>
          <Popup>
            <div className="p-2">
              <p className="font-semibold text-foreground">Selected Location</p>
              <p className="text-sm text-muted-foreground">
                {center[0].toFixed(4)}, {center[1].toFixed(4)}
              </p>
            </div>
          </Popup>
        </Marker>
        <MapUpdater center={center} mapRef={mapRef} />
      </MapContainer>
    </div>
  );
}
