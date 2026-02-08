"use client";

import { useSession } from "@/lib/client/auth-client";
import { hasPermission, Permission, Role } from "@/lib/rbac";
import { Heart, Pencil, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { useRouter } from "next/navigation";
import DeletePropertyDialog from "../_components/delete-property";
import {
  useDeleteProperty,
  useProperty,
  useToggleFavorite,
  usePropertyImages, // ✅ Changed import
} from "@/lib/client/queries/properties.queries";

export default function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  
  const { data: session } = useSession();
  const { data: property, isLoading, error } = useProperty(id);
  const { data: images, isLoading: loadingImages } = usePropertyImages(id);

  const toggleFav = useToggleFavorite();
  const deleteProperty = useDeleteProperty();

  // ✅ Fetch images by propertyId

  const role = session?.user?.role as Role;
  const isOwner = property?.sellerId === session?.user?.id;
  const canManage =
    hasPermission(role, Permission.MANAGE_PROPERTIES) &&
    (role === Role.ADMIN || isOwner);

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (error || !property) return <div>Error loading property</div>;

  const { title, location, price, status, description, isFavorite } = property;
  const displayPrice = price ? `$${Number(price).toLocaleString()}` : "N/A";

  // ✅ Use fetched images with presigned URLs
  const propertyImages =
    images && images.length > 0
      ? images.map((img: any) => img.url)
      : ["/images/placeholder.png"];

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <button
        onClick={() => router.push("/properties")}
        className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{title}</h1>

        <div className="flex items-center gap-4">
          <button
            onClick={() =>
              toggleFav.mutate({ propertyId: id, isFav: !!isFavorite })
            }
            className="p-2 rounded hover:bg-gray-100"
          >
            <Heart
              size={24}
              className={
                isFavorite ? "text-red-500 fill-current" : "text-gray-400"
              }
            />
          </button>

          {canManage && (
            <div className="flex gap-4">
              <Link
                href={`/properties/${id}/edit`}
                className="text-amber-600 hover:text-amber-800"
              >
                <Pencil size={20} />
              </Link>
              <DeletePropertyDialog
                propertyId={id}
                onDelete={(id) => deleteProperty.mutate(id)}
                isDeleting={deleteProperty.isPending}
              />
            </div>
          )}
        </div>
      </div>

      <p className="mb-2">Location: {location || "Unknown"}</p>
      <p className="mb-2">Price: {displayPrice}</p>
      <p className="mb-4">Description: {description || "No description"}</p>

      <p className="mb-6">
        Status:{" "}
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${statusClass(status)}`}
        >
          {status || "Unknown"}
        </span>
      </p>

      {/* ✅ Show loading state for images */}
      {loadingImages ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-full h-56 bg-gray-200 animate-pulse rounded-lg"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {propertyImages.map((img: string, idx: number) => (
            <img
              key={idx}
              src={img}
              alt={`${title} - ${idx + 1}`}
              className="w-full h-56 object-cover rounded-lg shadow-sm"
            />
          ))}
        </div>
      )}
    </div>
  );
}

function statusClass(status: string) {
  const classes: Record<string, string> = {
    available: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    sold: "bg-red-100 text-red-800",
  };
  return classes[status?.toLowerCase()] || "bg-gray-100 text-gray-800";
}
