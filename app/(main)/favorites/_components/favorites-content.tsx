"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useSession } from "@/lib/client/auth-client";
import { Role, Permission, hasAnyPermission } from "@/lib/rbac";
import { useFavorites } from "@/lib/client/queries/favorites.queries";
import FavouriteDetailsCard from "./favourite-details-card";

const ITEMS_PER_PAGE = 6;

export default function FavoritesContent() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [currentPage, setCurrentPage] = useState(1);

  const isAnonymous = session?.user?.isAnonymous === true;
  const isEnabled = !!session?.user && !isAnonymous;

  useEffect(() => {
    if (!isPending && (!session || isAnonymous)) {
      router.push("/login");
    }
  }, [session, isPending, isAnonymous, router]);

  const {
    data: favorites = [],
    isLoading,
    refetch,
  } = useFavorites(isEnabled);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(favorites.length / ITEMS_PER_PAGE));
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [favorites.length, currentPage]);

  const paginatedFavorites = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return favorites.slice(start, start + ITEMS_PER_PAGE);
  }, [favorites, currentPage]);

  const totalPages = Math.max(1, Math.ceil(favorites.length / ITEMS_PER_PAGE));

  const handleRemove = async () => {
    await refetch();
  };

  if (isPending || !session?.user || isAnonymous) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground font-medium">Loading...</p>
      </div>
    );
  }

  const role = session.user.role as Role;
  const hasAccess = hasAnyPermission(role, [
    Permission.VIEW_FAVORITES,
    Permission.MANAGE_FAVORITES,
  ]);

  if (!hasAccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center px-4">
        <Heart size={40} className="text-destructive opacity-50" />
        <p className="text-sm font-semibold text-muted-foreground">
          You do not have permission to view favorites.
        </p>
        <Link
          href="/properties"
          className="text-xs font-bold text-primary underline underline-offset-2"
        >
          Browse Properties
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="text-center text-sm text-muted-foreground">
            Loading favorites...
          </div>
        ) : favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <Heart size={48} className="text-muted-foreground opacity-30" />
            <p className="text-sm text-muted-foreground font-medium">
              No saved properties yet.
            </p>
            <Link
              href="/properties"
              className="inline-block rounded-lg bg-primary px-6 py-2 text-xs font-bold text-primary-foreground"
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedFavorites.map((property) => (
                <FavouriteDetailsCard
                  key={property._id}
                  property={property}
                  onRemove={handleRemove}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex flex-col items-center justify-between gap-4 sm:flex-row">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                  {Math.min(currentPage * ITEMS_PER_PAGE, favorites.length)} of{" "}
                  {favorites.length} favorites
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, index) => {
                      const page = index + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`h-10 w-10 rounded-lg text-sm font-semibold transition ${
                            page === currentPage
                              ? "bg-primary text-primary-foreground"
                              : "border border-border text-foreground hover:bg-muted"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
