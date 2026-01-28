"use client";

import { useSession } from "@/lib/client/auth-client";
import { useProperty, useToggleFavorite } from "@/lib/client/queries/properties.queries";
import PropertyDetailsCard from "../_components/property-details-card";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { use } from "react";

export default function PropertyDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const { data: property, isLoading, error } = useProperty(id);
  const toggleFav = useToggleFavorite();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-4">Error loading property</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleToggleFavorite = () => {
    toggleFav.mutate({
      propertyId: id,
      isFav: !property.isFavorite,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `Check out this property: ${property.title}`,
        url: window.location.href,
      });
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen">
      <PropertyDetailsCard
        property={property}
        isFavorite={property.isFavorite}
        onToggleFavorite={handleToggleFavorite}
        onShare={handleShare}
      />
    </div>
  );
}