"use client";

import { useSellerInbox } from "@/features/chat/queries/chat.queries";
import { MessageCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/shared/components/ui/badge";

export default function SellerChatInbox() {
  const { data } = useSellerInbox();
  const conversations: any[] = data?.conversations ?? [];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Property Inquiries</h1>
        <p className="text-sm text-muted-foreground mt-1">{conversations.length} active conversations</p>
      </div>

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20 gap-4 text-muted-foreground">
          <MessageCircle className="w-12 h-12 opacity-20" />
          <p className="text-sm">No inquiries yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((c: any) => (
            <a
              key={c._id}
              href={`/chat/${c._id}`}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:bg-muted/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-semibold text-primary text-sm">
                {c.buyerName?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm truncate">{c.buyerName || "Anonymous"}</span>
                  {c.unreadBySeller > 0 && (
                    <Badge className="text-[10px] h-4 px-1.5">{c.unreadBySeller}</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{c.propertyTitle}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{c.lastMessage}</p>
              </div>
              {c.lastMessageAt && (
                <span className="text-[10px] text-muted-foreground shrink-0 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(c.lastMessageAt), { addSuffix: true })}
                </span>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
