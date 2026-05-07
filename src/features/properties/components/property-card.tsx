"use client";

import { useTransition } from "react";
import { Heart, MapPin, BedDouble, Bath, Maximize2, Building2, MoreVertical, Pencil, Trash2, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useToggleFavorite, useDeleteProperty } from "@/features/properties/queries/properties.queries";
import { toast } from "sonner";
import type { PropertyWithMeta } from "@/features/properties/server/properties.fetcher";
import Link from "next/link";
import { useRouter } from "next/navigation";

const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  available: { label: "Available", className: "property-badge-available", icon: CheckCircle2 },
  booked:    { label: "Booked",    className: "property-badge-booked",    icon: Clock },
  sold:      { label: "Sold",      className: "property-badge-sold",      icon: XCircle },
};

const verifyConfig: Record<string, { label: string; className: string }> = {
  pending:  { label: "Pending",  className: "property-badge-pending" },
  verified: { label: "Verified", className: "property-badge-verified" },
  rejected: { label: "Rejected", className: "property-badge-rejected" },
};

interface PropertyCardProps {
  property: PropertyWithMeta;
  canFavorite: boolean;
  canManage: boolean;
}

export default function PropertyCard({ property: p, canFavorite, canManage }: PropertyCardProps) {
  const router = useRouter();
  const toggle = useToggleFavorite();
  const deleteProperty = useDeleteProperty();
  const [isDeleting, startDelete] = useTransition();

  const status  = statusConfig[p.status]  ?? statusConfig.available;
  const verify  = verifyConfig[p.verificationStatus] ?? verifyConfig.pending;

  function handleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!canFavorite) {
      toast.info("Sign in to save properties");
      return;
    }
    toggle.mutate(
      { propertyId: p._id, isFav: p.isFavorite },
      {
        onSuccess: () => toast.success(p.isFavorite ? "Removed from favorites" : "Saved"),
        onError:   (err) => toast.error(err.message),
      },
    );
  }

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this property? This cannot be undone.")) return;
    startDelete(async () => {
      deleteProperty.mutate(p._id, {
        onSuccess: () => toast.success("Property deleted"),
        onError:   (err) => toast.error(err.message),
      });
    });
  }

  return (
    <Link href={`/properties/${p._id}`} className="property-card group">
      {/* ── Image ── */}
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {p.imageUrl ? (
          <img
            src={p.imageUrl}
            alt={p.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/60">
            <Building2 className="w-12 h-12 text-muted-foreground/20" />
          </div>
        )}

        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* status badge — bottom left */}
        <span className={`absolute bottom-2.5 left-2.5 property-badge ${status.className}`}>
          {p.status}
        </span>

        {/* verification badge — top left */}
        {p.verificationStatus !== "verified" && (
          <span className={`absolute top-2.5 left-2.5 property-badge ${verify.className}`}>
            {p.verificationStatus}
          </span>
        )}

        {/* Favorite button — top right */}
        <button
          type="button"
          onClick={handleFavorite}
          disabled={toggle.isPending}
          className="absolute top-2 right-2 property-icon-btn"
          aria-label={p.isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              canFavorite && p.isFavorite ? "fill-rose-500 text-rose-500" : "text-foreground"
            }`}
          />
        </button>

        {/* Owner actions — bottom right (only when canManage) */}
        {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                className="absolute bottom-2 right-2 property-icon-btn"
                aria-label="Property actions"
              />}
            >
              <MoreVertical className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  router.push(`/properties/${p._id}/edit`);
                }}
              >
                <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                disabled={isDeleting}
                onClick={handleDelete}
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" />
                {isDeleting ? "Deleting…" : "Delete"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* ── Body ── */}
      <div className="p-4 space-y-2.5">
        {/* Title */}
        <p className="font-semibold text-sm leading-snug truncate group-hover:text-primary transition-colors">
          {p.title}
        </p>

        {/* Location */}
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{p.location}</span>
        </p>

        {/* Stats chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {p.bedrooms != null && p.bedrooms > 0 && (
            <span className="property-stat-chip">
              <BedDouble className="w-3 h-3" /> {p.bedrooms} bed
            </span>
          )}
          {p.bathrooms != null && p.bathrooms > 0 && (
            <span className="property-stat-chip">
              <Bath className="w-3 h-3" /> {p.bathrooms} bath
            </span>
          )}
          {p.area && (
            <span className="property-stat-chip">
              <Maximize2 className="w-3 h-3" /> {p.area}
            </span>
          )}
        </div>

        {/* Price + category */}
        <div className="flex items-center justify-between pt-0.5">
          <p className="font-bold text-base">
            NPR <span className="tabular-nums">{p.price.toLocaleString()}</span>
          </p>
          <Badge variant="secondary" className="text-[10px] capitalize">
            {p.category}
          </Badge>
        </div>
      </div>
    </Link>
  );
}
