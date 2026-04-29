"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  useAdminUsers,
  useChangeRole,
  useBanUser,
  useUnbanUser,
  useResetPassword,
  type AdminUser,
} from "@/lib/client/queries/users.queries";
import { authClient } from "@/lib/client/auth-client";
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
  Search,
  MoreHorizontal,
  ShieldBan,
  ShieldCheck,
  KeyRound,
  UserCog,
  Loader2,
  Users,
  LogIn,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Filter,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type ActiveDialog =
  | { type: "role"; user: AdminUser }
  | { type: "ban"; user: AdminUser }
  | { type: "unban"; user: AdminUser }
  | { type: "reset"; user: AdminUser }
  | { type: "impersonate"; user: AdminUser }
  | null;

// ── AdminSettings ─────────────────────────────────────────────────────────────

export default function AdminSettings() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "buyer" | "seller">("all");
  const [dialog, setDialog] = useState<ActiveDialog>(null);
  const router = useRouter();

  const { data, isLoading, refetch, isRefetching } = useAdminUsers();
  const users = data?.users ?? [];

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <section className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      {/* Section header */}
      <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            User Management
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {users.length} user{users.length !== 1 ? "s" : ""}
            {users.filter((u) => u.banned).length > 0 && (
              <span className="ml-2 text-destructive font-medium">
                · {users.filter((u) => u.banned).length} banned
              </span>
            )}
          </p>
        </div>

        {/* Stats pills */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-[11px] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full font-medium">
            {users.filter((u) => u.role === "buyer").length} buyers
          </span>
          <span className="text-[11px] bg-violet-500/10 text-violet-600 dark:text-violet-400 px-2.5 py-1 rounded-full font-medium">
            {users.filter((u) => u.role === "seller").length} sellers
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40 bg-muted/20">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="pl-8 h-8 text-sm bg-background border-border/60 focus-visible:ring-primary/30"
          />
        </div>
        <Select
          value={roleFilter}
          onValueChange={(v) => setRoleFilter(v as typeof roleFilter)}
        >
          <SelectTrigger className="w-32 h-8 text-xs gap-1.5">
            <Filter className="h-3 w-3 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="buyer">Buyer</SelectItem>
            <SelectItem value="seller">Seller</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isRefetching && "animate-spin")} />
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading users…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
          <Users className="h-7 w-7 opacity-20" />
          <p className="text-sm">{search ? "No users match your search." : "No users yet."}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-muted/10">
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  User
                </th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Role
                </th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                  Status
                </th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                  Joined
                </th>
                <th className="px-4 py-2.5 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filtered.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onAction={(type) => setDialog({ type, user } as ActiveDialog)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="px-4 py-2.5 border-t border-border/40 bg-muted/10">
          <p className="text-[11px] text-muted-foreground">
            Showing {filtered.length} of {users.length} users
          </p>
        </div>
      )}

      {/* Dialogs */}
      <ChangeRoleDialog
        open={dialog?.type === "role"}
        user={dialog?.type === "role" ? dialog.user : null}
        onClose={() => setDialog(null)}
      />
      <BanDialog
        open={dialog?.type === "ban"}
        user={dialog?.type === "ban" ? dialog.user : null}
        onClose={() => setDialog(null)}
      />
      <ConfirmDialog
        open={dialog?.type === "unban"}
        title="Unban this user?"
        description={`${dialog?.type === "unban" ? dialog.user.name : ""} will regain full platform access.`}
        confirmLabel="Unban"
        confirmVariant="default"
        userId={dialog?.type === "unban" ? dialog.user.id : null}
        onClose={() => setDialog(null)}
        action="unban"
      />
      <ConfirmDialog
        open={dialog?.type === "reset"}
        title="Send password reset?"
        description={`A reset link will be sent to ${dialog?.type === "reset" ? dialog.user.email : ""}.`}
        confirmLabel="Send Email"
        confirmVariant="default"
        userId={dialog?.type === "reset" ? dialog.user.id : null}
        onClose={() => setDialog(null)}
        action="reset"
      />
      <ImpersonateDialog
        open={dialog?.type === "impersonate"}
        user={dialog?.type === "impersonate" ? dialog.user : null}
        onClose={() => setDialog(null)}
        onConfirm={async (userId) => {
          await authClient.admin.impersonateUser({ userId });
          router.push("/dashboard");
        }}
      />
    </section>
  );
}

// ── User row ──────────────────────────────────────────────────────────────────

function UserRow({
  user,
  onAction,
}: {
  user: AdminUser;
  onAction: (type: "role" | "ban" | "unban" | "reset" | "impersonate") => void;
}) {
  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <tr className={cn("hover:bg-muted/30 transition-colors", user.banned && "opacity-70")}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Avatar className="w-7 h-7 shrink-0">
            <AvatarFallback
              className={cn(
                "text-[10px] font-bold",
                user.banned
                  ? "bg-destructive/10 text-destructive"
                  : "bg-primary/10 text-primary",
              )}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-semibold text-[13px] truncate leading-tight">{user.name}</p>
            <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
      </td>

      <td className="px-4 py-3">
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] font-medium h-5",
            user.role === "seller"
              ? "text-violet-600 border-violet-200 dark:text-violet-400"
              : "text-blue-600 border-blue-200 dark:text-blue-400",
          )}
        >
          {user.role}
        </Badge>
      </td>

      <td className="px-4 py-3 hidden sm:table-cell">
        {user.banned ? (
          <span className="flex items-center gap-1 text-[11px] font-medium text-destructive">
            <XCircle className="h-3 w-3" /> Banned
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" /> Active
          </span>
        )}
      </td>

      <td className="px-4 py-3 hidden lg:table-cell">
        <span className="text-[11px] text-muted-foreground">
          {format(new Date(user.createdAt), "MMM d, yyyy")}
        </span>
      </td>

      <td className="px-4 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-46">
            <DropdownMenuLabel className="text-[11px] text-muted-foreground font-normal py-1">
              {user.name}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 cursor-pointer text-[13px]" onClick={() => onAction("role")}>
              <UserCog className="h-3.5 w-3.5" /> Change Role
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer text-[13px]" onClick={() => onAction("reset")}>
              <KeyRound className="h-3.5 w-3.5" /> Reset Password
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer text-[13px]" onClick={() => onAction("impersonate")}>
              <LogIn className="h-3.5 w-3.5" /> Impersonate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {user.banned ? (
              <DropdownMenuItem
                className="gap-2 cursor-pointer text-[13px] text-emerald-600 focus:text-emerald-600"
                onClick={() => onAction("unban")}
              >
                <ShieldCheck className="h-3.5 w-3.5" /> Unban User
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                className="gap-2 cursor-pointer text-[13px] text-destructive focus:text-destructive"
                onClick={() => onAction("ban")}
              >
                <ShieldBan className="h-3.5 w-3.5" /> Ban User
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}

// ── Change role dialog ────────────────────────────────────────────────────────

function ChangeRoleDialog({
  open,
  user,
  onClose,
}: {
  open: boolean;
  user: AdminUser | null;
  onClose: () => void;
}) {
  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  const changeRole = useChangeRole();

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Change Role</DialogTitle>
          <DialogDescription>
            Update <span className="font-semibold">{user?.name}</span>'s role.
          </DialogDescription>
        </DialogHeader>
        <Select
          defaultValue={user?.role ?? "buyer"}
          onValueChange={(v) => setRole(v as "buyer" | "seller")}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="buyer">Buyer</SelectItem>
            <SelectItem value="seller">Seller</SelectItem>
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            disabled={changeRole.isPending}
            onClick={async () => {
              if (!user) return;
              await changeRole.mutateAsync({ userId: user.id, role });
              onClose();
            }}
          >
            {changeRole.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Ban dialog ────────────────────────────────────────────────────────────────

function BanDialog({
  open,
  user,
  onClose,
}: {
  open: boolean;
  user: AdminUser | null;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const banUser = useBanUser();

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-destructive">Ban User</DialogTitle>
          <DialogDescription>
            <span className="font-semibold">{user?.name}</span> will lose access immediately.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Reason (optional)</label>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Violated terms of service"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant="destructive"
            disabled={banUser.isPending}
            onClick={async () => {
              if (!user) return;
              await banUser.mutateAsync({ userId: user.id, reason: reason.trim() || undefined });
              setReason("");
              onClose();
            }}
          >
            {banUser.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
            Ban User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Generic confirm dialog ────────────────────────────────────────────────────

function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  confirmVariant,
  userId,
  onClose,
  action,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmVariant: "default" | "destructive";
  userId: string | null;
  onClose: () => void;
  action: "unban" | "reset";
}) {
  const unban = useUnbanUser();
  const reset = useResetPassword();
  const isPending = action === "unban" ? unban.isPending : reset.isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant={confirmVariant}
            disabled={isPending}
            onClick={async () => {
              if (!userId) return;
              if (action === "unban") await unban.mutateAsync(userId);
              else await reset.mutateAsync(userId);
              onClose();
            }}
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Impersonate dialog ────────────────────────────────────────────────────────

function ImpersonateDialog({
  open,
  user,
  onClose,
  onConfirm,
}: {
  open: boolean;
  user: AdminUser | null;
  onClose: () => void;
  onConfirm: (userId: string) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Impersonate User</DialogTitle>
          <DialogDescription>
            You will temporarily act as{" "}
            <span className="font-semibold">{user?.name}</span> ({user?.email}).
            Your session switches to theirs — you can stop at any time.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            disabled={loading}
            onClick={async () => {
              if (!user) return;
              setLoading(true);
              try { await onConfirm(user.id); } finally { setLoading(false); onClose(); }
            }}
          >
            {loading
              ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              : <LogIn className="h-4 w-4 mr-1.5" />}
            Start Impersonating
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
