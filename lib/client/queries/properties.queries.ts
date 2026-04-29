import { queryOptions, useQuery, useMutation } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { FeaturedProperty } from "@/app/(home)/__components/featured-properties";

/* ======================
   Types
====================== */
export type PropertyForm = {
  // Core
  title: string;
  price: number;
  location: string;
  status?: "available" | "booked" | "sold";
  description?: string;
  images?: string[];

  // Property details
  category: string;
  area?: string;
  bedrooms?: number;
  bathrooms?: number;
  face?: string;
  roadType?: string;
  roadAccess?: string;
  negotiable?: boolean;

  // Location details
  municipality?: string;
  wardNo?: string;
  ringRoad?: string;

  // Nearby facilities
  nearHospital?: string;
  nearAirport?: string;
  nearSupermarket?: string;
  nearSchool?: string;
  nearGym?: string;
  nearTransport?: string;
  nearAtm?: string;
  nearRestaurant?: string;
};

/* ======================
   Query Keys
====================== */
export const propertyKeys = {
  all: ["properties"] as const,
  list: (userId?: string) => ["properties", userId] as const,
  detail: (id: string) => ["property", id] as const,
  images: (id: string) => ["property-images", id] as const,
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
      return properties.map((p: any) => ({ ...p, isFavorite: !!p.isFavorite }));
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
      return { ...property, isFavorite: !!property.isFavorite };
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
    onMutate: async ({ propertyId, isFav }) => {
      await getQueryClient().cancelQueries({ queryKey: propertyKeys.all });
      const snapshot = getQueryClient().getQueriesData({ queryKey: propertyKeys.all });
      getQueryClient().setQueriesData(
        { queryKey: propertyKeys.all },
        (old: any[] | undefined) =>
          old?.map((p) =>
            p._id === propertyId ? { ...p, isFavorite: !isFav } : p,
          ) ?? old,
      );
      return { snapshot };
    },
    onError: (_err, _vars, context) => {
      if (context?.snapshot) {
        for (const [key, data] of context.snapshot) {
          getQueryClient().setQueryData(key, data);
        }
      }
    },
    onSettled: (_, __, { propertyId }) => {
      getQueryClient().invalidateQueries({ queryKey: propertyKeys.all });
      getQueryClient().invalidateQueries({
        queryKey: propertyKeys.detail(propertyId),
      });
    },
  });

/* ======================
   CREATE
====================== */
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
      getQueryClient().invalidateQueries({
        queryKey: propertyKeys.all,
        exact: false,
      });
      // initialise favorite record on backend
      toggleFav.mutate({ propertyId: data.property._id, isFav: false });
    },
  });
};

/* ======================
   UPDATE
====================== */
export const useUpdateProperty = () =>
  useMutation({
    mutationFn: async ({
      id,
      ...data
    }: { id: string } & PropertyForm & {
        fileIds?: string[];
        deletedFileIds?: string[];
      }) => {
      const res = await fetch(`/api/properties/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update property");
      return res.json();
    },
    onSuccess: (_, { id }) => {
      getQueryClient().invalidateQueries({ queryKey: propertyKeys.all });
      getQueryClient().invalidateQueries({ queryKey: propertyKeys.detail(id) });
      getQueryClient().invalidateQueries({ queryKey: propertyKeys.images(id) });
    },
  });

/* ======================
   DELETE
====================== */
export const useDeleteProperty = () =>
  useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/properties/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete property");
      return res.json();
    },
    onSuccess: (_, id) => {
      getQueryClient().invalidateQueries({ queryKey: propertyKeys.all });
      getQueryClient().removeQueries({ queryKey: propertyKeys.detail(id) });
      getQueryClient().invalidateQueries({ queryKey: propertyKeys.images(id) });
    },
  });

/* ======================
   IMAGES
====================== */
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

// const { data: featuredProperties = [] } = useQuery<FeaturedProperty[]>({
//   queryKey: ["featured-properties"],
//   queryFn: async () => {
//     const response = await fetch("/api/properties/featured", {
//       method: "GET",
//       cache: "no-store",
//     });

//     if (!response.ok) {
//       throw new Error("Failed to fetch featured properties");
//     }

//     return response.json();
//   },
// });
