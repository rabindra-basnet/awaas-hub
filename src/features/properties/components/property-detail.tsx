"use client";

import { useState, useEffect, Suspense } from "react";
import { useProperty, useToggleFavorite } from "@/features/properties/queries/properties.queries";
import { authClient } from "@/features/auth/client/auth-client";
import { Role } from "@/features/auth/rbac/access";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Heart, Share2, MapPin, BedDouble, Bath, Maximize2, Navigation,
  Home, CheckCircle2, XCircle, Phone, MessageCircle, ArrowLeft,
  ExternalLink, Building2, Lock, Coins, ShieldCheck, CreditCard,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const PropertyChatPanel = dynamic(
  () => import("@/features/chat/components/property-chat-panel"),
  { loading: () => <Skeleton className="h-full w-full" /> },
);

type Props = { id: string };

type UnlockState =
  | { status: "loading" }
  | { status: "owner" }
  | { status: "unlocked"; remaining: number | null }
  | { status: "locked"; remaining: number }
  | { status: "no_credits" };

const statusCfg: Record<string, { label: string; cls: string }> = {
  available: { label: "Available", cls: "property-badge-available" },
  booked:    { label: "Booked",    cls: "property-badge-booked"    },
  sold:      { label: "Sold",      cls: "property-badge-sold"      },
};

const verifyCfg: Record<string, { label: string; cls: string }> = {
  pending:  { label: "Pending",  cls: "property-badge-pending"  },
  verified: { label: "Verified", cls: "property-badge-verified" },
  rejected: { label: "Rejected", cls: "property-badge-rejected" },
};

export default function PropertyDetail({ id }: Props) {
  const { data: property } = useProperty(id);
  const { data: session }  = authClient.useSession();
  const toggle             = useToggleFavorite();
  const router             = useRouter();
  const [heroIdx, setHeroIdx] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [unlockState, setUnlockState] = useState<UnlockState>({ status: "loading" });
  const [unlocking, setUnlocking] = useState(false);

  const user    = session?.user;
  const isAnon  = !!(user as any)?.isAnonymous;
  const isGuest = !user || isAnon;
  const isAdmin = user?.role === Role.ADMIN;
  const isOwner = !isGuest && property.sellerId === user?.id;

  // Load unlock status
  useEffect(() => {
    if (isGuest) return;
    fetch(`/api/properties/${id}/unlock`)
      .then((r) => r.json())
      .then((d) => {
        if (d.isOwner || isAdmin) {
          setUnlockState({ status: "owner" });
        } else if (d.unlocked) {
          setUnlockState({ status: "unlocked", remaining: d.remainingCredits });
        } else if (d.remainingCredits > 0) {
          setUnlockState({ status: "locked", remaining: d.remainingCredits });
        } else {
          setUnlockState({ status: "no_credits" });
        }
      })
      .catch(() => setUnlockState({ status: "no_credits" }));
  }, [id, isGuest, isAdmin]);

  const handleUnlock = async () => {
    setUnlocking(true);
    try {
      const res = await fetch(`/api/properties/${id}/unlock`, { method: "POST" });
      const d   = await res.json();
      if (!res.ok) {
        if (res.status === 403) {
          toast.error(d.message);
          setUnlockState({ status: "no_credits" });
          return;
        }
        throw new Error(d.message);
      }
      setUnlockState({ status: "unlocked", remaining: d.remainingCredits });
      toast.success("Property unlocked! 1 credit used.");
    } catch (e: any) {
      toast.error(e.message || "Failed to unlock");
    } finally {
      setUnlocking(false);
    }
  };

  const status = statusCfg[property.status]             ?? statusCfg.available;
  const verify = verifyCfg[property.verificationStatus] ?? verifyCfg.pending;
  const images: { url: string; filename: string }[] = property.images ?? [];
  const heroImage = images[heroIdx] ?? null;

  const facilities = [
    { key: "nearHospital",    label: "Hospital"    },
    { key: "nearSchool",      label: "School"      },
    { key: "nearSupermarket", label: "Supermarket" },
    { key: "nearTransport",   label: "Transport"   },
    { key: "nearAtm",         label: "ATM"         },
    { key: "nearRestaurant",  label: "Restaurant"  },
    { key: "nearGym",         label: "Gym"         },
    { key: "nearAirport",     label: "Airport"     },
  ].filter((f) => !!(property as any)[f.key]);

  const handleShare = async () => {
    const url = window.location.href;
    if ("share" in navigator) {
      try { await navigator.share({ title: property.title, url }); return; } catch {}
    }
    await navigator.clipboard.writeText(url);
    toast.success("Link copied");
  };

  const handleFavorite = () => {
    if (isGuest) { toast.info("Sign in to save this property"); return; }
    toggle.mutate(
      { propertyId: id, isFav: property.isFavorite },
      {
        onSuccess: () => toast.success(property.isFavorite ? "Removed from favorites" : "Saved"),
        onError:   (e) => toast.error(e.message),
      },
    );
  };

  const isUnlocked = unlockState.status === "unlocked" || unlockState.status === "owner";
  const hasAccess  = isUnlocked || isOwner || isAdmin;

  return (
    <div className="min-h-full pb-16">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Button variant="ghost" size="sm" className="-ml-2" render={<Link href="/properties" />} nativeButton={false}>
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Properties
          </Button>
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleFavorite} className="property-icon-btn static w-9 h-9 border border-border">
              <Heart className={`w-4 h-4 ${!isGuest && property.isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
            </button>
            <button type="button" onClick={handleShare} className="property-icon-btn static w-9 h-9 border border-border">
              <Share2 className="w-4 h-4" />
            </button>
            {(isAdmin || isOwner) && (
              <Button size="sm" variant="outline" render={<Link href={`/properties/${id}/edit`} />} nativeButton={false}>
                Edit
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-8">

        {/* ── Hero gallery ── */}
        <div className="rounded-2xl overflow-hidden bg-muted">
          <div className="relative aspect-[16/7] w-full">
            {heroImage ? (
              <Image src={heroImage.url} alt={property.title} fill className="object-cover" priority />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/60">
                <Building2 className="w-20 h-20 text-muted-foreground/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            <span className={`absolute bottom-4 left-4 property-badge text-sm px-3 py-1 ${status.cls}`}>{status.label}</span>
            {property.verificationStatus !== "verified" && (
              <span className={`absolute top-4 left-4 property-badge ${verify.cls}`}>{verify.label}</span>
            )}
            {images.length > 0 && (
              <span className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
                {heroIdx + 1} / {images.length}
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto scrollbar-thin bg-muted/60">
              {images.map((img, i) => (
                <button key={i} type="button" onClick={() => setHeroIdx(i)}
                  className={`relative shrink-0 w-20 h-14 rounded-lg overflow-hidden transition-all outline-none ${
                    i === heroIdx ? "ring-2 ring-primary ring-offset-1" : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image src={img.url} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Left: main content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs capitalize">{property.category}</Badge>
                {property.negotiable && <Badge variant="outline" className="text-xs">Negotiable</Badge>}
              </div>
              <h1 className="text-2xl font-bold leading-snug">{property.title}</h1>
              <p className="flex items-center gap-1.5 text-muted-foreground text-sm">
                <MapPin className="w-4 h-4 shrink-0" />
                {property.location}
                {property.municipality && <span>· {property.municipality}</span>}
                {property.wardNo && <span>Ward {property.wardNo}</span>}
              </p>
            </div>

            {/* Key stats */}
            {[
              property.bedrooms  != null && { icon: BedDouble,  label: "Bedrooms",  value: property.bedrooms },
              property.bathrooms != null && { icon: Bath,        label: "Bathrooms", value: property.bathrooms },
              property.area               && { icon: Maximize2,  label: "Area",      value: property.area },
              property.face               && { icon: Navigation, label: "Facing",    value: property.face },
            ].filter(Boolean).length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  property.bedrooms  != null && { icon: BedDouble,  label: "Bedrooms",  value: property.bedrooms },
                  property.bathrooms != null && { icon: Bath,        label: "Bathrooms", value: property.bathrooms },
                  property.area               && { icon: Maximize2,  label: "Area",      value: property.area },
                  property.face               && { icon: Navigation, label: "Facing",    value: property.face },
                ].filter(Boolean).map((stat: any) => (
                  <div key={stat.label} className="rounded-xl border border-border bg-card p-4 text-center space-y-1">
                    <stat.icon className="w-5 h-5 mx-auto text-muted-foreground" />
                    <p className="font-bold text-sm">{stat.value}</p>
                    <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Description */}
            {property.description && (
              <div className="space-y-2">
                <h2 className="text-label">Description</h2>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{property.description}</p>
              </div>
            )}

            {/* Property details */}
            {[
              ["Road Type", property.roadType],
              ["Road Access", property.roadAccess],
              ["Ring Road", property.ringRoad],
              ["Municipality", property.municipality],
              ["Ward No.", property.wardNo],
            ].filter(([, v]) => v).length > 0 && (
              <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
                <div className="px-5 py-3 text-sm font-semibold">Property Details</div>
                {[
                  ["Road Type", property.roadType],
                  ["Road Access", property.roadAccess],
                  ["Ring Road", property.ringRoad],
                  ["Municipality", property.municipality],
                  ["Ward No.", property.wardNo],
                ].filter(([, v]) => v).map(([label, value]) => (
                  <div key={label as string} className="flex justify-between px-5 py-3 text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium capitalize">{value as string}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Nearby facilities */}
            {facilities.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-label">Nearby Facilities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {facilities.map((f) => (
                    <div key={f.key} className="flex items-start gap-2.5 rounded-xl border border-border bg-card p-3">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium">{f.label}</p>
                        <p className="text-xs text-muted-foreground truncate">{(property as any)[f.key]}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video tour — always visible */}
            {property.videoUrl && hasAccess && (
              <a href={property.videoUrl} target="_blank" rel="noreferrer"
                className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4 hover:bg-muted/30 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ExternalLink className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">Watch Virtual Tour</p>
                  <p className="text-xs text-muted-foreground truncate max-w-xs">{property.videoUrl}</p>
                </div>
              </a>
            )}

            {/* Chat panel — after unlock */}
            {!isGuest && !isOwner && hasAccess && user && (
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowChat((v) => !v)}
                  className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors text-left border-b border-border"
                >
                  <MessageCircle className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">Message Seller</span>
                  <span className="ml-auto text-xs text-muted-foreground">{showChat ? "Close" : "Open"}</span>
                </button>
                {showChat && (
                  <div className="h-96">
                    <Suspense fallback={<Skeleton className="h-full w-full" />}>
                      <PropertyChatPanel propertyId={id} userId={user.id} userName={user.name ?? "You"} />
                    </Suspense>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: price + CTA sidebar */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4 lg:sticky lg:top-20">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Asking Price</p>
                <p className="text-3xl font-bold tabular-nums">
                  NPR {property.price?.toLocaleString()}
                </p>
                {property.negotiable && <p className="text-xs text-green-600 mt-1">Price is negotiable</p>}
              </div>

              <div className="space-y-2.5 pt-1">
                {/* Guest: prompt to sign in */}
                {isGuest ? (
                  <>
                    <Button className="w-full" render={<Link href={`/login?callbackUrl=/properties/${id}`} />} nativeButton={false}>
                      <Phone className="w-4 h-4 mr-2" /> Sign in to View Details
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">Free to browse · Sign in to unlock</p>
                  </>
                ) : isOwner || isAdmin ? (
                  /* Owner / Admin: direct actions */
                  <div className="space-y-2">
                    <div className="rounded-lg bg-muted/60 px-4 py-3 text-sm text-muted-foreground text-center flex items-center justify-center gap-2">
                      <Home className="w-4 h-4" />
                      {isOwner ? "Your listing" : "Admin view"}
                    </div>
                    {isAdmin && property.verificationStatus === "pending" && (
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700" render={<Link href={`/properties/${id}/verify`} />} nativeButton={false}>
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Verify
                        </Button>
                        <Button size="sm" variant="destructive" className="flex-1" render={<Link href={`/properties/${id}/verify?action=reject`} />} nativeButton={false}>
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ) : unlockState.status === "loading" ? (
                  /* Loading skeleton */
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full rounded-lg" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                ) : isUnlocked ? (
                  /* Unlocked: show all features */
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-3 py-2">
                      <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
                      <span className="text-xs font-medium text-green-700 dark:text-green-400">
                        Unlocked
                        {unlockState.remaining !== null && ` · ${unlockState.remaining} credits left`}
                      </span>
                    </div>
                    <Button className="w-full" render={<Link href={`/properties/${id}/contact-access`} />} nativeButton={false}>
                      <Phone className="w-4 h-4 mr-2" /> View Contact Info
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => setShowChat(true)}>
                      <MessageCircle className="w-4 h-4 mr-2" /> Message Seller
                    </Button>
                    {property.latitude && property.longitude && (
                      <Button variant="outline" className="w-full" render={<Link href={`/properties/${id}/map`} />} nativeButton={false}>
                        <MapPin className="w-4 h-4 mr-2" /> View on Map
                      </Button>
                    )}
                    {property.videoUrl && (
                      <Button variant="outline" className="w-full" render={<a href={property.videoUrl} target="_blank" rel="noreferrer" />} nativeButton={false}>
                        <ExternalLink className="w-4 h-4 mr-2" /> Virtual Tour
                      </Button>
                    )}
                  </div>
                ) : unlockState.status === "locked" ? (
                  /* Has credits, not unlocked yet */
                  <div className="space-y-2">
                    <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm font-medium">Premium Features Locked</p>
                      </div>
                      <p className="text-xs text-muted-foreground">Unlock to access: contact info, seller chat, map, and virtual tour.</p>
                      <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                        <Coins className="w-3.5 h-3.5" />
                        {unlockState.remaining} credit{unlockState.remaining !== 1 ? "s" : ""} available
                      </div>
                    </div>
                    <Button className="w-full" onClick={handleUnlock} disabled={unlocking}>
                      {unlocking ? (
                        <span className="flex items-center gap-2"><Coins className="w-4 h-4 animate-pulse" /> Unlocking…</span>
                      ) : (
                        <span className="flex items-center gap-2"><Coins className="w-4 h-4" /> Unlock · 1 Credit</span>
                      )}
                    </Button>
                  </div>
                ) : (
                  /* No credits */
                  <div className="space-y-2">
                    <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm font-medium">No Credits Remaining</p>
                      </div>
                      <p className="text-xs text-muted-foreground">Purchase credits to unlock contact info, chat, map, and virtual tour for this property.</p>
                    </div>
                    <Button className="w-full" render={<Link href="/billing" />} nativeButton={false}>
                      <CreditCard className="w-4 h-4 mr-2" /> Buy Credits
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
