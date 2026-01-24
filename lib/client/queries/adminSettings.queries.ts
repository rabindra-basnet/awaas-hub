import { queryClient } from "@/lib/client/query-client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

// Fetch all users
export function useAdminUsers() {
  return useQuery<User[], Error>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await fetch("/api/auth/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });
}

// Create new user
export function useCreateUser() {
  return useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      role: string;
      password: string;
    }) => {
      const res = await fetch("/api/auth/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create user");
      return res.json();
    },
    onSuccess: () => {
      toast.success("User created");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err: any) => toast.error(err.message),
  });
}

// Update existing user
export function useUpdateUser() {
  return useMutation({
    mutationFn: async (data: {
      id: string;
      name?: string;
      email?: string;
      role?: string;
    }) => {
      const res = await fetch(`/api/auth/users/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update user");
      return res.json();
    },
    onSuccess: () => {
      toast.success("User updated");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err: any) => toast.error(err.message),
  });
}

// Delete user
export function useDeleteUser() {
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/auth/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete user");
      return res.json();
    },
    onSuccess: () => {
      toast.success("User deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err: any) => toast.error(err.message),
  });
}
