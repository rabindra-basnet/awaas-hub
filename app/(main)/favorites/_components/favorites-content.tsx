"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, ArrowRight, Search, SlidersHorizontal } from "lucide-react";
import { useSession } from "@/lib/client/auth-client";
import { Role, Permission, hasAnyPermission } from "@/lib/rbac";
import { useFavorites } from "@/lib/client/queries/favorites.queries";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FavouriteDetailsCard from "./favourite-details-card";

const ITEMS_PER_PAGE = 9;

export default function FavoritesContent() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const isAnonymous = session?.user?.isAnonymous === true;
  const isEnabled = !!session?.user && !isAnonymous;

  useEffect(() => {
    if (!isPending && (!session || isAnonymous)) router.push("/login");
  }, [session, isPending, isAnonymous, router]);

  const { data: favorites = [], isLoading, refetch } = useFavorites(isEnabled);

  const filtered = useMemo(() => {
    return favorites.filter((p: any) => {
      const matchesSearch =
        !search ||
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.location?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || p.status?.toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [favorites, search, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  if (isPending || !session?.user || isAnonymous) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const role = session.user.role as Role;
  if (!hasAnyPermission(role, [Permission.VIEW_FAVORITES, Permission.MANAGE_FAVORITES])) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-4">
        <Heart size={40} className="text-destructive opacity-40" />
        <p className="text-sm font-semibold text-muted-foreground">
          You don't have permission to view favorites.
        </p>
        <Link href="/properties" className="text-xs font-bold text-primary underline underline-offset-2">
          Browse Properties
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm text-muted-foreground">
            {favorites.length} saved propert{favorites.length !== 1 ? "ies" : "y"}
          </p>
        </div>
        <Link href="/properties">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            Browse more <ArrowRight size={13} />
          </Button>
        </Link>
      </div>

      {/* Filters */}
      {favorites.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search saved properties…"
              className="pl-8 h-9 text-sm"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-9 gap-1.5 text-sm">
              <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="booked">Booked</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border bg-muted/20 h-64 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <Heart size={28} className="text-muted-foreground opacity-40" />
          </div>
          <div>
            <p className="font-semibold text-sm">
              {favorites.length === 0 ? "No saved properties yet" : "No results match your filters"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {favorites.length === 0
                ? "Heart a property to save it here."
                : "Try adjusting your search or filter."}
            </p>
          </div>
          {favorites.length === 0 && (
            <Link href="/properties">
              <Button size="sm">Browse Properties</Button>
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginated.map((property: any) => (
              <FavouriteDetailsCard
                key={property._id}
                property={property}
                onRemove={() => refetch()}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 pt-2">
              <p className="text-xs text-muted-foreground">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="h-8 px-3 text-xs"
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    variant={p === currentPage ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 p-0 text-xs"
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="h-8 px-3 text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
