// import { queryClient } from "@/lib/client/query-client";
// import {
//     useQuery,
//     useMutation,
//     useQueryClient,
//     QueryClient,
// } from "@tanstack/react-query";
// import { useFavorites, useToggleFavorite } from "./useFavourite";

// export type PropertyForm = {
//     title: string;
//     price: number;
//     location: string;
//     images?: string[];
// };



// export function useProperties() {
//     const { data: favorites } = useFavorites();

//     return useQuery({
//         queryKey: ["properties"],
//         queryFn: async () => {
//             const res = await fetch("/api/properties");
//             if (!res.ok) throw new Error("Failed to fetch properties");
//             const properties = await res.json();

//             // mark properties that are favorited
//             return properties.map((p: any) => ({
//                 ...p,
//                 isFavorite: favorites?.includes(p._id) ?? false,
//             }));
//         },
//     });
// }
// export function useProperty(id: string) {
//     const { data: favorites } = useFavorites();

//     return useQuery({
//         queryKey: ["property", id],
//         queryFn: async () => {
//             const res = await fetch(`/api/properties/${id}`);
//             if (!res.ok) throw new Error("Failed to fetch property");
//             const property = await res.json();

//             return {
//                 ...property,
//                 isFavorite: favorites?.includes(property._id) ?? false,
//             };
//         },
//     });
// }

// export function useUpdateProperty() {

//     return useMutation({
//         mutationFn: async ({ id, ...data }: { id: string } & PropertyForm) => {
//             const res = await fetch(`/api/properties/${id}`, {
//                 method: "PUT",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify(data),
//             });
//             if (!res.ok) throw new Error("Failed to update property");
//             return res.json();
//         },
//         onSuccess: (_, variables) => {
//             queryClient.invalidateQueries({ queryKey: ["properties"] });
//             queryClient.invalidateQueries({ queryKey: ["property", variables.id] });
//         },
//     });
// }

// export function useDeleteProperty() {

//     return useMutation({
//         mutationFn: async (id: string) => {
//             const res = await fetch(`/api/properties/${id}`, {
//                 method: "DELETE",
//             });
//             if (!res.ok) throw new Error("Failed to delete property");
//             return res.json();
//         },
//         onSuccess: (_, id) => {
//             queryClient.invalidateQueries({ queryKey: ["properties"] });
//             queryClient.removeQueries({ queryKey: ["property", id] });
//         },
//     });
// }

// // Create new property
// export function useCreateProperty() {
//     const toggleFav = useToggleFavorite();

//     return useMutation({
//         mutationFn: async (data: PropertyForm) => {
//             const res = await fetch("/api/properties/new", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify(data),
//             });
//             if (!res.ok) throw new Error("Failed to create property");
//             return res.json();
//         },
//         onSuccess: (data) => {
//             (queryClient.invalidateQueries({ queryKey: ["properties"] }),
//                 toggleFav.mutate({ propertyId: data._id, isFav: false }));
//         },
//     });
// }


import { queryClient } from "@/lib/client/query-client";
import { useQuery, useMutation } from "@tanstack/react-query";

export type PropertyForm = {
    title: string;
    price: number;
    location: string;
    images?: string[];
};

// ✅ Fetch all properties with isFavorite baked in
export function useProperties(userId?: string) {
    return useQuery({
        queryKey: ["properties", userId],
        queryFn: async () => {
            const res = await fetch("/api/properties");
            if (!res.ok) throw new Error("Failed to fetch properties");
            const properties = await res.json();

            // Automatically mark isFavorite based on backend flag
            return properties.map((p: any) => ({
                ...p,
                isFavorite: !!p.isFavorite, // comes from backend
            }));
        },
    });
}

// ✅ Fetch single property with isFavorite baked in
export function useProperty(id: string) {
    return useQuery({
        queryKey: ["property", id],
        queryFn: async () => {
            const res = await fetch(`/api/properties/${id}`);
            if (!res.ok) throw new Error("Failed to fetch property");
            const property = await res.json();

            return {
                ...property,
                isFavorite: !!property.isFavorite, // comes from backend
            };
        },
        enabled: !!id,
    });
}

// ✅ Toggle favorite directly via property API
export function useToggleFavorite() {
    return useMutation({
        mutationFn: async ({ propertyId, isFav }: { propertyId: string; isFav: boolean }) => {
            const res = await fetch(`/api/properties/${propertyId}/favorite`, {
                method: isFav ? "DELETE" : "POST",
            });
            if (!res.ok) throw new Error("Failed to toggle favorite");
            return res.json();
        },
        onSuccess: (_, { propertyId }) => {
            // Keep queries in sync
            queryClient.invalidateQueries({ queryKey: ["properties"] });
            queryClient.invalidateQueries({ queryKey: ["property", propertyId] });
        },
    });
}

// ✅ Update property
export function useUpdateProperty() {
    return useMutation({
        mutationFn: async ({ id, ...data }: { id: string } & PropertyForm) => {
            const res = await fetch(`/api/properties/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to update property");
            return res.json();
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["properties"] });
            queryClient.invalidateQueries({ queryKey: ["property", variables.id] });
        },
    });
}

// ✅ Delete property (also deletes backend favorites)
export function useDeleteProperty() {
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/properties/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete property");
            return res.json();
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ["properties"] });
            queryClient.removeQueries({ queryKey: ["property", id] });
        },
    });
}

// ✅ Create new property
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
            // Invalidate list and initialize isFavorite
            queryClient.invalidateQueries({ queryKey: ["properties"] });
            toggleFav.mutate({ propertyId: data._id, isFav: false });
        },
    });
}
