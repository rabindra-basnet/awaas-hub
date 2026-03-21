// "use client";

// import React from "react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { MapPin, Banknote, Building2, Trash2 } from "lucide-react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { useToggleFavorite } from "@/lib/client/queries/properties.queries";

// interface FavouriteDetailsCardProps {
//   property: any;
//   onRemove: (id: string) => void;
// }

// const FALLBACK_IMAGE =
//   "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80";

// export default function FavouriteDetailsCard({
//   property,
//   onRemove,
// }: FavouriteDetailsCardProps) {
//   const router = useRouter();

//   const toggleFav = useToggleFavorite();
//   const imageUrl =
//     Array.isArray(property.images) && property.images.length > 0
//       ? property.images[0]
//       : FALLBACK_IMAGE;

//   return (
//     <Card className="group overflow-hidden rounded-[1.5rem] border-border/40 shadow-md bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
//       {/* ── IMAGE SECTION ── */}
//       <div className="relative w-full h-52 overflow-hidden bg-muted">
//         <Image
//           src={imageUrl}
//           alt={property.title || "Property"}
//           fill
//           sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
//           className="object-cover transition-transform duration-700 group-hover:scale-110"
//         />

//         {/* Gradient overlay for badges readability */}
//         <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-black/10" />

//         {/* Top-left: ID badge */}
//         <div className="absolute top-3 left-3">
//           <Badge className="bg-white/90 backdrop-blur-sm text-black border-none text-[9px] font-black shadow-lg px-2 py-0.5">
//             #{property._id.toString().slice(-5).toUpperCase()}
//           </Badge>
//         </div>

//         {/* Top-right: Status badge */}
//         {property.status && (
//           <div className="absolute top-3 right-3">
//             <Badge className="bg-primary/90 backdrop-blur-sm text-primary-foreground text-[9px] font-black uppercase shadow-lg px-2 py-0.5">
//               {property.status}
//             </Badge>
//           </div>
//         )}

//         {/* Bottom-left: Price overlay on image */}
//         <div className="absolute bottom-3 left-3">
//           <div className="bg-black/60 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center gap-1.5">
//             <Banknote size={12} className="text-white/80" />
//             <span className="text-white text-[11px] font-black">
//               NPR. {new Intl.NumberFormat("en-IN").format(property.price)}
//             </span>
//           </div>
//         </div>

//         {/* Bottom-right: Category pill */}
//         {property.category && (
//           <div className="absolute bottom-3 right-3">
//             <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-2.5 py-1 flex items-center gap-1">
//               <Building2 size={10} className="text-white" />
//               <span className="text-white text-[9px] font-bold uppercase">
//                 {property.category}
//               </span>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ── CONTENT SECTION ── */}
//       <CardContent className="p-4 space-y-3">
//         {/* Title */}
//         <h3 className="font-bold text-[13px] leading-tight line-clamp-1">
//           {property.title || "Untitled Property"}
//         </h3>

//         {/* Location */}
//         <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
//           <MapPin size={12} className="text-destructive shrink-0" />
//           <span className="truncate">{property.location || "N/A"}</span>
//         </div>

//         {/* Divider */}
//         <div className="h-px bg-border/50" />

//         {/* Actions */}
//         <div className="flex gap-2 pt-0.5">
//           <Button
//             className="flex-1 h-9 rounded-xl font-bold text-[10px] uppercase tracking-widest"
//             onClick={() =>
//               router.push(`/properties/${property._id}?from=favorites`)
//             }
//           >
//             View Details
//           </Button>
//           <Button
//             variant="outline"
//             size="icon"
//             className="h-9 w-9 rounded-xl border-2 border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors shrink-0"
//             onClick={() =>
//               toggleFav.mutate({
//                 propertyId: property._id,
//                 isFav: !!1,
//               })
//             }
//           >
//             <Trash2 size={14} />
//           </Button>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MapPin, Banknote, Building2, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToggleFavorite } from "@/lib/client/queries/properties.queries";

interface FavouriteDetailsCardProps {
  property: any;
  onRemove: (id: string) => void;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80";

export default function FavouriteDetailsCard({
  property,
  onRemove,
}: FavouriteDetailsCardProps) {
  const router = useRouter();
  const toggleFav = useToggleFavorite();
  const [showConfirm, setShowConfirm] = useState(false);

  const imageUrl =
    Array.isArray(property.images) && property.images.length > 0
      ? property.images[0]
      : FALLBACK_IMAGE;

  const handleConfirmRemove = () => {
    // ✅ isFav: true → triggers DELETE in useToggleFavorite
    toggleFav.mutate(
      { propertyId: property._id, isFav: true },
      {
        onSuccess: () => {
          // ✅ Also call onRemove to refetch the favorites list in parent
          onRemove(property._id);
          setShowConfirm(false);
        },
      },
    );
  };

  return (
    <>
      <Card className="group overflow-hidden rounded-[1.5rem] border-border/40 shadow-md bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        {/* IMAGE SECTION */}
        <div className="relative w-full h-52 overflow-hidden bg-muted">
          <Image
            src={imageUrl}
            alt={property.title || "Property"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />

          <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-black/10" />

          {/* ID badge */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-white/90 backdrop-blur-sm text-black border-none text-[9px] font-black shadow-lg px-2 py-0.5">
              #{property._id.toString().slice(-5).toUpperCase()}
            </Badge>
          </div>

          {/* Status badge */}
          {property.status && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-primary/90 backdrop-blur-sm text-primary-foreground text-[9px] font-black uppercase shadow-lg px-2 py-0.5">
                {property.status}
              </Badge>
            </div>
          )}

          {/* Price overlay */}
          <div className="absolute bottom-3 left-3">
            <div className="bg-black/60 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center gap-1.5">
              <Banknote size={12} className="text-white/80" />
              <span className="text-white text-[11px] font-black">
                NPR. {new Intl.NumberFormat("en-IN").format(property.price)}
              </span>
            </div>
          </div>

          {/* Category pill */}
          {property.category && (
            <div className="absolute bottom-3 right-3">
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-2.5 py-1 flex items-center gap-1">
                <Building2 size={10} className="text-white" />
                <span className="text-white text-[9px] font-bold uppercase">
                  {property.category}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* CONTENT SECTION */}
        <CardContent className="p-4 space-y-3">
          <h3 className="font-bold text-[13px] leading-tight line-clamp-1">
            {property.title || "Untitled Property"}
          </h3>

          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
            <MapPin size={12} className="text-destructive shrink-0" />
            <span className="truncate">{property.location || "N/A"}</span>
          </div>

          <div className="h-px bg-border/50" />

          <div className="flex gap-2 pt-0.5">
            <Button
              className="flex-1 h-9 rounded-xl font-bold text-[10px] uppercase tracking-widest"
              onClick={() =>
                router.push(
                  `/dashboard/properties/${property._id}?from=favorites`,
                )
              }
            >
              View Details
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={toggleFav.isPending}
              className="h-9 w-9 rounded-xl border-2 border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors shrink-0"
              onClick={() => setShowConfirm(true)}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ✅ Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Favorites?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-semibold text-foreground">
                {property.title}
              </span>{" "}
              from your favorites? You can always add it back later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="rounded-xl"
              disabled={toggleFav.isPending}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={toggleFav.isPending}
              onClick={handleConfirmRemove}
            >
              {toggleFav.isPending ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
