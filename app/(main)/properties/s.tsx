"use client";

import { hasPermission, Permission, Role } from "@/lib/rbac";
import { getSession } from "@/lib/client/auth-client";
import AccessDeniedPage from "@/components/access-denied";
import { DataTable } from "./_components/table/data-table";
import { createColumns } from "./_components/table/columns";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loading from "@/components/loading";
import {
  useDeleteProperty,
  useProperties,
  useToggleFavorite,
} from "@/lib/client/queries/properties.queries";

function usePermissionCheck() {
  const router = useRouter();
  const [permissions, setPermissions] = useState<{
    canView: boolean | null;
    canManage: boolean;
  }>({ canView: null, canManage: false });

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const { data: session } = await getSession();

        if (!session?.user) {
          router.replace("/login");
          return;
        }

        const role = session.user.role as Role;
        const canView = hasPermission(role, Permission.VIEW_PROPERTIES);
        const canManage = hasPermission(role, Permission.MANAGE_PROPERTIES);

        setPermissions({ canView, canManage });
      } catch (error) {
        console.error("Permission check failed:", error);
        setPermissions({ canView: false, canManage: false });
      }
    };

    checkPermissions();
  }, [router]);

  return permissions;
}
function PropertiesContent({ canManage }: { canManage: boolean }) {
  const { data: properties = [], isLoading, error } = useProperties();
  const toggleFav = useToggleFavorite();
  const deleteProperty = useDeleteProperty();

  const favoriteIds = properties
    .filter((p: any) => p.isFavorite)
    .map((p: any) => p._id);

  const columns = createColumns({
    canManage,
    favorites: favoriteIds,
    onToggleFavorite: (id, isFav) =>
      toggleFav.mutate({ propertyId: id, isFav }),
    onDelete: (id) => deleteProperty.mutate(id),
  });

  if (isLoading) return <Loading />;

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 font-medium">Failed to load properties</p>
        <p className="text-sm text-gray-600 mt-2">
          Please try refreshing the page
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-5">
      <DataTable columns={columns} data={properties} canManage={canManage} />
    </div>
  );
}

// Main page component
export default function PropertiesTablePage() {
  const { canView, canManage } = usePermissionCheck();

  // Still checking permissions
  if (canView === null) {
    return <Loading />;
  }

  // Access denied
  if (!canView) {
    return <AccessDeniedPage />;
  }

  // Authorized - show content
  return <PropertiesContent canManage={canManage} />;
}
