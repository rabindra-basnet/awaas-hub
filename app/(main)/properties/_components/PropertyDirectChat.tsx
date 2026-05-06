"use client";

import React, { useEffect, useRef, useState } from "react";
import { Send, MessageCircle, Loader2, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  usePropertyDirectChat,
  useSendDirectMessage,
  useDirectChatChannel,
  useBuyerChatChannel,
  type DirectChatMessage,
} from "@/lib/client/queries/property-chat.queries";
import { format } from "date-fns";

interface Props {
  propertyId: string;
  sellerId: string;
  sellerName: string;
  propertyTitle: string;
  currentUserId: string;
}

function formatTime(iso: string) {
  return format(new Date(iso), "hh:mm a");
}

function MessageBubble({
  msg,
  isOwn,
}: {
  msg: DirectChatMessage;
  isOwn: boolean;
}) {
  const isOptimistic = msg._id.startsWith("optimistic-");

  return (
    <div
      className={cn(
        "flex flex-col gap-0.5",
        isOwn ? "items-end" : "items-start",
      )}
    >
      {!isOwn && (
        <div className="flex items-center gap-1.5 px-1">
          <Avatar className="w-5 h-5">
            <AvatarFallback className="text-[9px] font-black bg-primary/10 text-primary">
              {msg.senderName?.slice(0, 2).toUpperCase() ?? "??"}
            </AvatarFallback>
          </Avatar>
          <span className="text-[10px] text-muted-foreground font-semibold">
            {msg.senderName}
          </span>
        </div>
      )}
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed break-words",
          isOwn
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted/70 text-foreground rounded-bl-sm border border-border/40",
          isOptimistic && "opacity-60",
        )}
      >
        <p className="whitespace-pre-wrap">{msg.content}</p>
        <span
          className={cn(
            "block text-[10px] mt-1 font-medium",
            isOwn
              ? "text-primary-foreground/60 text-right"
              : "text-muted-foreground/70",
          )}
        >
          {isOptimistic ? (
            <span className="flex items-center gap-1 justify-end">
              <Loader2 size={9} className="animate-spin" />
              Sending
            </span>
          ) : (
            formatTime(msg.createdAt)
          )}
        </span>
      </div>
    </div>
  );
}

export default function PropertyDirectChat({
  propertyId,
  sellerId,
  sellerName,
  propertyTitle,
  currentUserId,
}: Props) {
  const [input, setInput] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data, isLoading, error } = usePropertyDirectChat(propertyId, sellerId);
  const sendMessage = useSendDirectMessage(propertyId, sellerId, propertyTitle);

  // Subscribe to real-time messages in this conversation
  useDirectChatChannel(data?.conversation?._id, ["property-chat", propertyId]);
  // Subscribe to seller-reply notifications (covers the case where supabase sends
  // the seller reply via the buyer channel instead of the conversation channel)
  useBuyerChatChannel(currentUserId || undefined, propertyId);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [data?.messages]);

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || sendMessage.isPending) return;
    setInput("");
    textareaRef.current?.focus();
    sendMessage.mutate(trimmed);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-40 gap-2 text-destructive/70 text-sm">
        <AlertCircle size={15} />
        Failed to load chat
      </div>
    );
  }

  const messages = data?.messages ?? [];

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 min-h-[260px] max-h-[340px]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center py-8">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <MessageCircle size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">
                Message {sellerName.split(" ")[0]}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Ask anything about this property
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              msg={msg}
              isOwn={msg.senderId === currentUserId || msg.senderId === "me"}
            />
          ))
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border/50 bg-muted/20 px-3 py-3">
        {sendMessage.isError && (
          <p className="text-[11px] text-destructive font-medium mb-2 flex items-center gap-1.5">
            <AlertCircle size={12} />
            {sendMessage.error?.message ?? "Failed to send. Try again."}
          </p>
        )}
        <div className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${sellerName.split(" ")[0]}… (Enter to send)`}
            className="resize-none text-sm rounded-xl min-h-[40px] max-h-28 flex-1 py-2.5 leading-snug border-border/60 focus-visible:ring-primary/30 bg-background"
            rows={1}
            disabled={sendMessage.isPending}
            maxLength={2000}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || sendMessage.isPending}
            size="icon"
            className={cn(
              "h-10 w-10 rounded-xl shrink-0 transition-all",
              input.trim()
                ? "bg-primary hover:bg-primary/90 shadow-sm"
                : "bg-muted text-muted-foreground",
            )}
          >
            {sendMessage.isPending ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Send size={15} />
            )}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1 text-right">
          Press{" "}
          <kbd className="font-mono bg-muted px-1 rounded text-[9px]">
            Enter
          </kbd>{" "}
          to send
        </p>
      </div>
    </div>
  );
}
