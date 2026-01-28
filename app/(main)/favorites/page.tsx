"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/client/auth-client";
import Link from "next/link";
import { Role, Permission, hasAnyPermission } from "@/lib/rbac";

interface Property {
  _id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[];
}

export default function BuyerFavoritesPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(true);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      const role = session.user.role as Role;

      // Check if user can view or manage files/favorites
      const allowed = hasAnyPermission(role, [
        Permission.VIEW_FAVORITES,
        Permission.MANAGE_FAVORITES,
      ]);
      setHasAccess(allowed);

      if (allowed) fetchFavorites();
      else setIsLoading(false); // stop loading if no access
    }
  }, [session?.user]);

  const fetchFavorites = async () => {
    try {
      const response = await fetch("/api/favorites");
      if (!response.ok) {
        setFavorites([]);
        return;
      }
      const data = await response.json();
      setFavorites(data || []);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFavorite = async (propertyId: string) => {
    try {
      await fetch(`/api/properties/${propertyId}/favorites`, {
        method: "DELETE",
      });
      setFavorites(favorites.filter((p) => p._id !== propertyId));
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  if (isPending || !session?.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        You do not have permission to view favorites.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="text-center">Loading favorites...</div>
        ) : favorites.length === 0 ? (
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              No saved properties yet.
            </p>
            <Link
              href="/properties"
              className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90"
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((property) => (
              <div
                key={property._id}
                className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-smooth"
              >
                {property.images?.[0] && (
                  <div className="w-full h-48 bg-muted relative">
                    <img
                      src={property.images[0] || "/placeholder.svg"}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {property.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    {property.location}
                  </p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-bold text-primary">
                      ${property.price}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {property.area} sqft
                    </span>
                  </div>
                  <div className="flex gap-2 text-sm text-muted-foreground mb-4">
                    <span>{property.bedrooms} beds</span>
                    <span>•</span>
                    <span>{property.bathrooms} baths</span>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/properties/${property._id}`}
                      className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg text-center hover:bg-primary/90 transition-smooth text-sm"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => removeFavorite(property._id)}
                      className="flex-1 bg-destructive/10 text-destructive py-2 rounded-lg hover:bg-destructive/20 transition-smooth text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
