// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";

// import { hasPermission, Permission, Role } from "@/lib/rbac";
// import { Button } from "@/components/ui/button";
// import { getSession } from "@/lib/client/auth-client";
// import { useProperties, useToggleFavorite, useDeleteProperty } from "@/hooks/services/useProperties";
// import AccessDeniedPage from "@/components/access-denied";
// import { DataTable } from "./_components/table/data-table";
// import { createColumns } from "./_components/table/columns";

// export default function PropertiesTablePage() {
//     const router = useRouter();
//     const [canView, setCanView] = useState<boolean | null>(null);
//     const [canManage, setCanManage] = useState<boolean>(false);

//     // Check RBAC permissions
//     useEffect(() => {
//         const checkPermissions = async () => {
//             try {
//                 const { data: session } = await getSession();

//                 if (!session?.user) {
//                     router.replace("/login");
//                     return;
//                 }

//                 const role = session.user.role as Role;

//                 if (!hasPermission(role, Permission.VIEW_PROPERTIES)) {
//                     setCanView(false);
//                     return;
//                 }

//                 setCanView(true);
//                 setCanManage(hasPermission(role, Permission.MANAGE_PROPERTIES));
//             } catch (err) {
//                 console.error(err);
//                 router.replace("/login");
//             }
//         };

//         checkPermissions();
//     }, [router]);

//     // Fetch properties
//     const { data: properties = [], isLoading, error } = useProperties();
//     const toggleFav = useToggleFavorite();
//     const deleteProperty = useDeleteProperty();

//     const handleToggleFavorite = (propertyId: string, isFav: boolean) => {
//         toggleFav.mutate({ propertyId, isFav });
//     };

//     const handleDelete = (id: string) => {
//         deleteProperty.mutate(id);
//     };

//     const columns = createColumns({
//         canManage,
//         favorites: properties.filter((p: any) => p.isFavorite).map((p: any) => p._id),
//         onToggleFavorite: handleToggleFavorite,
//         onDelete: handleDelete,
//     });

//     if (canView === null) {
//         return (
//             <div className="min-h-screen flex items-center justify-center">
//                 Checking permissions...
//             </div>
//         );
//     }
//     if (canView === false) return <AccessDeniedPage />;
//     if (isLoading) {
//         return (
//             <div className="min-h-screen flex items-center justify-center">
//                 Loading properties...
//             </div>
//         );
//     }
//     if (error) {
//         return (
//             <div className="min-h-screen flex items-center justify-center text-red-500">
//                 Failed to load properties
//             </div>
//         );
//     }

//     return (
//         <div className="w-full max-w-7xl mx-auto py-6">
//             {/* <div className="flex items-right justify-end mb-6">
//                 {canManage && (
//                     <Link href="/properties/new">
//                         <Button>Create New Property</Button>
//                     </Link>
//                 )}
//             </div> */}

//             {/* Scrollable container */}
//             <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
//                 <DataTable columns={columns} data={properties} />
//             </div>
//         </div>
//     );

// }

"use client";

import Link from "next/link";

import { hasPermission, Permission, Role } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/client/auth-client";
import {
  useProperties,
  useToggleFavorite,
  useDeleteProperty,
} from "@/hooks/services/useProperties";
import AccessDeniedPage from "@/components/access-denied";
import { DataTable } from "./_components/table/data-table";
import { createColumns } from "./_components/table/columns";
import { useRolePermissions } from "@/hooks/use-role-permissions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PropertiesTablePage() {
  const router = useRouter();
  const [canView, setCanView] = useState<boolean | null>(null);
  const [canManage, setCanManage] = useState(false);

  useEffect(() => {
    const checkPermissions = async () => {
      const { data: session } = await getSession();

      if (!session?.user) {
        router.replace("/login");
        return;
      }

      const role = session.user.role as Role;

      if (!hasPermission(role, Permission.VIEW_PROPERTIES)) {
        setCanView(false);
        return;
      }

      setCanView(true);
      setCanManage(hasPermission(role, Permission.MANAGE_PROPERTIES));
    };

    checkPermissions();
  }, [router]);

  const { data: properties = [], isLoading, error } = useProperties();
  const toggleFav = useToggleFavorite();
  const deleteProperty = useDeleteProperty();

  const columns = createColumns({
    canManage,
    favorites: properties
      .filter((p: any) => p.isFavorite)
      .map((p: any) => p._id),
    onToggleFavorite: (id, isFav) =>
      toggleFav.mutate({ propertyId: id, isFav }),
    onDelete: (id) => deleteProperty.mutate(id),
  });

  if (canView === null) return null;
  if (canView === false) return <AccessDeniedPage />;
  if (isLoading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Failed to load</div>;

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-5">
      <DataTable columns={columns} data={properties} canManage={canManage} />
    </div>
  );
}
