"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Heart,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Ruler,
  CheckCircle2,
  ArrowRight,
  BadgeDollarSign,
} from "lucide-react";
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

interface PropertyListCardProps {
  property: any;
  canManage: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string, isFav: boolean) => void;
  onDelete: (id: string) => void;
}

const FALLBACK =
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80";

const STATUS_STYLES: Record<string, string> = {
  sold: "bg-red-500/90 text-white",
  booked: "bg-amber-500/90 text-white",
  available: "bg-emerald-500/90 text-white",
};

export default function PropertyListCard({
  property,
  canManage,
  isFavorite,
  onToggleFavorite,
  onDelete,
}: PropertyListCardProps) {
  const router = useRouter();
  const [idx, setIdx] = useState(0);

  const images: string[] =
    Array.isArray(property.images) && property.images.length > 0
      ? property.images
      : [FALLBACK];

  const prev = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIdx((i) => (i - 1 + images.length) % images.length);
    },
    [images.length],
  );
  const next = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIdx((i) => (i + 1) % images.length);
    },
    [images.length],
  );

  const isSold = property.status?.toLowerCase() === "sold";
  const statusLabel =
    property.status?.charAt(0).toUpperCase() + property.status?.slice(1) ||
    "Available";
  const statusStyle =
    STATUS_STYLES[property.status?.toLowerCase()] || STATUS_STYLES.available;

  return (
    <div className="group flex flex-col rounded-2xl overflow-hidden bg-card border border-border/50 hover:border-border hover:shadow-lg transition-all duration-300">
      {/* ── IMAGE ── */}
      <div
        className="relative aspect-[4/3] overflow-hidden cursor-pointer bg-muted"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("button,a,[role='menuitem']"))
            return;
          router.push(`/properties/${property._id}`);
        }}
      >
        {/* Slides */}
        <div
          className="flex h-full transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${idx * 100}%)`,
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
                alt={property.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className={cn(
                  "object-cover transition-transform duration-700 group-hover:scale-[1.03]",
                  isSold && "grayscale-[30%]",
                )}
              />
            </div>
          ))}
        </div>

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

        {/* Sold ribbon */}
        {isSold && (
          <div className="absolute inset-0 bg-black/20 pointer-events-none flex items-center justify-center">
            <span className="rotate-[-35deg] text-white text-2xl font-black tracking-widest uppercase opacity-20 select-none">
              Sold
            </span>
          </div>
        )}

        {/* Top overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <div className="flex flex-col gap-1.5">
            {/* Status pill */}
            <span
              className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide backdrop-blur-sm",
                statusStyle,
              )}
            >
              {statusLabel}
            </span>

            {/* Verified badge */}
            {property.verificationStatus === "verified" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-background/80 text-emerald-600 backdrop-blur-sm">
                <CheckCircle2 size={9} /> Verified
              </span>
            )}
          </div>

          {/* Actions: favorite + manage */}
          <div className="flex items-center gap-1.5">
            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(property._id, !!isFavorite);
                }}
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all",
                  isFavorite
                    ? "bg-white text-red-500"
                    : "bg-black/40 text-white opacity-0 group-hover:opacity-100 hover:bg-white hover:text-red-500",
                )}
              >
                <Heart
                  size={14}
                  className={cn(isFavorite && "fill-current")}
                />
              </button>
            )}

            {canManage && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="h-8 w-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
                  >
                    <MoreHorizontal size={14} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 rounded-xl">
                  <DropdownMenuItem asChild className="cursor-pointer gap-2">
                    <Link href={`/properties/${property._id}/edit`}>
                      <Pencil size={13} /> Edit
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

        {/* Price on image */}
        <div className="absolute bottom-3 left-3">
          <div className="flex items-center gap-1">
            <BadgeDollarSign size={13} className="text-white/80" />
            <span className="text-white text-sm font-black drop-shadow-sm">
              NPR {new Intl.NumberFormat("en-IN").format(property.price)}
            </span>
          </div>
        </div>

        {/* Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 backdrop-blur-sm"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={next}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 backdrop-blur-sm"
            >
              <ChevronRight size={14} />
            </button>
            {/* Dots */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIdx(i);
                  }}
                  className={cn(
                    "rounded-full transition-all duration-300",
                    i === idx
                      ? "w-3.5 h-1.5 bg-white"
                      : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80",
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── BODY ── */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        {/* Title */}
        <h3
          className="font-semibold text-sm leading-snug line-clamp-1 cursor-pointer hover:text-primary transition-colors"
          onClick={() => router.push(`/properties/${property._id}`)}
        >
          {property.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin size={11} className="text-destructive shrink-0" />
          <span className="truncate">{property.location || "N/A"}</span>
        </div>

        {/* Meta chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {property.category && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-primary/8 text-primary rounded-full px-2 py-0.5">
              {property.category}
            </span>
          )}
          {property.area && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted/60 rounded-full px-2 py-0.5">
              <Ruler size={9} /> {property.area} Aana
            </span>
          )}
          {property.negotiable && (
            <span className="inline-flex items-center text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 rounded-full px-2 py-0.5">
              Negotiable
            </span>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA */}
        <button
          onClick={() => router.push(`/properties/${property._id}`)}
          className={cn(
            "mt-1 flex items-center justify-center gap-1.5 w-full h-9 rounded-xl text-xs font-semibold transition-all",
            isSold
              ? "border border-border text-muted-foreground hover:bg-muted/40"
              : "bg-primary text-primary-foreground hover:bg-primary/90",
          )}
        >
          {isSold ? "View Details" : "View Property"}
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}
