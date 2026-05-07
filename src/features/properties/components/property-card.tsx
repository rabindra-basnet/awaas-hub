"use client";

import { Heart, MapPin, BedDouble, Bath, Maximize2, Building2 } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { useToggleFavorite } from "@/features/properties/queries/properties.queries";
import { toast } from "sonner";
import type { PropertyWithMeta } from "@/features/properties/server/properties.fetcher";
import Link from "next/link";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  available: "default",
  booked:    "secondary",
  sold:      "destructive",
};

export default function PropertyCard({ property: p }: { property: PropertyWithMeta }) {
  const toggle = useToggleFavorite();

  function handleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    toggle.mutate(
      { propertyId: p._id, isFav: p.isFavorite },
      {
        onSuccess: () =>
          toast.success(p.isFavorite ? "Removed from favorites" : "Added to favorites"),
        onError: (err) => toast.error(err.message),
      },
    );
  }

  return (
    <Link
      href={`/properties/${p._id}`}
      className="group rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow block"
    >
      {/* Image */}
      <div className="relative h-48 bg-muted overflow-hidden">
        {p.imageUrl ? (
          <img
            src={p.imageUrl}
            alt={p.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="w-10 h-10 text-muted-foreground/20" />
          </div>
        )}

        <div className="absolute top-3 left-3">
          <Badge variant={statusVariant[p.status] ?? "outline"} className="capitalize text-[10px]">
            {p.status}
          </Badge>
        </div>

        <Button
          size="icon"
          variant="ghost"
          onClick={handleFavorite}
          disabled={toggle.isPending}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm hover:bg-white dark:hover:bg-black/70"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              p.isFavorite ? "fill-rose-500 text-rose-500" : "text-muted-foreground"
            }`}
          />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
          {p.title}
        </p>

        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{p.location}</span>
        </p>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {p.bedrooms != null && (
            <span className="flex items-center gap-1">
              <BedDouble className="w-3 h-3" /> {p.bedrooms}
            </span>
          )}
          {p.bathrooms != null && (
            <span className="flex items-center gap-1">
              <Bath className="w-3 h-3" /> {p.bathrooms}
            </span>
          )}
          {p.area && (
            <span className="flex items-center gap-1">
              <Maximize2 className="w-3 h-3" /> {p.area}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <p className="font-bold">NPR {p.price.toLocaleString()}</p>
          <Badge variant="outline" className="text-[10px]">{p.category}</Badge>
        </div>
      </div>
    </Link>
  );
}
