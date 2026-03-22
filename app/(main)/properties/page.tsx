"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  MapPin,
  Building2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { hasPermission, Permission, Role } from "@/lib/rbac";
import { useSession } from "@/lib/client/auth-client";
import Loading from "@/components/loading";

import PropertyListCard from "./_components/property-list-card";
import FloatingAddProperty from "./_components/floating-add-property";
import {
  useProperties,
  useDeleteProperty,
  useToggleFavorite,
} from "@/lib/client/queries/properties.queries";

import PropertyNotFound from "./[id]/_components/property-not-found";

// ✅ Ad components
import { AdBanner } from "@/components/ads/AdBanner";
import { InterstitialAd } from "@/components/ads/InterstitialAd";

const ITEMS_PER_PAGE = 12;
// Inject an inline ad after every Nth property card
const AD_INJECT_EVERY = 6;

export default function PropertiesPage() {
  const router = useRouter();

  const { data: session, isPending: isSessionLoading } = useSession();

  const isAnonymous = session?.user?.isAnonymous === true;

  const canManage =
    !isSessionLoading && !!session && !isAnonymous
      ? hasPermission(session.user.role as Role, Permission.MANAGE_PROPERTIES)
      : false;

  const { data: properties = [], isLoading, error } = useProperties();
  const deleteProperty = useDeleteProperty();
  const toggleFav = useToggleFavorite();

  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const favoriteIds = useMemo(
    () => properties.filter((p: any) => p.isFavorite).map((p: any) => p._id),
    [properties],
  );

  const filteredProperties = useMemo(() => {
    return properties.filter((p: any) => {
      const matchesSearch = p.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesLocation =
        locationFilter === "all" ||
        p.location?.toLowerCase().includes(locationFilter.toLowerCase());
      const matchesType =
        typeFilter === "all" ||
        p.category?.toLowerCase() === typeFilter.toLowerCase();
      return matchesSearch && matchesLocation && matchesType;
    });
  }, [properties, searchQuery, locationFilter, typeFilter]);

  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE);
  const currentData = filteredProperties.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const requireAuth = (action: () => void) => {
    if (isAnonymous) {
      router.push("/login");
      return;
    }
    action();
  };

  if (isLoading || isSessionLoading) return <Loading />;

  if (error) return <PropertyNotFound />;

  return (
    <div className="w-full max-w-350 mx-auto px-4 lg:px-6 py-6 space-y-6 min-h-screen">
      {/* ✅ Interstitial ad — shown once per session on page load */}
      <InterstitialAd />

      {/* ✅ FAB only for managers */}
      {canManage && <FloatingAddProperty />}

      {/* FILTER BAR */}
      <div className="flex flex-col md:flex-row gap-3 items-center bg-background p-2 rounded-xl border shadow-sm w-full">
        <div className="relative flex-1 w-full">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={16}
          />
          <Input
            placeholder="Search properties..."
            className="pl-9 h-10 border-none bg-muted/40 focus-visible:ring-1 rounded-lg text-sm"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <Select
            onValueChange={(v) => {
              setLocationFilter(v);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-45 h-10 rounded-lg text-xs font-bold">
              <MapPin className="mr-2 h-3.5 w-3.5 text-primary" />
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="Kathmandu">Kathmandu</SelectItem>
              <SelectItem value="Bhaktapur">Bhaktapur</SelectItem>
              <SelectItem value="Lalitpur">Lalitpur</SelectItem>
            </SelectContent>
          </Select>

          <Select
            onValueChange={(v) => {
              setTypeFilter(v);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-45 h-10 rounded-lg text-xs font-bold">
              <Building2 className="mr-2 h-3.5 w-3.5 text-primary" />
              <SelectValue placeholder="Property Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="House">House</SelectItem>
              <SelectItem value="Apartment">Apartment</SelectItem>
              <SelectItem value="Land">Land</SelectItem>
              <SelectItem value="Colony">Colony</SelectItem>
            </SelectContent>
          </Select>

          {canManage && (
            <Button onClick={() => router.push("/properties/new")}>
              Add New Property
            </Button>
          )}
        </div>
      </div>

      {/* PROPERTY GRID + INLINE ADS */}
      {currentData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <Building2 size={48} className="mb-4 opacity-30" />
          <p className="text-sm font-medium">No properties found</p>
          <p className="text-xs mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ✅ Top banner ad — above the grid */}
          <AdBanner slot="properties-top" priority />

          {/* Grid with inline ad injected every AD_INJECT_EVERY cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentData.map((property: any, index: number) => (
              <React.Fragment key={property._id}>
                <PropertyListCard
                  property={property}
                  canManage={canManage}
                  isFavorite={favoriteIds.includes(property._id)}
                  onToggleFavorite={(id, isFav) =>
                    requireAuth(() =>
                      toggleFav.mutate({ propertyId: id, isFav: !isFav }),
                    )
                  }
                  onDelete={(id: string) =>
                    requireAuth(() => deleteProperty.mutate(id))
                  }
                />

                {/* ✅ Inline banner ad after every AD_INJECT_EVERY-th card */}
                {(index + 1) % AD_INJECT_EVERY === 0 &&
                  index < currentData.length - 1 && (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3">
                      <AdBanner
                        slot="properties-inline"
                        className="w-full"
                        slim
                      />
                    </div>
                  )}
              </React.Fragment>
            ))}
          </div>
          <AdBanner slot="properties-inline" priority />
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 pt-6 pb-12">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => {
              setCurrentPage((prev) => prev - 1);
              window.scrollTo(0, 0);
            }}
            className="h-9 px-4 rounded-lg font-bold"
          >
            <ChevronLeft size={16} className="mr-1" /> Previous
          </Button>

          <div className="flex items-center gap-2 px-4 text-xs font-black bg-muted/50 h-9 rounded-lg border">
            <span className="text-primary">{currentPage}</span> / {totalPages}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => {
              setCurrentPage((prev) => prev + 1);
              window.scrollTo(0, 0);
            }}
            className="h-9 px-4 rounded-lg font-bold"
          >
            Next <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
