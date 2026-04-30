"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import L from "leaflet";
import { MapPin, MapPinned } from "lucide-react";

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

// Detect dark mode safely
function isDarkMode() {
  if (typeof window === "undefined") return false;
  return document.documentElement.classList.contains("dark");
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
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => setDark(isDarkMode());

    checkTheme();

    const observer = new MutationObserver(() => {
      checkTheme();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const SelectedIcon = isUserLocation ? MapPinned : MapPin;

  function createMapPinIcon() {
    
    const iconMarkup = renderToStaticMarkup(
      <SelectedIcon
        size={36}
        strokeWidth={2.2}
        color={isUserLocation ? "#22c55e" : "#0ea5e9"}
      />
    );

    return L.divIcon({
      html: iconMarkup,
      className: "mappin-marker",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });
  }

  const lightTile = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  // CartoDB dark tiles — free, no API key required (unlike Stadia Maps which 401s in production)
  const darkTile = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

  return (
    <div className="h-full w-full">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full"
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer url={dark ? darkTile : lightTile} />

        <Marker position={center} icon={createMapPinIcon()}>
          <Popup>
            <div className="p-2 bg-card text-foreground">
              <p className="font-semibold">Selected Location</p>
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