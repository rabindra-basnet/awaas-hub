"use client";

import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiError } from "@/shared/lib/error";
import { useState } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { toast } from "sonner";
import { MoreHorizontal, Search, UserCog, ShieldBan, Trash2, RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

function useAdminUsers(search: string) {
  return useSuspenseQuery({
    queryKey: ["admin-users", search],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "50" });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw await apiError(res);
      return res.json();
    },
  });
}

export default function AdminUsersContent() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const qc = useQueryClient();

  const { data } = useAdminUsers(query);
  const users: any[] = data?.users ?? [];

  const setRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      fetch(`/api/admin/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const banUser = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/admin/users/${id}/ban`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ banReason: "Banned by admin" }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) => fetch(`/api/admin/users/${id}/delete`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const resetPwd = useMutation({
    mutationFn: (id: string) => fetch(`/api/admin/users/${id}/reset-password`, { method: "POST" }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">{users.length} users found</p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setQuery(search)}
            className="w-56"
          />
          <Button variant="outline" size="icon" onClick={() => setQuery(search)}>
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">User</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Role</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u: any) => (
              <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="font-medium truncate max-w-48">{u.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                </td>
                <td className="px-5 py-3.5">
                  <Badge variant={u.role === "admin" ? "default" : "secondary"} className="text-[10px]">
                    {u.role}
                  </Badge>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${u.banned ? "bg-red-100 text-red-700 dark:bg-red-900/40" : "bg-green-100 text-green-700 dark:bg-green-900/40"}`}>
                    {u.banned ? "Banned" : "Active"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<button className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-accent transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring" />}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          setRole.mutate({ id: u.id, role: u.role === "admin" ? "user" : "admin" }, {
                            onSuccess: () => toast.success(`Role updated to ${u.role === "admin" ? "user" : "admin"}`),
                            onError: () => toast.error("Failed to update role"),
                          })
                        }
                      >
                        <UserCog className="w-4 h-4 mr-2" />
                        {u.role === "admin" ? "Make User" : "Make Admin"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          resetPwd.mutate(u.id, {
                            onSuccess: () => toast.success("Password reset email sent"),
                            onError: () => toast.error("Failed to send email"),
                          })
                        }
                      >
                        <RefreshCw className="w-4 h-4 mr-2" /> Reset Password
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() =>
                          banUser.mutate(u.id, {
                            onSuccess: () => toast.success("User banned"),
                            onError: () => toast.error("Failed to ban user"),
                          })
                        }
                      >
                        <ShieldBan className="w-4 h-4 mr-2" /> Ban User
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() =>
                          deleteUser.mutate(u.id, {
                            onSuccess: () => toast.success("User deleted"),
                            onError: () => toast.error("Failed to delete user"),
                          })
                        }
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
