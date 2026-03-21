"use client";

import React, { useState, use } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Ruler,
  Building2,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Lock,
  Crown,
  Navigation,
  Layers,
  Map as MapIcon,
  Calendar,
  Info,
  Hospital,
  Plane,
  ShoppingCart,
  School,
  Dumbbell,
  Bus,
  Utensils,
  Wallet,
  Video,
  FileText,
  ArrowLeft,
  Pencil,
  Phone,
  Mail,
  ExternalLink,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/client/auth-client";
import { hasPermission, Permission, Role } from "@/lib/rbac";
import DeletePropertyDialog from "../_components/delete-property";
import {
  useProperty,
  usePropertyImages,
  useToggleFavorite,
  useDeleteProperty,
} from "@/lib/client/queries/properties.queries";
import {
  usePropertySubscription,
  useConsumeContactCredit,
} from "@/lib/client/queries/subscriptions.queries";
import EsewaPaymentButton from "../_components/esewa-button";

export default function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  const handleBack = () => {
    router.push(from === "favorites" ? "/favorites" : "/properties");
  };

  const { data: session, isPending: sessionPending } = useSession();
  const { data: property, isLoading, error } = useProperty(id);
  const { data: fetchedImages, isLoading: loadingImages } =
    usePropertyImages(id);
  const toggleFav = useToggleFavorite();
  const deleteProperty = useDeleteProperty();

  const role = session?.user?.role as Role;
  const isOwner = property?.sellerId === session?.user?.id;
  const canManage =
    hasPermission(role, Permission.MANAGE_PROPERTIES) &&
    (role === Role.ADMIN || isOwner);
  const isAnonymous = session?.user?.isAnonymous === true;
  const isGuest = sessionPending || !session || isAnonymous;

  const { data: subscriptionData, isLoading: subscriptionLoading } =
    usePropertySubscription(id, !isGuest);
  const consumeContactCredit = useConsumeContactCredit(id);

  const hasContactAccess = subscriptionData?.hasAccess ?? false;
  const alreadyUnlocked = subscriptionData?.alreadyUnlocked ?? false;
  const totalCredits = subscriptionData?.totalCredits ?? 0;

  const requireAuth = (action: () => void) => {
    if (isGuest) {
      router.push(`/login?redirectTo=/properties/${id}`);
      return;
    }
    action();
  };

  const handleContactClick = async () => {
    requireAuth(async () => {
      try {
        const data = await consumeContactCredit.mutateAsync();
        if (!data?.hasAccess) return;
        router.push(`/properties/${id}/contact`);
      } catch (e) {
        console.error(e);
      }
    });
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const [thumbsExpanded, setThumbsExpanded] = useState(false);

  if (isLoading || !property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 w-full max-w-6xl px-6">
          <div className="h-[70vh] w-full rounded-3xl bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive font-semibold">
          Error loading property.
        </p>
      </div>
    );
  }

  const { title, location, price, status, description, isFavorite, category } =
    property;

  const FALLBACK_IMAGES = [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9",
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0",
    "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68",
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa",
  ];

  const rawImages =
    fetchedImages?.length > 0
      ? fetchedImages.map((img: { url: string }) => img.url)
      : FALLBACK_IMAGES;
  const propertyImages = rawImages.slice(0, 7);
  const isLocked = currentIndex >= 5 && !alreadyUnlocked;
  const nextImage = () =>
    setCurrentIndex((p) => (p + 1) % propertyImages.length);
  const prevImage = () =>
    setCurrentIndex((p) => (p === 0 ? propertyImages.length - 1 : p - 1));

  const overviewItems = [
    { label: "Type", value: category || "N/A", icon: Building2 },
    { label: "Purpose", value: status || "Sale", icon: CheckCircle2 },
    { label: "Face", value: property.face || "N/A", icon: Navigation },
    {
      label: "Area",
      value: property.area ? `${property.area} Aana` : "N/A",
      icon: Ruler,
    },
    { label: "Road Type", value: property.roadType || "N/A", icon: Layers },
    { label: "Road Access", value: property.roadAccess || "N/A", icon: MapPin },
    {
      label: "Negotiable",
      value: property.negotiable ? "Yes" : "No",
      icon: Wallet,
    },
    {
      label: "Posted",
      value: property.createdAt
        ? new Date(property.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "N/A",
      icon: Calendar,
    },
    {
      label: "Municipality",
      value: property.municipality || "N/A",
      icon: Building2,
    },
    { label: "Ward No.", value: property.wardNo || "N/A", icon: Info },
    { label: "Ring Road", value: property.ringRoad || "N/A", icon: Layers },
  ];

  const facilityItems = [
    {
      label: "Hospital",
      value: property.nearHospital || "N/A",
      icon: Hospital,
    },
    { label: "Airport", value: property.nearAirport || "N/A", icon: Plane },
    {
      label: "Supermarket",
      value: property.nearSupermarket || "N/A",
      icon: ShoppingCart,
    },
    { label: "School", value: property.nearSchool || "N/A", icon: School },
    { label: "Gym", value: property.nearGym || "N/A", icon: Dumbbell },
    { label: "Transport", value: property.nearTransport || "N/A", icon: Bus },
    { label: "ATM", value: property.nearAtm || "N/A", icon: Wallet },
    {
      label: "Restaurant",
      value: property.nearRestaurant || "N/A",
      icon: Utensils,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── TOP NAV BAR ─────────────────────────────── */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-350 mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            {canManage && (
              <>
                <Link href={`/properties/${id}/edit`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                  >
                    <Pencil size={13} /> Edit
                  </Button>
                </Link>
                <DeletePropertyDialog
                  propertyId={id}
                  onDelete={(pid) => {
                    deleteProperty.mutate(pid);
                    router.push("/properties");
                  }}
                  isDeleting={deleteProperty.isPending}
                />{" "}
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-xl"
              onClick={() =>
                requireAuth(() =>
                  toggleFav.mutate({ propertyId: id, isFav: !!isFavorite }),
                )
              }
            >
              <Heart
                size={16}
                className={cn(
                  isFavorite && !isGuest
                    ? "text-destructive fill-current"
                    : "text-muted-foreground",
                )}
              />{" "}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
              <Share2 size={16} className="text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-350 mx-auto px-4 md:px-8 py-6 md:py-10">
        {/* ── HERO GALLERY + INFO SPLIT ───────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 xl:gap-10 items-start">
          {/* LEFT: Gallery */}
          <div className="flex flex-col gap-3">
            {/* Main Image */}
            <div className="relative aspect-4/3 md:aspect-16/10 rounded-2xl overflow-hidden bg-muted group">
              {loadingImages ? (
                <div className="absolute inset-0 bg-muted animate-pulse" />
              ) : (
                <Image
                  src={propertyImages[currentIndex]}
                  alt={title || "Property"}
                  fill
                  priority
                  className={cn(
                    "object-cover transition-all duration-700",
                    isLocked
                      ? "blur-2xl scale-110 opacity-40"
                      : "group-hover:scale-[1.02]",
                  )}
                />
              )}

              {/* Gradient overlay bottom */}
              {!isLocked && (
                <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/60 to-transparent pointer-events-none" />
              )}

              {/* Image counter */}
              {!isLocked && (
                <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                  {currentIndex + 1} / {propertyImages.length}
                </div>
              )}

              {/* Nav arrows */}
              {!isLocked && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}

              {/* Status badge top-left */}
              <div className="absolute top-4 left-4 flex gap-2 pointer-events-none">
                <span className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  {status || "For Sale"}
                </span>
                <span className="bg-background/80 backdrop-blur-md text-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 size={9} className="text-green-500" /> Verified
                </span>
              </div>

              {/* Locked overlay */}
              {isLocked && (
                <div className="absolute inset-0 z-20 flex items-center justify-center">
                  <div className="bg-card/95 backdrop-blur-xl p-8 rounded-2xl shadow-2xl flex flex-col items-center text-center border border-border max-w-[300px]">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
                      <Crown size={24} className="text-amber-500" />
                    </div>
                    <h3 className="text-base font-bold mb-1">
                      Premium Content
                    </h3>
                    <p className="text-[11px] text-muted-foreground mb-5">
                      Unlock remaining photos & contact details
                    </p>
                    {totalCredits > 0 ? (
                      <Button
                        size="sm"
                        disabled={
                          sessionPending ||
                          subscriptionLoading ||
                          consumeContactCredit.isPending
                        }
                        className="w-full rounded-xl font-bold text-xs h-10"
                        onClick={handleContactClick}
                      >
                        {consumeContactCredit.isPending
                          ? "Unlocking..."
                          : "Unlock Now"}
                      </Button>
                    ) : (
                      <EsewaPaymentButton propertyId={id} />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {propertyImages.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={cn(
                    "relative shrink-0 w-18 h-13.5 md:w-22 `md:h-16.5 rounded-xl overflow-hidden border-2 transition-all duration-200",
                    currentIndex === idx
                      ? "border-primary ring-2 ring-primary/30 scale-[1.04]"
                      : "border-border/50 hover:border-border",
                  )}
                >
                  <Image
                    src={img}
                    alt={`View ${idx + 1}`}
                    fill
                    className={cn(
                      "object-cover",
                      idx >= 5 &&
                        !alreadyUnlocked &&
                        "blur-sm grayscale opacity-60",
                    )}
                  />
                  {idx >= 5 && !alreadyUnlocked && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Lock size={10} className="text-amber-400" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Property Info Panel */}
          <div className="flex flex-col gap-5">
            {/* Title & Location */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold leading-tight tracking-tight">
                  {title || "Property"}
                </h1>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                <MapPin size={13} className="text-destructive shrink-0" />
                <span className="font-medium">
                  {location || "Location N/A"}
                </span>
              </div>
            </div>

            {/* Price Block */}
            <div className="bg-muted/40 rounded-2xl px-5 py-4 border border-border/60">
              <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-widest mb-1">
                Asking Price
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-primary tracking-tight">
                  NPR{" "}
                  {price ? new Intl.NumberFormat("en-IN").format(price) : "N/A"}
                </span>
              </div>
              {property.negotiable && (
                <span className="inline-block mt-2 text-[10px] font-bold text-green-600 bg-green-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Negotiable
                </span>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: MapIcon, label: "Type", value: category || "N/A" },
                {
                  icon: Ruler,
                  label: "Area",
                  value: property.area ? `${property.area} Ana` : "N/A",
                },
                {
                  icon: Navigation,
                  label: "Face",
                  value: property.face || "N/A",
                },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="bg-muted/30 rounded-xl p-3 border border-border/50 text-center"
                >
                  <Icon size={16} className="text-primary mx-auto mb-1.5" />
                  <p className="text-[10px] text-muted-foreground font-medium mb-0.5">
                    {label}
                  </p>
                  <p className="text-[12px] font-bold truncate">{value}</p>
                </div>
              ))}
            </div>

            {/* Premium Features (logged-in non-anonymous only) */}
            {!isAnonymous && (
              <div className="space-y-2">
                {[
                  {
                    icon: Video,
                    label: "Virtual Tour",
                    desc: "360° immersive walkthrough",
                  },
                  {
                    icon: Crown,
                    label: "Premium Map",
                    desc: "Exact pin & street view",
                  },
                ].map(({ icon: Icon, label, desc }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 p-3.5 rounded-xl border border-dashed border-border hover:border-primary/40 bg-muted/20 hover:bg-primary/5 transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon size={15} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold">{label}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {desc}
                      </p>
                    </div>
                    <Lock
                      size={11}
                      className="text-muted-foreground/50 group-hover:text-primary/50 transition-colors"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3 pt-1">
              <Button
                size="lg"
                disabled={sessionPending}
                className="w-full h-12 rounded-xl font-bold text-sm tracking-wide shadow-md"
                onClick={() =>
                  requireAuth(() =>
                    router.push(`/appointments/new?propertyId=${id}`),
                  )
                }
              >
                {sessionPending ? "Loading..." : "Book a Visit"}
              </Button>

              {hasContactAccess || totalCredits > 0 ? (
                <Button
                  variant="outline"
                  size="lg"
                  disabled={
                    sessionPending ||
                    subscriptionLoading ||
                    consumeContactCredit.isPending
                  }
                  className="w-full h-12 rounded-xl font-bold text-sm border-2"
                  onClick={handleContactClick}
                >
                  {sessionPending || subscriptionLoading
                    ? "Loading..."
                    : consumeContactCredit.isPending
                      ? "Opening..."
                      : "Contact Seller"}
                </Button>
              ) : (
                <EsewaPaymentButton propertyId={id} />
              )}

              {!sessionPending && isAnonymous && (
                <p className="text-center text-[11px] text-muted-foreground">
                  <Link
                    href={`/login?redirectTo=/properties/${id}`}
                    className="text-primary font-semibold underline underline-offset-2"
                  >
                    Sign in
                  </Link>{" "}
                  to book, contact, or save this property
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── BOTTOM SECTIONS (for authenticated non-guest users) ── */}
        {!isAnonymous && (
          <div className="mt-12 space-y-8">
            {/* Description */}
            {description && (
              <section>
                <SectionHeader icon={FileText} title="About this Property" />
                <div className="mt-4 bg-muted/20 rounded-2xl p-6 border border-border/50">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </div>
              </section>
            )}

            {/* Overview + Facilities side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <section>
                <SectionHeader icon={Building2} title="Property Overview" />
                <div className="mt-4 rounded-2xl border border-border/50 overflow-hidden">
                  {overviewItems.map(({ label, value, icon: Icon }, i) => (
                    <div
                      key={label}
                      className={cn(
                        "flex items-center justify-between px-5 py-3.5 text-sm",
                        i % 2 === 0 ? "bg-muted/20" : "bg-transparent",
                        i < overviewItems.length - 1 &&
                          "border-b border-border/30",
                      )}
                    >
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Icon size={14} />
                        <span className="text-[12px] font-medium">{label}</span>
                      </div>
                      <span className="text-[12px] font-semibold text-foreground">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <SectionHeader icon={MapPin} title="Nearby Facilities" />
                <div className="mt-4 rounded-2xl border border-border/50 overflow-hidden">
                  {facilityItems.map(({ label, value, icon: Icon }, i) => (
                    <div
                      key={label}
                      className={cn(
                        "flex items-center justify-between px-5 py-3.5 text-sm",
                        i % 2 === 0 ? "bg-muted/20" : "bg-transparent",
                        i < facilityItems.length - 1 &&
                          "border-b border-border/30",
                      )}
                    >
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Icon size={14} />
                        <span className="text-[12px] font-medium">{label}</span>
                      </div>
                      <span className="text-[12px] font-semibold text-foreground">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon size={15} className="text-primary" />
      </div>
      <h2 className="text-base font-bold">{title}</h2>
    </div>
  );
}
