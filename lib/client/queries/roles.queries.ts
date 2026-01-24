import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/client/query-client";
import { toast } from "sonner";

/* ======================
   Types
====================== */
export type UpdateRolePayload = {
  userId: string;
  role: string;
};

/* ======================
   MUTATION
====================== */
export const useUpdateRoleMutation = () =>
  useMutation({
    mutationFn: async (data: UpdateRolePayload) => {
      const res = await fetch("/api/auth/update-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update role");
      }

      return res.json();
    },
    onSuccess: () => {
      // keep admin/user lists in sync if present
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User role updated successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update role");
    },
  });
