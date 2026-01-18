import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

type ChangePasswordPayload = {
    newPassword: string;
    currentPassword: string;
};

export function useChangePassword() {
    return useMutation({
        mutationFn: async ({ currentPassword, newPassword }: ChangePasswordPayload) => {
            try {
                await authClient.changePassword({ newPassword, currentPassword });
                return { success: true };
            } catch (err: any) {
                throw new Error(err?.message || "Failed to change password");
            }
        },
    });
}
