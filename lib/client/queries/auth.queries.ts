import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/client/auth-client";
import { toast } from "sonner";

/* ======================
   Types
====================== */
export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

/* ======================
   MUTATION
====================== */
export const useChangePasswordMutation = () =>
  useMutation({
    mutationFn: async ({
      currentPassword,
      newPassword,
    }: ChangePasswordPayload) => {
      try {
        await authClient.changePassword({
          currentPassword,
          newPassword,
        });

        return { success: true };
      } catch (err: any) {
        throw new Error(err?.message || "Failed to change password");
      }
    },
    onSuccess: () => {
      toast.success("Password changed successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to change password");
    },
  });

/* ======================
   Types
====================== */
export type ResetPasswordPayload = {
  token: string;
  newPassword: string;
};

/* ======================
   MUTATION
====================== */
export const useResetPasswordMutation = () =>
  useMutation({
    mutationFn: async ({ token, newPassword }: ResetPasswordPayload) => {
      try {
        await authClient.resetPassword({
          token,
          newPassword,
        });

        return { success: true };
      } catch (err: any) {
        throw new Error(err?.message || "Failed to reset password");
      }
    },
    onSuccess: () => {
      toast.success("Password reset successful. You can now log in.");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to reset password");
    },
  });
