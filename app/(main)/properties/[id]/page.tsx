"use client";

import React, { useState, use, useEffect } from "react";
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
  LogIn,
  UserPlus,
  Shield,
  BadgeDollarSign,
  CalendarCheck,
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
import VerifyPropertyDialog from "../_components/verify-property-dialog";
import PropertyPageSkeleton from "./_components/property-page-skeleton";
import PropertyNotFound from "./_components/property-not-found";
import PropertyError from "./_components/property-error";
import FloatingChat from "../_components/FloatingChat";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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
  const { data: property, isLoading, error, refetch } = useProperty(id);
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
  const isAdmin = role === Role.ADMIN;

  // Owner and admin get full access without needing credits
  const hasFullAccess = isAdmin || isOwner;

  const { data: subscriptionData, isLoading: subscriptionLoading } =
    usePropertySubscription(id, !isGuest && !hasFullAccess);
  const consumeContactCredit = useConsumeContactCredit(id);

  const hasContactAccess =
    hasFullAccess || (subscriptionData?.hasAccess ?? false);
  const alreadyUnlocked =
    hasFullAccess || (subscriptionData?.alreadyUnlocked ?? false);
  const totalCredits = subscriptionData?.totalCredits ?? 0;

  const [verifyOpen, setVerifyOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const requireAuth = (action: () => void) => {
    if (isGuest) {
      router.push(`/login?redirectTo=/properties/${id}`);
      return;
    }
    action();
  };

  const [shareOpen, setShareOpen] = useState(false);

  const handleContactClick = async () => {
    requireAuth(async () => {
      // Owner and admin go directly — no credit needed
      if (hasFullAccess) {
        router.push(`/properties/${id}/contact`);
        return;
      }
      try {
        const data = await consumeContactCredit.mutateAsync();
        if (!data?.hasAccess) return;
        router.push(`/properties/${id}/contact`);
      } catch (e) {
        console.error(e);
      }
    });
  };

  if (isLoading) {
    return <PropertyPageSkeleton />;
  }

  if (!property) return <PropertyNotFound />;
  if (error) return <PropertyError onRetry={refetch} />;

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

  // Owner and admin never see images locked
  const isLocked = currentIndex >= 5 && !alreadyUnlocked;

  const nextImage = () =>
    setCurrentIndex((p) => (p + 1) % propertyImages.length);
  const prevImage = () =>
    setCurrentIndex((p) => (p === 0 ? propertyImages.length - 1 : p - 1));

  const isSold = property.status === "sold";
  const showSoldBanner = isSold;
  const showVerifyBanner = property.verificationStatus === "pending" && !isSold;

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

  const premiumFeatures = [
    ...(property.videoUrl
      ? [
          {
            icon: Video,
            label: "Virtual Tour",
            desc: "360° immersive walkthrough",
            href: `/properties/${id}/tour?videourl=${property.videoUrl}`,
          },
        ]
      : [
          {
            icon: Video,
            label: "Virtual Tour",
            desc: "360° immersive walkthrough",
            href: `/properties/${id}/tour`,
          },
        ]),
    {
      icon: Crown,
      label: "Premium Map",
      desc: "Exact pin & street view",
      href: `/properties/${id}/map`,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        title={title ?? "Property on AawasHub"}
        location={location}
        url={typeof window !== "undefined" ? window.location.href : ""}
      />

      {isAdmin && (
        <VerifyPropertyDialog
          propertyId={id}
          propertyTitle={title ?? "Property"}
          currentStatus={property.verificationStatus ?? "pending"}
          propertyStatus={property.status ?? "available"}
          open={verifyOpen}
          onOpenChange={setVerifyOpen}
        />
      )}

      {/* ── TOP NAV BAR ── */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="link" onClick={handleBack}>
              <ArrowLeft size={16} />
              <span>Go Back</span>
            </Button>
          </div>

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
                />
              </>
            )}

            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVerifyOpen(true)}
                className={cn(
                  "h-8 gap-1.5 text-xs font-semibold",
                  isSold &&
                    "border-rose-400 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-700",
                  !isSold &&
                    property.verificationStatus === "pending" &&
                    "border-amber-400 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-700",
                  !isSold &&
                    property.verificationStatus === "verified" &&
                    "border-emerald-400 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400",
                  !isSold &&
                    property.verificationStatus === "rejected" &&
                    "border-rose-400 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-400",
                )}
              >
                {isSold ? (
                  <>
                    <BadgeDollarSign size={13} /> Sold
                  </>
                ) : (
                  <>
                    <Shield size={13} />
                    {property.verificationStatus === "pending"
                      ? "Pending Review"
                      : property.verificationStatus === "verified"
                        ? "Verified"
                        : "Rejected"}
                  </>
                )}
              </Button>
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
              />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={() => setShareOpen(true)}>
              <Share2 size={16} className="text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── SOLD BANNER ── */}
      {showSoldBanner && (
        <div className="bg-rose-50 dark:bg-rose-950/30 border-b border-rose-200 dark:border-rose-800">
          <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-rose-500/15 flex items-center justify-center shrink-0">
                <BadgeDollarSign
                  size={15}
                  className="text-rose-600 dark:text-rose-400"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-rose-800 dark:text-rose-300">
                  This property has been sold
                </p>
                {property.soldAt ? (
                  <p className="text-[11px] text-rose-600/70 dark:text-rose-400/70 flex items-center gap-1 mt-0.5">
                    <CalendarCheck size={10} className="shrink-0" />
                    Sold on{" "}
                    {new Date(property.soldAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                ) : (
                  <p className="text-[11px] text-rose-600/70 dark:text-rose-400/70 mt-0.5">
                    No longer available for purchase
                  </p>
                )}
              </div>
            </div>
            {isAdmin && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-3 text-xs font-semibold border-rose-300 text-rose-700 hover:bg-rose-100 dark:border-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/50 flex-shrink-0"
                onClick={() => setVerifyOpen(true)}
              >
                View Status
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ── PENDING BANNER — admin only ── */}
      {showVerifyBanner && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800">
          <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-2.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-300 min-w-0">
              <Shield size={14} className="shrink-0" />
              <p className="text-xs font-medium truncate">
                {isAdmin
                  ? "This property is awaiting verification — review and approve or reject it"
                  : "Your property is currently under verification. You will be notified once it is approved or rejected."}
              </p>
            </div>
            {isAdmin && (
              <Button
                size="sm"
                className="h-7 px-3 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white flex-shrink-0"
                onClick={() => setVerifyOpen(true)}
              >
                Review Now
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="max-w-screen-xl mx-auto px-4 md:px-4 py-4 md:py-4">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-6 lg:gap-6 items-start">
          {/* LEFT: Gallery */}
          <div className="flex flex-col gap-3 min-w-0 order-2 lg:order-1">
            <div className="relative w-full rounded-2xl overflow-hidden bg-muted group aspect-6/4">
              {loadingImages ? (
                <div className="absolute inset-0 bg-muted animate-pulse" />
              ) : (
                <Image
                  src={propertyImages[currentIndex]}
                  alt={title || "Property"}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, calc(100vw - 444px)"
                  className={cn(
                    "object-cover transition-all duration-700",
                    isLocked
                      ? "blur-2xl scale-110 opacity-40"
                      : isSold
                        ? "grayscale-[45%] brightness-90 group-hover:scale-[1.02]"
                        : "group-hover:scale-[1.02]",
                  )}
                />
              )}

              {!isLocked && (
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
              )}
              {!isLocked && (
                <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                  {currentIndex + 1} / {propertyImages.length}
                </div>
              )}
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

              <div className="absolute top-4 left-4 flex gap-2 pointer-events-none">
                {isSold ? (
                  <span className="bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                    <BadgeDollarSign size={9} /> Sold
                  </span>
                ) : (
                  <span className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                    {status || "For Sale"}
                  </span>
                )}
                {!isSold && (
                  <span className="bg-background/80 backdrop-blur-md text-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={9} className="text-green-500" />
                    {property.verificationStatus}
                  </span>
                )}
              </div>

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
                      <>
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
                      </>
                    ) : (
                      <EsewaPaymentButton propertyId={id} />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {propertyImages.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={cn(
                    "relative shrink-0 w-[72px] h-[54px] md:w-[88px] md:h-[66px] rounded-xl overflow-hidden border-2 transition-all duration-200",
                    currentIndex === idx
                      ? "border-primary ring-2 ring-primary/30 scale-[1.04]"
                      : "border-border/50 hover:border-border",
                  )}
                >
                  <Image
                    src={img}
                    alt={`View ${idx + 1}`}
                    fill
                    sizes="88px"
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

          {/* RIGHT: Info Panel */}
          <div className="flex flex-col gap-5 order-1 lg:order-2">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold leading-tight tracking-tight mb-2">
                {title || "Property"}
              </h1>
              <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                <MapPin size={13} className="text-destructive shrink-0" />
                <span className="font-medium">
                  {location || "Location N/A"}
                </span>
              </div>
            </div>

            <div
              className={cn(
                "rounded-2xl px-5 py-4 border",
                isSold
                  ? "bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800"
                  : "bg-muted/40 border-border/60",
              )}
            >
              <p
                className={cn(
                  "text-[11px] font-semibold uppercase tracking-widest mb-1",
                  isSold
                    ? "text-rose-500 dark:text-rose-400"
                    : "text-muted-foreground",
                )}
              >
                {isSold ? "Sold Price" : "Asking Price"}
              </p>
              <span
                className={cn(
                  "text-3xl font-black tracking-tight",
                  isSold ? "text-rose-600 dark:text-rose-400" : "text-primary",
                )}
              >
                NPR{" "}
                {price ? new Intl.NumberFormat("en-IN").format(price) : "N/A"}
              </span>
              {isSold ? (
                <span className="block mt-2 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider w-fit">
                  Transaction Complete
                </span>
              ) : property.negotiable ? (
                <span className="block mt-2 text-[10px] font-bold text-green-600 bg-green-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider w-fit">
                  Negotiable
                </span>
              ) : null}
            </div>

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

            {/* Premium features */}
            {!isAnonymous && (
              <div className="space-y-2">
                {premiumFeatures.map(({ icon: Icon, label, desc, href }) => {
                  // Owner and admin always have access; so do users who can access the contact page
                  const canAccess =
                    hasFullAccess || alreadyUnlocked || hasContactAccess;

                  return (
                    <Link
                      key={label}
                      href={href}
                      className={cn(
                        "flex items-center gap-3 p-3.5 rounded-xl border bg-muted/20 transition-all cursor-pointer group",
                        canAccess
                          ? "border-border hover:border-primary/40 hover:bg-primary/5"
                          : "border-dashed border-border hover:border-amber-400/40 hover:bg-amber-500/5",
                      )}
                      disabled={!canAccess}
                      onClick={(e) => {
                        if (!canAccess) {
                          e.preventDefault();
                          if (isGuest) {
                            router.push(`/login?redirectTo=/properties/${id}`);
                          } else {
                            toast.info(
                              "You'll get access to this after purchasing the contact package.",
                            );
                          }
                        }
                      }}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                          canAccess ? "bg-primary/10" : "bg-amber-500/10",
                        )}
                      >
                        <Icon
                          size={15}
                          className={
                            canAccess ? "text-primary" : "text-amber-500"
                          }
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold">{label}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {desc}
                        </p>
                      </div>
                      {canAccess ? (
                        <CheckCircle2
                          size={13}
                          className="text-emerald-500 shrink-0"
                        />
                      ) : (
                        <Lock
                          size={11}
                          className="text-amber-500/60 group-hover:text-amber-500 transition-colors"
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            )}

            <div className="flex flex-col gap-3 pt-1">
              {isSold && !isOwner && !isAdmin ? (
                /* ── Sold notice for buyers/guests ── */
                <div className="rounded-2xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/20 p-5 flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center">
                    <BadgeDollarSign size={22} className="text-rose-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-rose-700 dark:text-rose-400 mb-1">
                      This property has been sold
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      This listing is no longer available. Browse our other
                      properties to find your perfect home.
                    </p>
                  </div>
                  <Link href="/properties" className="w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full rounded-xl border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40"
                    >
                      Browse Other Properties
                    </Button>
                  </Link>
                </div>
              ) : isGuest ? (
                /* ── Guest sign-in prompt ── */
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-5 flex flex-col items-center text-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Lock size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold mb-1">
                      Sign in to take action
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Create an account or log in to book a visit, contact the
                      seller, and save this property.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <Link
                      href={`/login?redirectTo=/properties/${id}`}
                      className="w-full"
                    >
                      <Button
                        size="lg"
                        className="w-full h-11 rounded-xl font-bold text-sm tracking-wide shadow-md gap-2"
                      >
                        <LogIn size={15} /> Sign In
                      </Button>
                    </Link>
                    <Link
                      href={`/signup?redirectTo=/properties/${id}`}
                      className="w-full"
                    >
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full h-11 rounded-xl font-bold text-sm border-2 gap-2"
                      >
                        <UserPlus size={15} /> Create Account
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                /* ── Authenticated: owner / admin / buyer with credits ── */
                <>
                  {/* Hide "Book a Visit" for the owner or unverified properties */}
                  {!isOwner && property.verificationStatus === "verified" && (
                    <Button
                      size="lg"
                      disabled={sessionPending}
                      className="w-full h-12 rounded-xl font-bold text-sm tracking-wide shadow-md"
                      onClick={() =>
                        router.push(`/appointments/new?propertyId=${id}`)
                      }
                    >
                      {sessionPending ? "Loading..." : "Book a Visit"}
                    </Button>
                  )}

                  {hasFullAccess || hasContactAccess || totalCredits > 0 ? (
                    <Button
                      variant="outline"
                      size="lg"
                      disabled={
                        !hasFullAccess &&
                        (sessionPending ||
                          subscriptionLoading ||
                          consumeContactCredit.isPending)
                      }
                      className="w-full h-12 rounded-xl font-bold text-sm border-2"
                      onClick={handleContactClick}
                    >
                      {sessionPending || subscriptionLoading
                        ? "Loading..."
                        : consumeContactCredit.isPending
                          ? "Opening..."
                          : isOwner
                            ? "View My Listing"
                            : "Contact Seller"}
                    </Button>
                  ) : (
                    <EsewaPaymentButton propertyId={id} />
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Floating support chat — buyers/sellers contact admin ── */}
        {!isGuest && !isAdmin && (
          <FloatingChat
            propertyId={id}
            propertyTitle={title ?? "Property"}
            currentUserId={session?.user?.id ?? ""}
          />
        )}

        {/* ── BOTTOM SECTIONS ── */}
        {!isAnonymous && (
          <div className="mt-12 space-y-8">
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

// ── Share Dialog ──────────────────────────────────────────────────────────────

function ShareDialog({
  open,
  onOpenChange,
  title,
  location,
  url,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  location?: string;
  url: string;
}) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy — please copy the URL manually.");
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title, text: `${title}${location ? ` in ${location}` : ""}`, url });
    } catch (err) {
      if ((err as Error).name !== "AbortError") toast.error("Share failed.");
    }
  };

  const encoded = encodeURIComponent(url);
  const text = encodeURIComponent(`${title}${location ? ` — ${location}` : ""}`);

  const socials = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${text}%20${encoded}`,
      color: "bg-[#25D366] hover:bg-[#1ebe5d]",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
    },
    {
      label: "X / Twitter",
      href: `https://twitter.com/intent/tweet?text=${text}&url=${encoded}`,
      color: "bg-black hover:bg-neutral-800",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.261 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      color: "bg-[#1877F2] hover:bg-[#166fe5]",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Share2 size={15} />
            Share Property
          </DialogTitle>
        </DialogHeader>

        {/* Property preview */}
        <div className="rounded-xl border border-border/60 bg-muted/30 px-3.5 py-3 text-sm">
          <p className="font-semibold line-clamp-1">{title}</p>
          {location && (
            <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
              <MapPin size={9} /> {location}
            </p>
          )}
        </div>

        {/* Copy link */}
        <div className="flex gap-2">
          <Input
            readOnly
            value={url}
            className="text-xs font-mono h-9 text-muted-foreground"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <Button
            size="sm"
            variant={copied ? "default" : "outline"}
            className="shrink-0 h-9 gap-1.5 text-xs"
            onClick={copyLink}
          >
            {copied ? <CheckCircle2 size={13} /> : <Share2 size={13} />}
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>

        {/* Social quick-share */}
        <div className="flex gap-2">
          {socials.map(({ label, href, color, icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              title={label}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-white text-xs font-semibold transition-colors",
                color,
              )}
            >
              {icon}
              <span className="hidden sm:inline">{label}</span>
            </a>
          ))}
        </div>

        {/* Native share — only rendered when API is available */}
        {typeof navigator !== "undefined" && "share" in navigator && (
          <Button variant="outline" className="w-full gap-2 text-sm" onClick={nativeShare}>
            <Share2 size={14} />
            Share via…
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
