// app/properties/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { hasPermission, Permission, Role } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/client/auth-client";
import { useProperties } from "@/hooks/services/useProperties";
import { useFavorites, useToggleFavorite } from "@/hooks/services/useFavourite";
import AccessDeniedPage from "@/components/access-denied";
import { DataTable } from "./_components/table/data-table";
import { createColumns } from "./_components/table/columns";

export default function PropertiesTablePage() {
    const router = useRouter();
    const [canView, setCanView] = useState<boolean | null>(null);
    const [canManage, setCanManage] = useState<boolean>(false);

    // Check RBAC permissions
    useEffect(() => {
        const checkPermissions = async () => {
            try {
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
            } catch (err) {
                console.error(err);
                router.replace("/login");
            }
        };

        checkPermissions();
    }, [router]);

    // Fetch properties & favorites
    const { data: properties = [], isLoading, error } = useProperties();
    const { data: favorites = [] } = useFavorites();
    const toggleFav = useToggleFavorite();

    const handleToggleFavorite = (propertyId: string, isFav: boolean) => {
        toggleFav.mutate({ propertyId, isFav });
    };

    const handleDelete = (id: string) => {
        // Implement delete mutation
        console.log("Delete property:", id);
    };

    const columns = createColumns({
        canManage,
        favorites,
        onToggleFavorite: handleToggleFavorite,
        onDelete: handleDelete,
    });

    if (canView === null) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Checking permissions...
            </div>
        );
    }
    if (canView === false) return <AccessDeniedPage />;
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Loading properties...
            </div>
        );
    }
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-500">
                Failed to load properties
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto py-12 px-4">
            <div className="flex items-right justify-end mb-6">
                {canManage && (
                    <Link href="/properties/new">
                        <Button>Create New Property</Button>
                    </Link>
                )}
            </div>

            <DataTable columns={columns} data={properties} />
        </div>
    );
}