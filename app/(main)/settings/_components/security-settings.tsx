"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { authClient } from "@/lib/client/auth-client";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";

export default function SecuritySettings() {
    const [open, setOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const validatePassword = (value: string) => {
        if (value.length < 8) return "Password must be at least 8 characters long";
        if (!/[A-Z]/.test(value)) return "Password must contain at least one uppercase letter";
        if (!/[0-9]/.test(value)) return "Password must contain at least one number";
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("All fields are required");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        const error = validatePassword(newPassword);
        if (error) {
            toast.error(error);
            return;
        }

        try {
            setIsLoading(true);

            await authClient.changePassword({
                currentPassword,
                newPassword,
                revokeOtherSessions: true,
            });

            toast.success("Password updated successfully");

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setOpen(false); // Close dialog
        } catch (err: any) {
            toast.error(err?.message || "Failed to update password");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="rounded-lg border bg-card p-6 space-y-6">
            <h2 className="text-lg font-medium">Security</h2>

            {/* Trigger button for the dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline">Change Password</Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>
                            Update your password to keep your account secure.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="grid gap-4 mt-2">
                        <div className="space-y-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input
                                id="current-password"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="••••••••"
                                disabled={isLoading}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input
                                id="new-password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="••••••••"
                                disabled={isLoading}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                disabled={isLoading}
                                required
                            />
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Updating…" : "Save Password"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </section>
    );
}
