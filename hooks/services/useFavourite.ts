import { queryClient } from "@/lib/client/query-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface ToggleFavoriteInput {
    propertyId: string;
    isFav: boolean;
}

export function useFavorites() {
    return useQuery(
        {
            queryKey: ["favorites"],
            queryFn: async () => {
                const res = await fetch("/api/favorites");
                if (!res.ok) throw new Error("Failed to fetch favorites");
                return res.json();
            }
        });
}

export function useToggleFavorite() {
    return useMutation<void, Error, ToggleFavoriteInput>({
        mutationFn: async ({ propertyId, isFav }) => {
            const res = await fetch(`/api/favorites${isFav ? `/${propertyId}` : ""}`, {
                method: isFav ? "DELETE" : "POST",
                headers: { "Content-Type": "application/json" },
                body: isFav ? undefined : JSON.stringify({ propertyId }),
            });

            if (!res.ok) {
                throw new Error("Failed to toggle favorite");
            }

            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["favorites"] });
        },
    });
}
