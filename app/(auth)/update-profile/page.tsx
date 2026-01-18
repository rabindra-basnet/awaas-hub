"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { useSession } from "@/lib/client/auth-client";
import { useUpdateRole } from "@/hooks/services/useUpdateRole";

export default function AuthGateWithRoleSetup() {
    const router = useRouter();
    const { data: session, isPending } = useSession();
    const mutation = useUpdateRole();

    const [role, setRole] = useState("");

    // Redirect logic
    useEffect(() => {
        if (isPending) return;

        if (!session) {
            router.replace("/login");
            return;
        }

        if (session.user?.role) {
            router.replace("/dashboard");
        }
    }, [session, isPending, router]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!role) {
            toast.error("Please select a role");
            return;
        }

        if (!session?.user?.id) {
            toast.error("User not found");
            return;
        }

        mutation.mutate(
            { userId: session.user.id, role },
            {
                onSuccess: () => {
                    toast.success("Role updated successfully!");
                    router.replace("/dashboard");
                },
                onError: (err: any) => {
                    toast.error(err.message || "Failed to update role");
                },
            }
        );
    };

    // Loading state (session check or mutation)
    if (isPending || mutation.isPending) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                    Finishing sign in…
                </p>
            </div>
        );
    }

    // If user has role, they will be redirected (avoid flash)
    if (session?.user?.role) return null;

    // Role selection UI
    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md space-y-6 rounded-xl border bg-card p-6 shadow-md"
            >
                <h2 className="text-2xl font-bold text-center">
                    Select Your Role
                </h2>
                <p className="text-center text-muted-foreground">
                    Choose your account type
                </p>

                <div className="space-y-2">
                    <Label>Role</Label>
                    <Select value={role} onValueChange={setRole}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="buyer">Buyer</SelectItem>
                            <SelectItem value="seller">Seller</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Button type="submit" className="w-full">
                    Submit
                </Button>
            </form>
        </div>
    );
}
