"use client";

import React, { useState, use } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  Banknote,
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export default function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const { data: session } = useSession();
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

  const [currentIndex, setCurrentIndex] = useState(0);

  if (isLoading) {
    return (
      <div className="w-full max-w-[95vw] mx-auto p-4 lg:p-6 space-y-8">
        <div className="h-[620px] rounded-[2.5rem] bg-muted animate-pulse" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive font-semibold">
          Error loading property.
        </p>
      </div>
    );
  }

  const {
    title,
    location,
    price,
    status,
    description,
    isFavorite,
    category,
    area,
    municipality,
    wardNo,
  } = property;

  // ── IMAGES ──
  const FALLBACK_IMAGES = [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9",
    "https://images.unsplash.com/photo-1600607687940-4e5a994e5773",
    "https://images.unsplash.com/photo-1600566753190-17f0bb2a6c3e",
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0",
    "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68",
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa",
  ];

  const rawImages =
    fetchedImages && fetchedImages.length > 0
      ? fetchedImages.map((img: any) => img.url)
      : FALLBACK_IMAGES;

  const propertyImages = rawImages.slice(0, 7);
  const isLocked = currentIndex >= 5;

  const nextImage = () =>
    setCurrentIndex((prev) => (prev + 1) % propertyImages.length);
  const prevImage = () =>
    setCurrentIndex((prev) =>
      prev === 0 ? propertyImages.length - 1 : prev - 1,
    );

  // ── OVERVIEW DATA from real property ──
  const overviewData = [
    {
      label: "Property Type",
      value: category || "N/A",
      icon: <Building2 size={16} />,
    },
    {
      label: "Purpose",
      value: status || "Sale",
      icon: <CheckCircle2 size={16} />,
    },
    {
      label: "Property Face",
      value: property.face || "N/A",
      icon: <Navigation size={16} />,
    },
    {
      label: "Property Area",
      value: property.area || "N/A",
      icon: <Ruler size={16} />,
    },
    {
      label: "Road Type",
      value: property.roadType || "N/A",
      icon: <Layers size={16} />,
    },
    {
      label: "Road Access",
      value: property.roadAccess || "N/A",
      icon: <MapPin size={16} />,
    },
    {
      label: "Negotiable",
      value: property.negotiable ? "Yes" : "No",
      icon: <Wallet size={16} />,
    },
    {
      label: "Date Posted",
      value: property.createdAt
        ? new Date(property.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "N/A",
      icon: <Calendar size={16} />,
    },
    {
      label: "Municipality",
      value: property.municipality || "N/A",
      icon: <Building2 size={16} />,
    },
    {
      label: "Ward No.",
      value: property.wardNo || "N/A",
      icon: <Info size={16} />,
    },
    {
      label: "Ring Road",
      value: property.ringRoad || "N/A",
      icon: <Layers size={16} />,
    },
  ];

  const facilitiesData = [
    {
      label: "Hospital",
      value: property.nearHospital || "N/A",
      icon: <Hospital size={16} />,
    },
    {
      label: "Airport",
      value: property.nearAirport || "N/A",
      icon: <Plane size={16} />,
    },
    {
      label: "Supermarket",
      value: property.nearSupermarket || "N/A",
      icon: <ShoppingCart size={16} />,
    },
    {
      label: "School",
      value: property.nearSchool || "N/A",
      icon: <School size={16} />,
    },
    {
      label: "Gym",
      value: property.nearGym || "N/A",
      icon: <Dumbbell size={16} />,
    },
    {
      label: "Public Transport",
      value: property.nearTransport || "N/A",
      icon: <Bus size={16} />,
    },
    {
      label: "ATM",
      value: property.nearAtm || "N/A",
      icon: <Wallet size={16} />,
    },
    {
      label: "Restaurant",
      value: property.nearRestaurant || "N/A",
      icon: <Utensils size={16} />,
    },
  ];

  return (
    <div className="w-full max-w-[95vw] mx-auto p-4 lg:p-6 space-y-8 animate-in fade-in duration-700">
      {/* BACK BUTTON */}
      <button
        onClick={() => router.push("/properties")}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-semibold"
      >
        <ArrowLeft size={16} /> Back to Properties
      </button>

      {/* MAIN PROPERTY CARD */}
      <Card className="overflow-hidden border-border bg-card shadow-2xl rounded-[2.5rem] lg:h-[620px] max-h-[90vh] flex flex-col lg:flex-row">
        {/* LEFT: Gallery */}
        <div className="relative w-full lg:w-[50%] bg-muted/10 flex flex-col border-r p-4 lg:p-8">
          {/* Main Image */}
          <div className="relative flex-1 overflow-hidden rounded-[2rem] group border border-border/50 shadow-inner bg-black">
            {loadingImages ? (
              <div className="absolute inset-0 bg-muted animate-pulse" />
            ) : (
              <Image
                src={propertyImages[currentIndex]}
                alt={title || "Property Image"}
                fill
                priority
                className={cn(
                  "object-cover transition-all duration-700",
                  isLocked
                    ? "blur-2xl scale-110 opacity-50"
                    : "group-hover:scale-105",
                )}
              />
            )}

            {/* Premium Lock Overlay */}
            {isLocked && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/10 backdrop-blur-sm">
                <div className="bg-card/95 p-6 rounded-[2rem] shadow-2xl flex flex-col items-center text-center border border-border max-w-[280px]">
                  <Crown size={28} className="text-amber-500 mb-3" />
                  <h3 className="text-lg font-bold mb-1">Premium View</h3>
                  <p className="text-[10px] text-muted-foreground mb-4 uppercase tracking-wider">
                    Subscriber Exclusive
                  </p>
                  <Button size="sm" className="rounded-xl font-bold px-8">
                    Unlock
                  </Button>
                </div>
              </div>
            )}

            {/* Arrows */}
            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between z-30 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 rounded-full bg-background/60 backdrop-blur-md"
                onClick={prevImage}
              >
                <ChevronLeft size={18} />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 rounded-full bg-background/60 backdrop-blur-md"
                onClick={nextImage}
              >
                <ChevronRight size={18} />
              </Button>
            </div>

            {/* Fav + Share */}
            <div className="absolute top-4 left-4 flex gap-2 z-30">
              <Button
                variant="secondary"
                size="icon"
                className="h-9 w-9 rounded-xl shadow-xl"
                onClick={() =>
                  toggleFav.mutate({ propertyId: id, isFav: !!isFavorite })
                }
              >
                <Heart
                  size={18}
                  className={cn(
                    isFavorite
                      ? "text-destructive fill-current"
                      : "text-muted-foreground",
                  )}
                />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="h-9 w-9 rounded-xl shadow-xl"
              >
                <Share2 size={18} className="text-muted-foreground" />
              </Button>
            </div>

            {/* Manage controls */}
            {canManage && (
              <div className="absolute top-4 right-4 flex gap-2 z-30">
                <Link href={`/properties/${id}/edit`}>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-9 w-9 rounded-xl shadow-xl"
                  >
                    <Pencil size={16} />
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
              </div>
            )}
          </div>

          {/* Thumbnails */}
          <div className="mt-4 flex justify-center gap-2 overflow-x-auto py-2">
            {propertyImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={cn(
                  "relative flex-shrink-0 w-12 h-12 lg:w-14 lg:h-14 rounded-xl overflow-hidden border-2 transition-all",
                  currentIndex === idx
                    ? "border-primary scale-110 shadow-md"
                    : "border-transparent opacity-60",
                )}
              >
                <Image
                  src={img}
                  alt="thumb"
                  fill
                  className={cn(
                    "object-cover",
                    idx >= 5 && "blur-[2px] grayscale",
                  )}
                />
                {idx >= 5 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Lock size={10} className="text-amber-400" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: Info */}
        <div className="w-full lg:w-[50%] bg-card p-6 lg:p-10 flex flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex flex-col h-full">
            {/* Badges */}
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-primary px-2 py-0.5 text-[9px] font-black uppercase">
                {status || "For Sale"}
              </Badge>
              <Badge
                variant="outline"
                className="flex items-center gap-1 bg-accent text-primary px-2 py-0.5 text-[9px] font-bold"
              >
                <CheckCircle2 size={10} /> Verified
              </Badge>
            </div>

            {/* Title & Price */}
            <section className="p-5 bg-muted/30 rounded-[1.5rem] border border-border/50 mb-6">
              <h1 className="text-xl lg:text-2xl font-bold leading-tight mb-2">
                {title || "Property"}
              </h1>
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-4">
                <MapPin size={14} className="text-destructive" />{" "}
                {location || "Location N/A"}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-primary tracking-tight">
                  NPR.{" "}
                  {price ? new Intl.NumberFormat("en-IN").format(price) : "N/A"}
                </span>
                {property.negotiable && (
                  <span className="text-[9px] font-bold text-primary/60 uppercase tracking-widest">
                    Negotiable
                  </span>
                )}
              </div>
            </section>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl border border-border/50">
                <MapIcon size={16} className="text-primary" />
                <span className="text-xs font-bold">{category || "N/A"}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl border border-border/50">
                <Ruler size={16} className="text-primary" />
                <span className="text-xs font-bold">
                  {property.area || "N/A"}
                </span>
              </div>
            </div>

            {/* Premium Features */}
            <div className="space-y-3 mb-8">
              {[
                {
                  icon: <Video size={18} className="text-primary" />,
                  label: "Virtual Tour",
                },
                {
                  icon: <Crown size={18} className="text-primary" />,
                  label: "Premium Map",
                },
              ].map(({ icon, label }) => (
                <div
                  key={label}
                  className="p-3 border-2 border-dashed border-primary/20 bg-primary/5 rounded-xl flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {icon}
                    <div>
                      <h4 className="font-bold text-[11px]">{label}</h4>
                      <p className="text-[9px] text-muted-foreground font-bold uppercase">
                        Locked
                      </p>
                    </div>
                  </div>
                  <Lock size={12} className="text-primary/40" />
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-auto flex gap-4 pt-4">
              <Button
                size="lg"
                className="flex-1 rounded-2xl font-bold uppercase text-[10px] tracking-widest h-12 shadow-lg"
                onClick={() =>
                  router.push(`/appointments/new?propertyId=${id}`)
                }
              >
                Book Now
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex-1 rounded-2xl font-bold uppercase text-[10px] tracking-widest h-12 border-2"
              >
                Contact
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* OVERVIEW & FACILITIES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DataCard
          title="Property Overview"
          data={overviewData}
          accentColor="bg-primary"
        />
        <DataCard
          title="Nearby Facilities"
          data={facilitiesData}
          accentColor="bg-green-500"
        />
      </div>

      {/* DESCRIPTION */}
      <Card className="rounded-[2.5rem] shadow-xl border-border overflow-hidden bg-card">
        <CardHeader className="px-8 py-5 border-b bg-muted/30">
          <CardTitle className="text-md font-bold flex items-center gap-3">
            <div className="w-1.5 h-5 rounded-full bg-amber-500" />
            <FileText size={18} className="text-muted-foreground" />
            Detailed Description
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          {description ? (
            <p className="text-[13px] leading-relaxed text-muted-foreground font-medium">
              {description}
            </p>
          ) : (
            <p className="text-[13px] text-muted-foreground italic">
              No description provided.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DataCard({
  title,
  data,
  accentColor,
}: {
  title: string;
  data: any[];
  accentColor: string;
}) {
  return (
    <Card className="rounded-[2.5rem] shadow-xl border-border overflow-hidden bg-card">
      <CardHeader className="px-8 py-5 border-b bg-muted/30">
        <CardTitle className="text-md font-bold flex items-center gap-3">
          <div className={cn("w-1.5 h-5 rounded-full", accentColor)} /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
        {data.map((item, i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="p-1 rounded-lg bg-muted">{item.icon}</div>
              <span className="text-[12px] font-semibold">{item.label}:</span>
            </div>
            <span className="text-[12px] font-bold text-foreground">
              {item.value}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
