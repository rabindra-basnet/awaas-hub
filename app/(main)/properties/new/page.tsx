"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCreateProperty } from "@/hooks/services/useProperties";
import { hasPermission, Permission, Role } from "@/lib/rbac";
import { getSession } from "@/lib/client/auth-client";
import { useEffect, useState } from "react";
import AccessDeniedPage from "@/components/access-denied";
import PropertyForm from "../_components/property-form";

export default function NewPropertyPage() {
    const router = useRouter();
    const create = useCreateProperty();
    const [authorized, setAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        getSession().then(({ data: session }) => {
            if (!session?.user || !hasPermission(session?.user.role as Role, Permission.MANAGE_PROPERTIES)) {
                setAuthorized(false);
                router.replace(!session?.user ? "/login" : "/properties");
            } else {
                setAuthorized(true);
            }
        });
    }, [router]);

    if (authorized === null) return <div className="min-h-screen flex items-center justify-center">Checking...</div>;
    if (authorized === false) return <AccessDeniedPage />;

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold mb-8">Create New Property</h1>
            <PropertyForm
                onSubmit={(values) => create.mutate(values, {
                    onSuccess: (data) => {
                        toast.success("Property created");
                        router.push(`/properties/${data._id}`);
                    },
                    onError: () => toast.error("Failed to create property")
                })}
                isSubmitting={create.isPending}
                buttonText="Create Property"
            />
        </div>
    );
}