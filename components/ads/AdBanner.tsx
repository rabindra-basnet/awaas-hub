"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Ad } from "@/lib/client/queries/ads.queries";
import Link from "next/link";

interface AdBannerProps {
  slot: string;
  className?: string;
  slim?: boolean;
  priority?: boolean;
}

const AdBadge = () => (
  <span className="absolute top-2 left-2 z-10 select-none text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-muted text-muted-foreground border border-border/60">
    Ads
  </span>
);

export function AdBanner({
  slot,
  className = "",
  slim = false,
  priority = false,
}: AdBannerProps) {
  const [ad, setAd] = useState<Ad | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [fetchDone, setFetchDone] = useState(false);
  const htmlRef = useRef<HTMLDivElement>(null);
  const trackedRef = useRef(false);

  useEffect(() => {
    fetch(`/api/ads?slot=${slot}`)
      .then((r) => {
        if (r.status === 204) return null;
        return r.json();
      })
      .then((data) => {
        if (data && data._id) setAd(data);
      })
      .catch(() => {})
      .finally(() => setFetchDone(true));
  }, [slot]);

  useEffect(() => {
    if (ad?._id && !trackedRef.current) {
      trackedRef.current = true;
      fetch(`/api/ads/${ad._id}/impression`, { method: "POST" }).catch(
        () => {},
      );
    }
  }, [ad]);

  useEffect(() => {
    if (!ad?.htmlContent || !htmlRef.current) return;
    const range = document.createRange();
    range.selectNode(htmlRef.current);
    const fragment = range.createContextualFragment(ad.htmlContent);
    htmlRef.current.innerHTML = "";
    htmlRef.current.appendChild(fragment);
  }, [ad?.htmlContent]);

  if (!fetchDone || !ad) return null;

  const handleClick = () => {
    fetch(`/api/ads/${ad._id}/click`, { method: "POST" }).catch(() => {});
  };

  if (slim) {
    return (
      <div className={`relative w-full ${className}`}>
        <AdBadge />
        <span className="absolute top-1 right-2 z-10 select-none text-[9px] font-semibold tracking-widest text-white/60 uppercase drop-shadow">
          Sponsored
        </span>

        {ad.htmlContent ? (
          <div
            ref={htmlRef}
            onClick={handleClick}
            className="w-full h-16 rounded-xl overflow-hidden border border-border/40 cursor-pointer bg-muted/30"
          />
        ) : (
          <Link
            href={ad.targetUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={handleClick}
            className="flex items-center gap-3 w-full h-16 rounded-xl overflow-hidden border border-border/40 hover:border-border transition-colors bg-muted/20 hover:bg-muted/40 px-3 group"
          >
            {ad.imageUrl && (
              <div className="relative shrink-0 w-24 h-10 rounded-lg overflow-hidden">
                <img
                  src={ad.imageUrl}
                  alt={ad.altText ?? "Ad"}
                  fill
                  sizes="96px"
                  className="object-cover"
                  priority={priority}
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              {ad.title && (
                <p className="text-xs font-semibold truncate text-foreground group-hover:text-primary transition-colors">
                  {ad.title}
                </p>
              )}
              {ad.altText && (
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                  {ad.altText}
                </p>
              )}
            </div>
            <div className="shrink-0 text-[10px] font-bold text-primary border border-primary/30 rounded-full px-2.5 py-1 group-hover:bg-primary group-hover:text-primary-foreground transition-all whitespace-nowrap">
              Learn More →
            </div>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className={`relative flex justify-start ${className}`}>
      <AdBadge />

      {ad.htmlContent ? (
        <div
          ref={htmlRef}
          onClick={handleClick}
          className="rounded-xl overflow-hidden border border-dashed border-muted-foreground/20 cursor-pointer"
        />
      ) : (
        <Link
          href={ad.targetUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={handleClick}
          className="rounded-xl overflow-hidden border border-dashed border-muted-foreground/20 hover:border-muted-foreground/40 hover:opacity-90 transition-all"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ad.imageUrl!}
            alt={ad.altText ?? "Advertisement"}
            className={`block max-w-full h-auto max-h-32 transition-opacity duration-300 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setLoaded(true)}
            loading={priority ? "eager" : "lazy"}
          />
          {!loaded && (
            <div className="w-64 h-20 bg-muted/40 animate-pulse rounded-xl" />
          )}
        </Link>
      )}
    </div>
  );
}
