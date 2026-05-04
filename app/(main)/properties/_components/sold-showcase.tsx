"use client";

import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  CalendarCheck,
  Clock4,
  Layers,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const FALLBACK =
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80";

interface SoldShowcaseProps {
  properties: any[];
  className?: string;
}

function formatSoldDate(date: Date) {
  const now = Date.now();
  const diff = Math.floor((now - date.getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 30) return `${diff}d ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function SoldPropertiesShowcase({
  properties,
  className,
}: SoldShowcaseProps) {
  if (!properties.length) return null;

  return (
    <section className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="block w-1 h-4 rounded-full bg-rose-500" />
            <span className="block w-1 h-4 rounded-full bg-rose-500/40" />
          </div>
          <h2 className="text-sm font-bold tracking-tight">
            Recently Sold
          </h2>
          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500/10 text-rose-600 text-[10px] font-bold tabular-nums">
            {properties.length}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground hidden sm:block">
          Completed transactions
        </p>
      </div>

      {/* Horizontal scroll strip */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory">
        {properties.map((p) => (
          <SoldCard key={p._id} property={p} />
        ))}
      </div>

      <div className="h-px bg-border/40" />
    </section>
  );
}

function SoldCard({ property: p }: { property: any }) {
  const image =
    Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : FALLBACK;

  const soldAt = p.soldAt ? new Date(p.soldAt) : null;
  const createdAt = p.createdAt ? new Date(p.createdAt) : null;

  const daysOnMarket =
    soldAt && createdAt
      ? Math.max(
          0,
          Math.floor((soldAt.getTime() - createdAt.getTime()) / 86_400_000),
        )
      : null;

  return (
    <Link
      href={`/properties/${p._id}`}
      className="group flex-none w-64 snap-start rounded-2xl overflow-hidden border border-border/50 bg-card hover:border-rose-200 dark:hover:border-rose-900 hover:shadow-lg transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-[130px] overflow-hidden bg-muted">
        <Image
          src={image}
          alt={p.title}
          fill
          sizes="256px"
          className="object-cover grayscale-[55%] brightness-90 group-hover:grayscale-[35%] group-hover:brightness-95 transition-all duration-500"
        />

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent pointer-events-none" />

        {/* Diagonal SOLD ribbon */}
        <div className="absolute top-0 right-0 overflow-hidden w-16 h-16 pointer-events-none">
          <div className="absolute top-3.5 right-[-18px] bg-rose-500 text-white text-[9px] font-black tracking-[0.15em] uppercase py-[3px] px-7 rotate-[45deg] shadow-md">
            Sold
          </div>
        </div>

        {/* Category pill */}
        {p.category && (
          <div className="absolute top-2.5 left-2.5">
            <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-black/50 text-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full">
              <Layers size={8} /> {p.category}
            </span>
          </div>
        )}

        {/* Price */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between">
          <div>
            <p className="text-white text-[13px] font-black leading-none drop-shadow">
              NPR {new Intl.NumberFormat("en-IN").format(p.price)}
            </p>
          </div>
          {daysOnMarket !== null && (
            <span className="flex items-center gap-0.5 text-[9px] font-semibold text-white/70">
              <Clock4 size={8} /> {daysOnMarket}d listed
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-3 space-y-2">
        <div>
          <h4 className="text-[12px] font-semibold line-clamp-1 text-foreground group-hover:text-rose-600 transition-colors">
            {p.title}
          </h4>
          <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground">
            <MapPin size={9} className="shrink-0 text-rose-400" />
            <span className="truncate">{p.location || "N/A"}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border/50" />

        {/* Footer */}
        <div className="flex items-center justify-between">
          {soldAt ? (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <CalendarCheck size={9} className="text-rose-400 shrink-0" />
              {formatSoldDate(soldAt)}
            </span>
          ) : (
            <span className="text-[10px] text-muted-foreground/50">—</span>
          )}
          <span className="flex items-center gap-0.5 text-[10px] font-semibold text-rose-500 group-hover:gap-1.5 transition-all">
            Details <ChevronRight size={10} />
          </span>
        </div>
      </div>
    </Link>
  );
}
