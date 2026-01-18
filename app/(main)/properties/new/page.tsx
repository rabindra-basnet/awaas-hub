"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { hasPermission, Permission, Role } from "@/lib/rbac";

import { useCreateProperty, PropertyForm } from "@/hooks/services/useProperties";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AccessDeniedPage from "@/components/access-denied";
import { getSession } from "@/lib/client/auth-client";


export default function NewPropertyPage() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState<number | "">("");
    const [location, setLocation] = useState("");
    const [images, setImages] = useState<string[]>([]);

    // ✅ RBAC: Check MANAGE_PROPERTIES
    useEffect(() => {
        const checkPermission = async () => {
            try {
                const { data: session } = await getSession();
                if (!session?.user) {
                    router.replace("/login");
                    return;
                }

                const role = session.user.role as Role;

                if (!hasPermission(role, Permission.MANAGE_PROPERTIES)) {
                    setIsAuthorized(false);
                    return;
                }

                setIsAuthorized(true);
            } catch (err) {
                console.error(err);
                router.replace("/login");
            }
        };

        checkPermission();
    }, [router]);

    const createMutation = useCreateProperty();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !price || !location) {
            toast.error("All fields are required");
            return;
        }

        const payload: PropertyForm = { title, price: Number(price), location, images };

        createMutation.mutate(payload, {
            onSuccess: (data) => {
                toast.success("Property created successfully!");
                router.push(`/properties/${data._id}`);
            },
            onError: (err: any) => {
                toast.error(err.message || "Failed to create property");
            },
        });
    };

    // ✅ Multi-image handler
    const handleImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files);

        const uploadedImages: string[] = [];
        for (const file of files) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            await new Promise<void>((resolve) => {
                reader.onload = () => {
                    if (typeof reader.result === "string") {
                        uploadedImages.push(reader.result);
                    }
                    resolve();
                };
            });
        }

        setImages(uploadedImages);
    };

    if (isAuthorized === null) {
        return <div className="min-h-screen flex items-center justify-center">Checking permissions...</div>;
    }

    if (isAuthorized === false) return <AccessDeniedPage />;

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold mb-6">Create New Property</h1>

            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label className="block mb-1 font-medium">Title</label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Property title" required />
                </div>

                <div>
                    <label className="block mb-1 font-medium">Price</label>
                    <Input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        placeholder="Price in USD"
                        required
                    />
                </div>

                <div>
                    <label className="block mb-1 font-medium">Location</label>
                    <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" required />
                </div>

                <div>
                    <label className="block mb-1 font-medium">Images</label>
                    <input type="file" multiple accept="image/*" onChange={handleImages} />
                    {images.length > 0 && (
                        <div className="mt-2 flex gap-2">
                            {images.map((img, idx) => (
                                <img key={idx} src={img} alt={`Preview ${idx + 1}`} className="w-24 h-24 object-cover rounded" />
                            ))}
                        </div>
                    )}
                </div>

                <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Creating..." : "Create Property"}
                </Button>
            </form>
        </div>
    );
}
