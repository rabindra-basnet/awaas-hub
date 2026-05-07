"use client";

import { useSupportInbox, useAdminSupportReply } from "@/features/support/queries/support.queries";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { toast } from "sonner";
import { MessageCircle, Send, Loader2, Clock } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export default function SupportInbox() {
  const { data } = useSupportInbox();
  const conversations: any[] = data?.conversations ?? [];
  const [selected, setSelected] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const selectedConvo = conversations.find((c) => c._id === selected);

  const sendReply = useAdminSupportReply(selected ?? "");

  const handleReply = () => {
    if (!reply.trim() || !selected) return;
    const content = reply.trim();
    setReply("");
    sendReply.mutate(content, {
      onSuccess: () => toast.success("Reply sent"),
      onError: (e) => toast.error(e.message),
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 h-full flex gap-6">
      {/* Inbox list */}
      <div className="w-72 shrink-0 space-y-2">
        <div className="mb-4">
          <h1 className="text-xl font-bold">Support Inbox</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{conversations.length} open tickets</p>
        </div>
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-10 gap-3 text-muted-foreground">
            <MessageCircle className="w-8 h-8 opacity-20" />
            <p className="text-xs">No open tickets</p>
          </div>
        ) : (
          conversations.map((c: any) => (
            <button
              key={c._id}
              onClick={() => setSelected(c._id)}
              className={`w-full text-left rounded-xl border p-3 transition-all ${selected === c._id ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-muted/30"}`}
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs truncate flex-1">{c.userName}</span>
                {c.unreadByAdmin > 0 && <Badge className="text-[10px] h-4 px-1.5">{c.unreadByAdmin}</Badge>}
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{c.lastMessage}</p>
              {c.lastMessageAt && (
                <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {formatDistanceToNow(new Date(c.lastMessageAt), { addSuffix: true })}
                </p>
              )}
            </button>
          ))
        )}
      </div>

      {/* Chat panel */}
      {selectedConvo ? (
        <div className="flex-1 rounded-xl border border-border bg-card overflow-hidden flex flex-col min-h-[500px]">
          <div className="border-b border-border px-5 py-3.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
              {selectedConvo.userName?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <p className="font-semibold text-sm">{selectedConvo.userName}</p>
              <p className="text-xs text-muted-foreground">{selectedConvo.propertyTitle || "General Support"}</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <p className="text-xs text-center text-muted-foreground py-4">Select conversation to load messages</p>
          </div>
          <div className="border-t border-border p-3 flex gap-2">
            <Input
              placeholder="Type your reply..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleReply()}
            />
            <Button size="icon" onClick={handleReply} disabled={sendReply.isPending || !reply.trim()}>
              {sendReply.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground">
          <p className="text-sm">Select a conversation to reply</p>
        </div>
      )}
    </div>
  );
}
