"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useNepalGeocoding } from "@/lib/client/queries/nepalgeocoding.queries";

interface MapClientProps {
  lat: number;
  lng: number;
}

export default function MapClient({
  lat: initialLat,
  lng: initialLng,
}: MapClientProps) {
  const router = useRouter();

  const [city, setCity] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [open, setOpen] = useState(false);

  const { data: coords, isFetching } = useNepalGeocoding(searchCity);

  const lat = coords ? coords[0] : initialLat;
  const lng = coords ? coords[1] : initialLng;

  // Update path params when coordinates change
  useEffect(() => {
    if (coords) {
      router.replace(`/map/${coords[0]}/${coords[1]}`);
    }
  }, [coords, router]);

  return (
    <div className="w-screen h-screen relative">
      {/* Sheet Trigger */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button className="absolute top-30 left-4 z-20 shadow-lg bg-blue-500 hover:bg-blue-600 text-white">
            Search City
          </Button>
        </SheetTrigger>

        {/* Sheet Content */}
        <SheetContent
          side="left"
          className="w-80 max-w-[80vw] py-6 bg-white shadow-lg overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle>Search Nepal City</SheetTitle>
          </SheetHeader>

          <form
            className="mt-6 flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              setSearchCity(city.trim());
              setOpen(false); // close sheet
            }}
          >
            <Input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city name..."
              className="w-full"
            />
            <div className="flex justify-between gap-2">
              <Button type="submit" className="flex-1" disabled={isFetching}>
                {isFetching ? "Searching..." : "Go"}
              </Button>
              <SheetClose asChild>
                <Button variant="outline" className="flex-1">
                  Cancel
                </Button>
              </SheetClose>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Google Maps iframe */}
      <iframe
        key={`${lat}-${lng}`}
        src={`https://www.google.com/maps?q=${lat},${lng}&z=10&output=embed`}
        className="w-full h-full border-0"
        loading="lazy"
      />

      {/* Loading overlay */}
      {isFetching && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-30">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
