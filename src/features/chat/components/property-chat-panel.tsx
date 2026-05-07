"use client";

import { useState, useRef, useEffect } from "react";
import { usePropertyChat, useSendMessage } from "@/features/chat/queries/chat.queries";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Send, MessageCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type Props = { propertyId: string; userId: string; userName: string };

export default function PropertyChatPanel({ propertyId, userId, userName }: Props) {
  const { data, refetch }  = usePropertyChat(propertyId);
  const send               = useSendMessage(propertyId);
  const [msg, setMsg]      = useState("");
  const bottomRef          = useRef<HTMLDivElement>(null);

  const messages: any[] = data?.messages ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = () => {
    const content = msg.trim();
    if (!content) return;
    setMsg("");
    send.mutate(content, {
      onSuccess: () => refetch(),
      onError: (e: any) => toast.error(e.message || "Failed to send"),
    });
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border shrink-0">
        <MessageCircle className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold">Message Seller</span>
        <span className="ml-auto text-xs text-muted-foreground">{messages.length} message{messages.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-muted-foreground">
            <MessageCircle className="w-8 h-8 opacity-20" />
            <p className="text-xs">Send the first message to the seller</p>
          </div>
        )}
        {messages.map((m: any) => {
          const isMine = m.senderId === userId;
          return (
            <div key={m._id} className={`flex gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
              <Avatar className="w-6 h-6 shrink-0 mt-0.5">
                <AvatarFallback className="text-[10px]">
                  {(m.senderName?.[0] ?? "?").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className={`max-w-[75%] space-y-0.5 ${isMine ? "items-end" : "items-start"} flex flex-col`}>
                <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  isMine
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-muted rounded-tl-sm"
                }`}>
                  {m.content}
                </div>
                <span className="text-[10px] text-muted-foreground px-1">
                  {m.createdAt ? formatDistanceToNow(new Date(m.createdAt), { addSuffix: true }) : ""}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 px-4 py-3 border-t border-border shrink-0">
        <Input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Type your message…"
          className="flex-1 text-sm"
          disabled={send.isPending}
        />
        <Button size="icon" onClick={handleSend} disabled={send.isPending || !msg.trim()} className="shrink-0">
          {send.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
