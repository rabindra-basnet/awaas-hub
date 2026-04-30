"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MapPin, Heart, Tag, ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToggleFavorite } from "@/lib/client/queries/properties.queries";
import { cn } from "@/lib/utils";

interface Props {
  property: any;
  onRemove: (id: string) => void;
}

const FALLBACK =
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80";

export default function FavouriteDetailsCard({ property, onRemove }: Props) {
  const router = useRouter();
  const toggleFav = useToggleFavorite();
  const [confirm, setConfirm] = useState(false);

  const image =
    Array.isArray(property.images) && property.images.length > 0
      ? property.images[0]
      : FALLBACK;

  const isSold = property.status?.toLowerCase() === "sold";
  const statusLabel = isSold ? "Sold" : property.status === "booked" ? "Booked" : "Available";
  const statusCls = isSold
    ? "bg-red-500/10 text-red-600 border-red-200 dark:text-red-400"
    : property.status === "booked"
      ? "bg-amber-500/10 text-amber-600 border-amber-200"
      : "bg-emerald-500/10 text-emerald-600 border-emerald-200";

  return (
    <>
      <div className="group rounded-2xl border border-border/60 bg-card overflow-hidden hover:shadow-md transition-all duration-300">
        {/* Image */}
        <div className="relative h-44 overflow-hidden bg-muted">
          <Image
            src={image}
            alt={property.title || "Property"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={cn(
              "object-cover transition-transform duration-500 group-hover:scale-105",
              isSold && "grayscale-[40%]",
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

          {/* Status pill */}
          <div className="absolute top-3 left-3">
            <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold bg-background/80 backdrop-blur-sm", statusCls)}>
              <Tag size={9} /> {statusLabel}
            </span>
          </div>

          {/* Remove button */}
          <button
            onClick={() => setConfirm(true)}
            disabled={toggleFav.isPending}
            className="absolute top-3 right-3 h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Heart size={13} className="fill-current text-destructive" />
          </button>

          {/* Price */}
          <div className="absolute bottom-3 left-3">
            <span className="text-white text-sm font-black drop-shadow">
              NPR {new Intl.NumberFormat("en-IN").format(property.price)}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-2.5">
          <div>
            <h3 className="font-semibold text-sm leading-tight line-clamp-1">
              {property.title || "Untitled Property"}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <MapPin size={11} className="text-destructive shrink-0" />
              <span className="truncate">{property.location || "N/A"}</span>
            </div>
          </div>

          {isSold && (
            <div className="flex items-center gap-1.5 rounded-lg bg-red-500/8 border border-red-200/60 px-2.5 py-1.5">
              <Info size={11} className="text-red-500 shrink-0" />
              <span className="text-[11px] text-red-600 dark:text-red-400 font-medium">
                This property has been sold
              </span>
            </div>
          )}

          <Button
            size="sm"
            variant={isSold ? "outline" : "default"}
            className="w-full h-8 rounded-lg text-xs font-semibold gap-1.5"
            onClick={() => router.push(`/properties/${property._id}?from=favorites`)}
          >
            View Details <ArrowRight size={12} />
          </Button>
        </div>
      </div>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Favorites?</AlertDialogTitle>
            <AlertDialogDescription>
              Remove <span className="font-semibold text-foreground">{property.title}</span> from your favorites? You can always add it back.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl" disabled={toggleFav.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={toggleFav.isPending}
              onClick={() =>
                toggleFav.mutate(
                  { propertyId: property._id, isFav: true },
                  { onSuccess: () => { onRemove(property._id); setConfirm(false); } },
                )
              }
            >
              {toggleFav.isPending ? "Removing…" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
