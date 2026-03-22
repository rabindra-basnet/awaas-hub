"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Banknote,
  Eye,
  CalendarCheck,
  Info,
  MoreHorizontal,
  Pencil,
  Heart,
  ChevronLeft,
  ChevronRight,
  Delete,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { is } from "zod/v4/locales";

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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "sold":
        return "bg-red-50 text-red-700 border-red-200";
      case "booked":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
  };

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
      <CardContent className="p-0 pt-3 flex flex-col gap-2.5">
        <div className="bg-muted/30 p-2.5 rounded-xl border border-border/40">
          <h3 className="font-bold text-xs tracking-wide line-clamp-1 text-foreground uppercase">
            {property.title}
          </h3>
        </div>

        <div className="bg-muted/30 p-2.5 rounded-xl border border-border/40 flex items-center">
          <MapPin size={14} className="mr-2 text-destructive shrink-0" />
          <span className="text-[11px] font-bold truncate uppercase text-muted-foreground">
            {property.location}
          </span>
        </div>

        <div className="bg-muted/30 p-2.5 rounded-xl border border-border/40 flex items-center">
          <Banknote size={14} className="mr-2 text-primary shrink-0" />
          <span className="text-[11px] font-black text-primary uppercase truncate">
            NPR. {new Intl.NumberFormat("en-IN").format(property.price)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="h-10 rounded-xl font-bold text-[10px] uppercase tracking-wider border"
            onClick={() => router.push(`/properties/${property._id}`)}
          >
            <Eye size={14} className="mr-2" /> View
          </Button>
          <div
            className={cn(
              "flex items-center justify-center rounded-xl border text-[9px] font-black uppercase tracking-tighter text-center px-1",
              getStatusColor(property.status),
            )}
          >
            <Info size={12} className="mr-1.5" />{" "}
            {property.status || "Available"}
          </div>
        </div>

        <Button
          className="w-full h-11 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-sm mt-0.5"
          onClick={() =>
            router.push(`/appointments/new?propertyId=${property._id}`)
          }
        >
          <CalendarCheck size={14} className="mr-2" /> Book Now
        </Button>
      </CardContent>
    </Card>
  );
}
