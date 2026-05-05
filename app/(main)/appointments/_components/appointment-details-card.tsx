"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MapPin, Banknote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AppointmentDetailsCardProps {
  property: any;
}

export default function AppointmentDetailsCard({
  property,
}: AppointmentDetailsCardProps) {
  const router = useRouter();

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
      <div
        className="relative aspect-16/10 cursor-pointer overflow-hidden rounded-2xl"
        onClick={() => router.push(`/properties/${property._id}`)}
      >
        <Image
          src={
            property.images?.[0] ||
            "https://images.unsplash.com/photo-1560518883-ce09059eeffa"
          }
          alt={property.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <Badge
            variant="secondary"
            className="bg-black/60 text-white text-[10px] py-0.5 px-2 backdrop-blur-md border-none font-bold"
          >
            ID: {property._id.slice(-5).toUpperCase()}
          </Badge>
        </div>
      </div>

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

        <div className="flex gap-2">
          <div className="flex-[2.5] bg-muted/30 p-2.5 rounded-xl border border-border/40 flex items-center">
            <Banknote size={14} className="mr-2 text-primary shrink-0" />
            <span className="text-[11px] font-black text-primary uppercase truncate">
              NPR. {new Intl.NumberFormat("en-IN").format(property.price)}
            </span>
          </div>

          <div
            className={cn(
              "flex-1 flex items-center justify-center rounded-xl border text-[9px] font-black uppercase tracking-tighter text-center px-1",
              getStatusColor(property.status),
            )}
          >
            {property.status || "Available"}
          </div>
        </div>

        <Button
          className="w-full h-11 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-sm mt-0.5"
          onClick={() =>
            router.push(`/appointments/new?propertyId=${property._id}`)
          }
        >
          Buy Now
        </Button>
      </CardContent>
    </Card>
  );
}
