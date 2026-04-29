"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Banknote,
  Eye,
  Info,
  MoreHorizontal,
  Pencil,
  Heart,
  ChevronLeft,
  ChevronRight,
  Tag,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import DeletePropertyDialog from "./delete-property";
import Link from "next/link";

interface PropertyListCardProps {
  property: any;
  canManage: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string, isFav: boolean) => void;
  onDelete: (id: string) => void;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa";

export default function PropertyListCard({
  property,
  canManage,
  isFavorite,
  onToggleFavorite,
  onDelete,
}: PropertyListCardProps) {
  const router = useRouter();

  const images: string[] =
    Array.isArray(property.images) && property.images.length > 0
      ? property.images
      : [FALLBACK_IMAGE];

  const [activeIndex, setActiveIndex] = useState(0);

  const prev = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setActiveIndex((i) => (i - 1 + images.length) % images.length);
    },
    [images.length],
  );

  const next = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setActiveIndex((i) => (i + 1) % images.length);
    },
    [images.length],
  );

  const goTo = useCallback((e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setActiveIndex(index);
  }, []);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(property._id, !isFavorite);
  };

  // console.log("Hello favorite", isFavorite);

  const isSold = property.status?.toLowerCase() === "sold";
  const isBooked = property.status?.toLowerCase() === "booked";

  const statusConfig = {
    sold: { label: "Sold", classes: "bg-red-500/10 text-red-600 border-red-200 dark:text-red-400" },
    booked: { label: "Booked", classes: "bg-amber-500/10 text-amber-600 border-amber-200 dark:text-amber-400" },
    available: { label: "Available", classes: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:text-emerald-400" },
  };
  const statusKey = isSold ? "sold" : isBooked ? "booked" : "available";
  const status = statusConfig[statusKey];

  return (
    <Card className="group overflow-hidden rounded-3xl border border-border/60 shadow-sm hover:shadow-md transition-all duration-300 bg-card p-3">
      {/* ── CAROUSEL ── */}
      <div
        className="relative aspect-16/10 cursor-pointer overflow-hidden rounded-2xl"
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest("button, a, [role='menuitem']")) return;
          router.push(`/properties/${property._id}`);
        }}
      >
        {/* SLIDES */}
        <div
          className="flex h-full transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${activeIndex * 100}%)`,
            width: `${images.length * 100}%`,
          }}
        >
          {images.map((src, i) => (
            <div
              key={i}
              className="relative h-full shrink-0"
              style={{ width: `${100 / images.length}%` }}
            >
              <Image
                src={src}
                alt={`${property.title} – photo ${i + 1}`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                loading="eager"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          ))}
        </div>

        {/* GRADIENT OVERLAY — bottom */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-black/40 to-transparent pointer-events-none" />

        {/* TOP ROW: badge + fav + manage */}
        <div className="absolute top-3 left-3 flex justify-between w-[90%] items-center">
          <Badge
            variant="secondary"
            className="bg-black/60 text-white text-[10px] py-0.5 px-2 backdrop-blur-md border-none font-bold"
          >
            ID: {property._id.toString().slice(-5).toUpperCase()}
          </Badge>

          <div className="flex items-center gap-1.5">
            {onToggleFavorite && (
              <Button
                variant="secondary"
                size="icon"
                onClick={handleFavoriteClick}
                className={cn(
                  "h-7 w-7 rounded-full backdrop-blur-sm transition-all",
                  isFavorite
                    ? "bg-red-500 text-white opacity-100 hover:bg-red-600"
                    : "bg-white/80 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-500",
                )}
              >
                <Heart size={13} className={cn(isFavorite && "fill-current")} />
              </Button>
            )}

            {canManage && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-7 w-7 rounded-full bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal size={14} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 rounded-xl">
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer gap-2 font-bold"
                  >
                    <Link href={`/properties/${property._id}/edit`}>
                      <Pencil size={14} /> Edit
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <div className="p-1">
                    <DeletePropertyDialog
                      propertyId={property._id}
                      onDelete={onDelete}
                    />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* PREV / NEXT ARROWS — only when multiple images */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm hover:bg-black/70"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm hover:bg-black/70"
            >
              <ChevronRight size={15} />
            </button>
          </>
        )}

        {/* DOT INDICATORS — bottom center */}
        {images.length > 1 && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => goTo(e, i)}
                className={cn(
                  "rounded-full transition-all duration-300",
                  i === activeIndex
                    ? "w-4 h-1.5 bg-white"
                    : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80",
                )}
              />
            ))}
          </div>
        )}

        {/* IMAGE COUNTER — top-right of image when > 1 */}
        {images.length > 1 && (
          <div className="absolute bottom-2.5 right-3 text-[10px] font-bold text-white/80 tabular-nums">
            {activeIndex + 1}/{images.length}
          </div>
        )}
      </div>

      {/* ── CARD BODY ── */}
      <CardContent className="p-0 pt-3 flex flex-col gap-2">
        {/* Title + status */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-xs tracking-wide line-clamp-1 text-foreground flex-1">
            {property.title}
          </h3>
          <span
            className={cn(
              "shrink-0 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold",
              status.classes,
            )}
          >
            <Tag size={9} />
            {status.label}
          </span>
        </div>

        {/* Sold overlay info */}
        {isSold && (
          <div className="rounded-xl bg-red-500/8 border border-red-200/60 dark:border-red-800/40 px-3 py-2 flex items-center gap-2">
            <Info size={12} className="text-red-500 shrink-0" />
            <span className="text-[11px] text-red-600 dark:text-red-400 font-semibold">
              This property has been sold
            </span>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <MapPin size={12} className="text-destructive shrink-0" />
          <span className="truncate font-medium">{property.location}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Banknote size={12} className="text-primary shrink-0" />
          <span className="text-[12px] font-black text-primary">
            NPR {new Intl.NumberFormat("en-IN").format(property.price)}
          </span>
        </div>

        <Button
          variant={isSold ? "outline" : "default"}
          className="w-full h-9 rounded-xl font-bold text-[11px] mt-1"
          onClick={() => router.push(`/properties/${property._id}`)}
        >
          <Eye size={13} className="mr-1.5" />
          {isSold ? "View Details" : "View Property"}
        </Button>
      </CardContent>
    </Card>
  );
}
