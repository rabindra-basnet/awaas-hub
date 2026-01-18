"use client";

import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function AccessDeniedPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background px-6">
            <div className="max-w-md w-full text-center space-y-6">
                {/* Icon */}
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                    <ShieldAlert className="h-7 w-7 text-destructive" />
                </div>

                {/* Text */}
                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Access Denied
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        You don't have permission to view this page.
                        If you believe this is a mistake, please contact an administrator.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex justify-center gap-3">
                    <Button variant="outline" onClick={() => router.back()}>
                        Go Back
                    </Button>
                    <Button onClick={() => router.replace("/dashboard")}>
                        Go to Dashboard
                    </Button>
                </div>
            </div>
        </div>
    );
}
