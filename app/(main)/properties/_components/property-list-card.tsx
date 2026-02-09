
"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MapPin, Banknote, Eye, CalendarCheck, Info, MoreHorizontal, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import DeletePropertyDialog from "./delete-property";

export default function PropertyListCard({ property, canManage, onDelete }: any) {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "sold": return "bg-red-50 text-red-700 border-red-200";
      case "booked": return "bg-amber-50 text-amber-700 border-amber-200";
      default: return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
  };

  return (
    <Card className="group overflow-hidden rounded-3xl border border-border/60 shadow-sm hover:shadow-md transition-all duration-300 bg-card p-3">
      {/* PHOTO SECTION - Exact match to appointment card */}
      <div 
        className="relative aspect-16/10 cursor-pointer overflow-hidden rounded-2xl"
        onClick={() => router.push(`/properties/${property._id}`)}
      >
        <Image
          src={property.images?.[0] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa"}
          alt={property.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex justify-between w-[90%]">
          <Badge variant="secondary" className="bg-black/60 text-white text-[10px] py-0.5 px-2 backdrop-blur-md border-none font-bold">
            ID: {property._id.toString().slice(-5).toUpperCase()}
          </Badge>

          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="h-7 w-7 rounded-full bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 rounded-xl">
                <DropdownMenuItem onClick={() => router.push(`/properties/${property._id}/edit`)} className="cursor-pointer gap-2 text-xs font-bold">
                  <Pencil size={14} /> EDIT
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="p-1">
                   <DeletePropertyDialog propertyId={property._id} onDelete={onDelete} />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <CardContent className="p-0 pt-3 flex flex-col gap-2.5">
        {/* TITLE BOX */}
        <div className="bg-muted/30 p-2.5 rounded-xl border border-border/40">
          <h3 className="font-bold text-xs tracking-wide line-clamp-1 text-foreground uppercase">
            {property.title}
          </h3>
        </div>

        {/* LOCATION BOX */}
        <div className="bg-muted/30 p-2.5 rounded-xl border border-border/40 flex items-center">
          <MapPin size={14} className="mr-2 text-destructive shrink-0" />
          <span className="text-[11px] font-bold truncate uppercase text-muted-foreground">
            {property.location}
          </span>
        </div>

        {/* PRICE BOX */}
        <div className="bg-muted/30 p-2.5 rounded-xl border border-border/40 flex items-center">
          <Banknote size={14} className="mr-2 text-primary shrink-0" />
          <span className="text-[11px] font-black text-primary uppercase truncate">
            NPR. {new Intl.NumberFormat("en-IN").format(property.price)}
          </span>
        </div>

        {/* ROW: VIEW & STATUS */}
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline"
            className="h-10 rounded-xl font-bold text-[10px] uppercase tracking-wider border"
            onClick={() => router.push(`/properties/${property._id}`)}
          >
            <Eye size={14} className="mr-2" /> View
          </Button>
          <div className={cn(
            "flex items-center justify-center rounded-xl border text-[9px] font-black uppercase tracking-tighter text-center px-1",
            getStatusColor(property.status)
          )}>
            <Info size={12} className="mr-1.5" /> {property.status || "Available"}
          </div>
        </div>

        {/* FULL WIDTH BOOK NOW */}
        <Button 
          className="w-full h-11 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-sm mt-0.5"
          onClick={() => router.push(`/appointments/new?propertyId=${property._id}`)}
        >
          <CalendarCheck size={14} className="mr-2" /> Book Now
        </Button>
      </CardContent>
    </Card>
  );
}