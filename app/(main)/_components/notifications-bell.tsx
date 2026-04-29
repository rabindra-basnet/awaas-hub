"use client";

import { Bell, Building2, MessageSquare, Headphones } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { useSession } from "@/lib/client/auth-client";
import { Role } from "@/lib/rbac";
import {
  useAdminSupportInbox,
  useAdminInboxChannel,
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
  const isAdmin = session?.user?.role === Role.ADMIN;

  const { data: inboxData } = useAdminSupportInbox({ enabled: isAdmin });
  useAdminInboxChannel();

  const router = useRouter();

  const conversations = inboxData?.conversations ?? [];
  const unread = conversations.filter((c) => c.unreadByAdmin > 0);
  const totalUnread = unread.reduce((sum, c) => sum + c.unreadByAdmin, 0);

  // Non-admin: plain bell, no data fetched
  if (!isAdmin) {
    return (
      <button className="relative h-10 w-10 rounded-lg border flex items-center justify-center hover:bg-accent transition-colors">
        <Bell className="h-5 w-5 text-muted-foreground" />
      </button>
    );
  }

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
        {/* Header */}
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

        {/* Conversation list */}
        <div className="max-h-72 overflow-y-auto">
          {unread.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <MessageSquare className="h-5 w-5 opacity-30" />
              </div>
              <p className="text-sm font-medium">No new messages</p>
              <p className="text-xs text-muted-foreground/60">
                All support requests are read
              </p>
            </div>
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
                  onClick={() => router.push("/support/inbox")}
                >
                  {/* Avatar with unread dot */}
                  <div className="relative shrink-0 mt-0.5">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-[11px] font-bold bg-primary/10 text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="text-sm font-semibold truncate">
                        {conv.userName}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge
                          className={cn(
                            "h-4 min-w-4 px-1 text-[9px] rounded-full",
                            conv.userRole === "seller"
                              ? "bg-violet-500"
                              : "bg-blue-500",
                          )}
                        >
                          {conv.unreadByAdmin}
                        </Badge>
                      </div>
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
                        {formatDistanceToNow(new Date(conv.lastMessageAt), {
                          addSuffix: true,
                        })}
                      </span>
                    )}
                  </div>
                </DropdownMenuItem>
              );
            })
          )}
        </div>

        {/* Footer */}
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
