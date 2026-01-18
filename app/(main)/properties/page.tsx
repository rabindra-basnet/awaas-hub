"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { hasPermission, Permission, Role } from "@/lib/rbac";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSession } from "@/lib/client/auth-client";
import { useProperties } from "@/hooks/services/useProperties";
import { useFavorites, useToggleFavorite } from "@/hooks/services/useFavourite";
import AccessDeniedPage from "@/components/access-denied";
import { Button } from "@/components/ui/button";
import { Heart, HeartMinusIcon, HeartPlusIcon } from "lucide-react";

export default function PropertiesTablePage() {
  const router = useRouter();
  const [canView, setCanView] = useState<boolean | null>(null);
  const [canManage, setCanManage] = useState<boolean>(false);

  // ✅ Check RBAC permissions
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const { data: session } = await getSession();

        if (!session?.user) {
          router.replace("/login");
          return;
        }

        const role = session.user.role as Role;

        if (!hasPermission(role, Permission.VIEW_PROPERTIES)) {
          setCanView(false);
          return;
        }

        setCanView(true);
        setCanManage(hasPermission(role, Permission.MANAGE_PROPERTIES));
      } catch (err) {
        console.error(err);
        router.replace("/login");
      }
    };

    checkPermissions();
  }, [router]);

  // Fetch properties & favorites
  const { data: properties, isLoading, error } = useProperties();
  const { data: favorites } = useFavorites();
  const toggleFav = useToggleFavorite();

  if (canView === null) {
    return <div className="min-h-screen flex items-center justify-center">Checking permissions...</div>;
  }
  if (canView === false) return <AccessDeniedPage />;

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading properties...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">Failed to load properties</div>;

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      {/* Create New Property Button */}
      {canManage && (
        <div className="mb-6 text-right">
          <Link href="/properties/new">
            <Button>Create New Property</Button>
          </Link>
        </div>
      )}

      {(!properties || properties.length === 0) && (
        <div className="text-center py-20">
          <p className="text-muted-foreground mb-4">No properties found.</p>
          {canManage && (
            <Link href="/properties/new">
              <Button>Create Your First Property</Button>
            </Link>
          )}
        </div>
      )}

      {properties && properties.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Favorite</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.map((property: any) => {
              const isFav = favorites?.includes(property._id);

              // Status badge colors
              const statusClass = property.status === "available"
                ? "bg-green-100 text-green-800"
                : property.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800";

              return (
                <TableRow key={property._id} className="hover:bg-muted">
                  <TableCell>{property.title}</TableCell>
                  <TableCell>{property.location}</TableCell>
                  <TableCell>${Number(property.price).toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${statusClass}`}>
                      {property.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => toggleFav.mutate({ propertyId: property._id, isFav: !!isFav })}
                      className="p-1 rounded hover:bg-gray-100 transition"
                    >
                      <Heart
                        size={20}
                        className={isFav ? "text-red-500" : "text-gray-400"}
                        fill={isFav ? "currentColor" : "none"} // filled if favorite, empty if not
                        strokeWidth={2}
                      />
                    </button>
                  </TableCell>
                  <TableCell>
                    <Link href={`/properties/${property._id}`} className="text-primary hover:underline">
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
