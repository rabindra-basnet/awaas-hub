"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  type AdminUser,
  useAdminUsers,
  useChangeRole,
  useDeleteUser,
  useResetPassword,
} from "@/lib/client/queries/users.queries";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Filter,
  KeyRound,
  Loader2,
  MoreHorizontal,
  RefreshCw,
  Search,
  Trash2,
  UserCog,
  Users,
  XCircle,
} from "lucide-react";

/* ---------------- TYPES ---------------- */

type ActiveDialog =
  | { type: "role"; user: AdminUser }
  | { type: "reset"; user: AdminUser }
  | { type: "delete"; user: AdminUser }
  | null;

/* ---------------- PAGE ---------------- */

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "buyer" | "seller">("all");
  const [dialog, setDialog] = useState<ActiveDialog>(null);

  const { data, isLoading, refetch, isRefetching } = useAdminUsers();

  /* FIX: normalize _id → id so API works */
  const users: any[] =
    data?.users?.map((u: any) => ({
      ...u,
      id: u._id,
    })) ?? [];

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === "all" || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">

      {/* STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Users", value: users.length, color: "text-primary" },
          {
            label: "Buyers",
            value: users.filter((u) => u.role === "buyer").length,
            color: "text-blue-600",
          },
          {
            label: "Sellers",
            value: users.filter((u) => u.role === "seller").length,
            color: "text-violet-600",
          },
          {
            label: "Banned",
            value: users.filter((u) => u.banned).length,
            color: "text-destructive",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-xl border bg-card px-4 py-3"
          >
            <p className={cn("text-2xl font-bold", color)}>{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* SEARCH */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="pl-8"
          />
        </div>

        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as any)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="buyer">Buyer</SelectItem>
            <SelectItem value="seller">Seller</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon" onClick={() => refetch()}>
          <RefreshCw className={cn(isRefetching && "animate-spin")} />
        </Button>
      </div>

      {/* TABLE */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        {isLoading ? (
          <div className="p-10 flex justify-center items-center gap-2">
            <Loader2 className="animate-spin" />
            Loading...
          </div>
        ) : (
          <div className="overflow-auto max-h-[520px]">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-4 py-3">User</th>
                  <th className="text-left px-4 py-3">Role</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Joined</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>

              <tbody>
                {filtered.map((user) => (
                  <UserRow key={user.id} user={user} setDialog={setDialog} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <pre>{JSON.stringify(dialog, null, 2)}</pre>

      {/* DIALOGS */}
      <ChangeRoleDialog
        open={dialog?.type === "role"}
        user={dialog?.type === "role" ? dialog.user : null}
        onClose={() => setDialog(null)}
      />

      <ConfirmDialog
        open={dialog?.type === "delete"}
        title="Delete User"
        description={`Delete ${dialog?.user?.name}?`}
        confirmLabel="Delete"
        confirmVariant="destructive"
        user={dialog?.type === "delete" ? dialog.user : null}
        onClose={() => setDialog(null)}
        action="delete"
      />

      <ConfirmDialog
        open={dialog?.type === "reset"}
        title="Reset Password"
        description={`Reset password for ${dialog?.user?.name}?`}
        confirmLabel="Reset"
        confirmVariant="default"
        user={dialog?.type === "reset" ? dialog.user : null}
        onClose={() => setDialog(null)}
        action="reset"
      />
    </div>
  );
}

/* ---------------- ROW ---------------- */

function UserRow({
  user,
  setDialog,
}: {
  user: any;
  setDialog: (d: ActiveDialog) => void;
}) {
  const initials = user.name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <tr className="border-t hover:bg-muted/30">
      <td className="px-4 py-3 flex gap-3 items-center">
        <Avatar>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        <div>
          <div className="font-medium">{user.name}</div>
          <div className="text-xs text-muted-foreground">{user.email}</div>
        </div>
      </td>

      <td className="px-4 py-3">{user.role}</td>

      <td className="px-4 py-3">
        {user.banned ? (
          <span className="text-red-500 flex items-center gap-1">
            <XCircle className="w-4 h-4" /> Banned
          </span>
        ) : (
          <span className="text-green-500 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Active
          </span>
        )}
      </td>

      <td className="px-4 py-3">
        {format(new Date(user.createdAt), "MMM d, yyyy")}
      </td>

      <td className="px-4 py-3 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setDialog({ type: "role", user });
              }}
            >
              <UserCog className="w-4 h-4 mr-2" />
              Change Role
            </DropdownMenuItem>

            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setDialog({ type: "reset", user });
              }}
            >
              <KeyRound className="w-4 h-4 mr-2" />
              Reset Password
            </DropdownMenuItem>

            <DropdownMenuItem
              className="text-red-500"
              onSelect={(e) => {
                e.preventDefault();
                setDialog({ type: "delete", user });
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}

/* ---------------- CHANGE ROLE ---------------- */

function ChangeRoleDialog({ open, user, onClose }: any) {
  const changeRole = useChangeRole();
  const [role, setRole] = useState("buyer");

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Role</DialogTitle>
          <DialogDescription>{user?.name}</DialogDescription>
        </DialogHeader>

        <Select value={role} onValueChange={setRole}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="buyer">Buyer</SelectItem>
            <SelectItem value="seller">Seller</SelectItem>
          </SelectContent>
        </Select>

        <DialogFooter>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            onClick={async () => {
              await changeRole.mutateAsync({
                userId: user.id, // ✅ FIXED
                role,
              });
              onClose();
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- CONFIRM ---------------- */

function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  confirmVariant,
  user,
  onClose,
  action,
}: any) {
  const reset = useResetPassword();
  const del = useDeleteUser();

  const handle = async () => {
    if (!user?.id) return;

    if (action === "reset") {
      await reset.mutateAsync(user.id);
    } else {
      await del.mutateAsync(user.id);
    }

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant={confirmVariant} onClick={handle}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}