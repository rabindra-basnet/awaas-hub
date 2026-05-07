"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { apiError } from "@/shared/lib/error";
import { Heart, Home } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useToggleFavorite } from "@/features/properties/queries/properties.queries";
import { toast } from "sonner";
import { Badge } from "@/shared/components/ui/badge";

function useFavorites() {
  return useSuspenseQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const res = await fetch("/api/favorites");
      if (!res.ok) throw await apiError(res);
      return res.json();
    },
  });
}

export default function FavoritesContent() {
  const { data } = useFavorites();
  const toggleFav = useToggleFavorite();
  const favorites: any[] = data?.favorites ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Saved Properties</h1>
        <p className="text-sm text-muted-foreground mt-1">{favorites.length} saved</p>
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20 gap-4 text-muted-foreground">
          <Heart className="w-12 h-12 opacity-20" />
          <p className="text-sm">No saved properties yet</p>
          <Link href="/properties" className="text-xs text-primary hover:underline">Browse properties →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {favorites.map((p: any) => (
            <div key={p._id} className="rounded-xl border border-border bg-card overflow-hidden group hover:shadow-md transition-shadow">
              <div className="relative h-48 bg-muted">
                {p.imageUrl ? (
                  <Image src={p.imageUrl} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <Home className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                )}
                <button
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-background transition-colors"
                  onClick={() =>
                    toggleFav.mutate(
                      { propertyId: p._id, isFav: true },
                      {
                        onSuccess: () => toast.success("Removed from favorites"),
                        onError: (e) => toast.error(e.message),
                      },
                    )
                  }
                >
                  <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                </button>
              </div>
              <Link href={`/properties/${p._id}`} className="block p-4">
                <h3 className="font-semibold text-sm truncate">{p.title}</h3>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{p.location}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm font-bold">NPR {p.price?.toLocaleString()}</span>
                  <Badge variant="secondary" className="text-[10px]">{p.category}</Badge>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
