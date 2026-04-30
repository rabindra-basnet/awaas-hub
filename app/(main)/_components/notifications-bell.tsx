"use client";

import { Bell, Building2, MessageSquare, Headphones, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { useSession } from "@/lib/client/auth-client";
import { useQueryClient } from "@tanstack/react-query";
import { Role } from "@/lib/rbac";
import {
  useAdminSupportInbox,
  useAdminInboxChannel,
  useUserNotifications,
  useUserNotificationsChannel,
  type UserNotificationsData,
} from "@/lib/client/queries/support.queries";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default function NotificationsBell() {
  const { data: session } = useSession();
  const role = session?.user?.role as Role | undefined;
  const isAdmin = role === Role.ADMIN;
  const isGuest = !session || role === Role.GUEST || session.user?.isAnonymous;

  // Admin data
  const { data: inboxData } = useAdminSupportInbox({ enabled: isAdmin });
  useAdminInboxChannel();

  // User data
  const { data: userNotifData } = useUserNotifications({
    enabled: !isAdmin && !isGuest,
  });
  useUserNotificationsChannel(!isAdmin && !isGuest ? session?.user?.id : undefined);

  const router = useRouter();
  const queryClient = useQueryClient();

  const dismissUserNotification = (convId: string) => {
    queryClient.setQueryData<UserNotificationsData>(
      ["user-notifications"],
      (old) => {
        if (!old) return old;
        const conversations = old.conversations.filter((c) => c._id !== convId);
        return {
          conversations,
          totalUnread: conversations.reduce((sum, c) => sum + (c.unreadByUser ?? 0), 0),
        };
      },
    );
  };

  const dismissAdminNotification = (convId: string) => {
    queryClient.setQueryData<{ conversations: import("@/lib/client/queries/support.queries").SupportConversation[] }>(
      ["support-inbox"],
      (old) => {
        if (!old) return old;
        return {
          conversations: old.conversations.map((c) =>
            c._id === convId ? { ...c, unreadByAdmin: 0 } : c,
          ),
        };
      },
    );
  };

  // ── Admin bell ────────────────────────────────────────────────────────────
  if (isAdmin) {
    const conversations = inboxData?.conversations ?? [];
    const unread = conversations.filter((c) => c.unreadByAdmin > 0);
    const totalUnread = unread.reduce((sum, c) => sum + c.unreadByAdmin, 0);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="relative h-10 w-10 rounded-lg border flex items-center justify-center hover:bg-accent transition-colors outline-none">
            <Bell className="h-5 w-5 text-muted-foreground" />
            {totalUnread > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-4.5 min-w-4.5 px-1 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold leading-none">
                {totalUnread > 99 ? "99+" : totalUnread}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-80 p-0">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-2">
              <Headphones className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Support Notifications</span>
            </div>
            {totalUnread > 0 ? (
              <Badge className="h-5 px-1.5 text-[10px] font-bold rounded-full">
                {totalUnread} new
              </Badge>
            ) : (
              <span className="text-[11px] text-muted-foreground">All caught up</span>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {unread.length === 0 ? (
              <EmptyState label="No new messages" sub="All support requests are read" />
            ) : (
              unread.slice(0, 6).map((conv) => {
                const initials = conv.userName
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <DropdownMenuItem
                    key={conv._id}
                    className="flex items-start gap-3 px-4 py-3 cursor-pointer focus:bg-muted/60 rounded-none border-b border-border/40 last:border-0"
                    onClick={() => {
                      dismissAdminNotification(conv._id);
                      router.push(`/support/inbox?id=${conv._id}`);
                    }}
                  >
                    <div className="relative shrink-0 mt-0.5">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-[11px] font-bold bg-primary/10 text-primary">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-sm font-semibold truncate">{conv.userName}</span>
                        <Badge
                          className={cn(
                            "h-4 min-w-4 px-1 text-[9px] rounded-full shrink-0",
                            conv.userRole === "seller" ? "bg-violet-500" : "bg-blue-500",
                          )}
                        >
                          {conv.unreadByAdmin}
                        </Badge>
                      </div>
                      {conv.propertyTitle && (
                        <div className="flex items-center gap-1 mb-0.5">
                          <Building2 className="h-3 w-3 text-primary/60 shrink-0" />
                          <span className="text-[11px] text-primary/70 font-medium truncate">
                            {conv.propertyTitle}
                          </span>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground truncate">
                        {conv.lastMessage || "No messages"}
                      </p>
                      {conv.lastMessageAt && (
                        <span className="text-[10px] text-muted-foreground/50 mt-0.5 block">
                          {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </DropdownMenuItem>
                );
              })
            )}
          </div>

          <DropdownMenuSeparator className="m-0" />
          <DropdownMenuItem
            className="justify-center py-2.5 text-sm font-medium text-primary cursor-pointer rounded-none focus:bg-primary/5"
            onClick={() => router.push("/support/inbox")}
          >
            Open Support Inbox
            {unread.length > 6 && (
              <Badge variant="outline" className="ml-2 text-[10px] h-4 px-1">
                +{unread.length - 6} more
              </Badge>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // ── Guest: no bell ────────────────────────────────────────────────────────
  if (isGuest) {
    return (
      <button className="relative h-10 w-10 rounded-lg border flex items-center justify-center hover:bg-accent transition-colors">
        <Bell className="h-5 w-5 text-muted-foreground" />
      </button>
    );
  }

  // ── User bell ─────────────────────────────────────────────────────────────
  const userConvs = userNotifData?.conversations ?? [];
  const totalUnread = userNotifData?.totalUnread ?? 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative h-10 w-10 rounded-lg border flex items-center justify-center hover:bg-accent transition-colors outline-none">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {totalUnread > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-4.5 min-w-4.5 px-1 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold leading-none">
              {totalUnread > 99 ? "99+" : totalUnread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">Messages from Admin</span>
          </div>
          {totalUnread > 0 ? (
            <Badge className="h-5 px-1.5 text-[10px] font-bold rounded-full">
              {totalUnread} new
            </Badge>
          ) : (
            <span className="text-[11px] text-muted-foreground">No new replies</span>
          )}
        </div>

        <div className="max-h-72 overflow-y-auto">
          {userConvs.length === 0 ? (
            <EmptyState
              label="No new replies"
              sub="Admin replies will appear here"
            />
          ) : (
            userConvs.slice(0, 6).map((conv) => (
              <DropdownMenuItem
                key={conv._id}
                className="flex items-start gap-3 px-4 py-3 cursor-pointer focus:bg-muted/60 rounded-none border-b border-border/40 last:border-0"
                onClick={() => {
                  dismissUserNotification(conv._id);
                  router.push(
                    conv.propertyId
                      ? `/properties/${conv.propertyId}`
                      : "/support",
                  );
                }}
              >
                <div className="relative shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Headphones className="w-4 h-4 text-primary" />
                  </div>
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-sm font-semibold truncate">
                      Admin replied
                    </span>
                    {conv.unreadByUser > 0 && (
                      <Badge className="h-4 min-w-4 px-1 text-[9px] rounded-full shrink-0">
                        {conv.unreadByUser}
                      </Badge>
                    )}
                  </div>

                  {conv.propertyTitle && (
                    <div className="flex items-center gap-1 mb-0.5">
                      <Building2 className="h-3 w-3 text-primary/60 shrink-0" />
                      <span className="text-[11px] text-primary/70 font-medium truncate">
                        {conv.propertyTitle}
                      </span>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground truncate">
                    {conv.lastMessage || "New reply"}
                  </p>

                  {conv.lastMessageAt && (
                    <span className="text-[10px] text-muted-foreground/50 mt-0.5 block">
                      {formatDistanceToNow(new Date(conv.lastMessageAt), {
                        addSuffix: true,
                      })}
                    </span>
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>

        {userConvs.length > 0 && (
          <>
            <DropdownMenuSeparator className="m-0" />
            <DropdownMenuLabel className="text-center text-[10px] text-muted-foreground/60 py-2 font-normal">
              Click a message to open the property chat
            </DropdownMenuLabel>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function EmptyState({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
        <MessageSquare className="h-5 w-5 opacity-30" />
      </div>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs text-muted-foreground/60">{sub}</p>
    </div>
  );
}
