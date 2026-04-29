import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "buyer" | "seller";
  banned: boolean;
  banReason: string | null;
  banExpires: string | null;
  emailVerified: boolean;
  createdAt: string;
  image: string | null;
}

// ── Fetch all users ───────────────────────────────────────────────────────────

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: async (): Promise<{ users: AdminUser[] }> => {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to load users");
      return res.json();
    },
    staleTime: 30_000,
  });
}

// ── Change role ───────────────────────────────────────────────────────────────

export function useChangeRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to change role");
      }
      return res.json();
    },
    onSuccess: (_, { role }) => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(`Role changed to ${role}`);
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ── Ban user ──────────────────────────────────────────────────────────────────

export function useBanUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason?: string }) => {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to ban user");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User banned");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ── Unban user ────────────────────────────────────────────────────────────────

export function useUnbanUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/admin/users/${userId}/unban`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to unban user");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User unbanned");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ── Delete user ───────────────────────────────────────────────────────────────

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/admin/users/${userId}/delete`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to delete user");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ── Reset password ────────────────────────────────────────────────────────────

export function useResetPassword() {
  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to send reset email");
      }
      return res.json() as Promise<{ email: string }>;
    },
    onSuccess: (data) => {
      toast.success(`Password reset email sent to ${data.email}`);
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
