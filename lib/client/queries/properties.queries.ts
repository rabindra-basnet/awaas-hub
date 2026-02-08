import { queryOptions, useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/client/query-client";

/* ======================
   Types
====================== */
export type PropertyForm = {
  title: string;
  price: number;
  location: string;
  images?: string[];
};

/* ======================
   Query Keys
====================== */
export const propertyKeys = {
  all: ["properties"] as const,
  list: (userId?: string) => ["properties", userId] as const,
  detail: (id: string) => ["property", id] as const,
};

/* ======================
   READ — ALL
====================== */
export const propertiesQuery = (userId?: string) =>
  queryOptions<any[]>({
    queryKey: propertyKeys.list(userId),
    queryFn: async () => {
      const res = await fetch("/api/properties");
      if (!res.ok) throw new Error("Failed to fetch properties");

      const properties = await res.json();

      return properties.map((p: any) => ({
        ...p,
        isFavorite: !!p.isFavorite, // backend-driven
      }));
    },
  });

export const useProperties = (userId?: string) =>
  useQuery(propertiesQuery(userId));

/* ======================
   READ — SINGLE
====================== */
export const propertyQuery = (id: string) =>
  queryOptions<any>({
    queryKey: propertyKeys.detail(id),
    queryFn: async () => {
      const res = await fetch(`/api/properties/${id}`);
      if (!res.ok) throw new Error("Failed to fetch property");

      const property = await res.json();

      return {
        ...property,
        isFavorite: !!property.isFavorite,
      };
    },
    enabled: !!id,
  });

export const useProperty = (id: string) => useQuery(propertyQuery(id));

/* ======================
   TOGGLE FAVORITE
====================== */
export const useToggleFavorite = () =>
  useMutation({
    mutationFn: async ({
      propertyId,
      isFav,
    }: {
      propertyId: string;
      isFav: boolean;
    }) => {
      const res = await fetch(`/api/properties/${propertyId}/favorite`, {
        method: isFav ? "DELETE" : "POST",
      });

      if (!res.ok) throw new Error("Failed to toggle favorite");
      return res.json();
    },
    onSuccess: (_, { propertyId }) => {
      queryClient.invalidateQueries({
        queryKey: propertyKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: propertyKeys.detail(propertyId),
      });
    },
  });

/* ======================
   CREATE
// ====================== */

export const useCreateProperty = () => {
  const toggleFav = useToggleFavorite();

  return useMutation({
    mutationFn: async (data: PropertyForm & { fileIds: string[] }) => {
      const res = await fetch("/api/properties/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to create property");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: propertyKeys.all,
        exact: false,
      });

      // ensure backend favorite table is initialized
      toggleFav.mutate({
        propertyId: data.property._id, // ✅ Note: backend returns { property, files }
        isFav: false,
      });
    },
  });
};

/* ======================
   UPDATE
====================== */
export const useUpdateProperty = () =>
  useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & PropertyForm) => {
      const res = await fetch(`/api/properties/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to update property");
      return res.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: propertyKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: propertyKeys.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: ["property-images", id],
      });
    },
  });

/* ======================
   DELETE
====================== */
export const useDeleteProperty = () =>
  useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/properties/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete property");
      return res.json();
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: propertyKeys.all,
      });
      queryClient.removeQueries({
        queryKey: propertyKeys.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: ["property-images", id],
      });
    },
  });

// Fetch property images by propertyId
export const usePropertyImages = (propertyId: string | undefined) => {
  return useQuery({
    queryKey: ["property-images", propertyId],
    queryFn: async () => {
      if (!propertyId) return [];

      const res = await fetch(`/api/properties/${propertyId}/images`);
      if (!res.ok) throw new Error("Failed to fetch property images");
      const data = await res.json();
      return data.images || [];
    },
    enabled: !!propertyId,
  });
};