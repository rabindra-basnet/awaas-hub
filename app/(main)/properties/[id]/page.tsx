"use client";

import { useFavorites, useToggleFavorite } from "@/hooks/services/useFavourite";
import { useProperty } from "@/hooks/services/useProperties";
import { Heart } from "lucide-react";
import { Key, use } from "react";

export default function PropertyPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const { data: property, isLoading, error } = useProperty(id);
    const { data: favorites } = useFavorites();
    const toggleFav = useToggleFavorite();

    if (isLoading) return <div>Loading...</div>;
    if (error || !property) return <div>Error loading property</div>;

    const { title, location, price, status, images } = property;

    const displayPrice = price ? `$${Number(price).toLocaleString()}` : "N/A";
    const propertyImages = images && images.length > 0 ? images : ["/images/placeholder.png"];
    const isFav = favorites?.includes(id);

    // Status color mapping
    const statusClasses: Record<string, string> = {
        available: "bg-green-100 text-green-800",
        pending: "bg-yellow-100 text-yellow-800",
        sold: "bg-red-100 text-red-800",
    };
    const statusClass = status ? statusClasses[status.toLowerCase()] || "bg-gray-100 text-gray-800" : "bg-gray-100 text-gray-800";

    return (
        <div className="max-w-3xl mx-auto py-12">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold">{title}</h1>
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
            </div>

            <p className="mb-2">Location: {location || "Unknown"}</p>
            <p className="mb-2">Price: {displayPrice}</p>

            <p className="mb-4">
                Status:{" "}
                <span className={`px-2 py-1 rounded text-sm font-medium ${statusClass}`}>
                    {status || "Unknown"}
                </span>
            </p>

            <div className="grid grid-cols-3 gap-4">
                {propertyImages.map((img: string, idx: number) => (
                    <img
                        key={idx}
                        src={img}
                        alt={title}
                        className="w-full h-48 object-cover rounded"
                    />
                ))}
            </div>
        </div>
    );
}

