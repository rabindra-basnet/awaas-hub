import { queryClient } from "@/lib/client/query-client";
import {
    useQuery,
    useMutation,
    useQueryClient,
    QueryClient,
} from "@tanstack/react-query";
import { useFavorites, useToggleFavorite } from "./useFavourite";

export type PropertyForm = {
    title: string;
    price: number;
    location: string;
    images?: string[];
};

// // Fetch all properties
// export function useProperties() {
//     return useQuery({
//         queryKey: ["properties"],
//         queryFn: async () => {
//             const res = await fetch("/api/properties");
//             if (!res.ok) throw new Error("Failed to fetch properties");
//             return res.json();
//         },
//     });
// }

// Fetch a single property by ID
// export function useProperty(id: string) {
//     return useQuery({
//         queryKey: ["property", id],
//         queryFn: async () => {
//             const res = await fetch(`/api/properties/${id}`);
//             if (!res.ok) throw new Error("Failed to fetch property");
//             return res.json();
//         },
//     });
// }

export function useProperties() {
    const { data: favorites } = useFavorites();

    return useQuery({
        queryKey: ["properties"],
        queryFn: async () => {
            const res = await fetch("/api/properties");
            if (!res.ok) throw new Error("Failed to fetch properties");
            const properties = await res.json();

            // mark properties that are favorited
            return properties.map((p: any) => ({
                ...p,
                isFavorite: favorites?.includes(p._id) ?? false,
            }));
        },
    });
}
export function useProperty(id: string) {
    const { data: favorites } = useFavorites();

    return useQuery({
        queryKey: ["property", id],
        queryFn: async () => {
            const res = await fetch(`/api/properties/${id}`);
            if (!res.ok) throw new Error("Failed to fetch property");
            const property = await res.json();

            return {
                ...property,
                isFavorite: favorites?.includes(property._id) ?? false,
            };
        },
    });
}


// Create new property
export function useCreateProperty() {
    const toggleFav = useToggleFavorite();

    return useMutation({
        mutationFn: async (data: PropertyForm) => {
            const res = await fetch("/api/properties/new", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to create property");
            return res.json();
        },
        onSuccess: (data) => {
            (queryClient.invalidateQueries({ queryKey: ["properties"] }),
                toggleFav.mutate({ propertyId: data._id, isFav: false }));
        },
    });
}
