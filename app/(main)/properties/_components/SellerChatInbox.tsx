"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Send,
  MessageCircle,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Users,
  ShieldAlert,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNowStrict } from "date-fns";
import {
  useSellerChatInbox,
  useSellerConversation,
  useSellerReply,
  useSellerInboxChannel,
  usePropertyAdminInboxChannel,
  useDirectChatChannel,
  type DirectChatConversation,
  type DirectChatMessage,
} from "@/lib/client/queries/property-chat.queries";

interface Props {
  propertyId: string;
  currentUserId: string;
  isAdmin?: boolean;
  isOwner?: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  return format(new Date(iso), "hh:mm a");
}

function timeAgo(iso: string | null) {
  if (!iso) return "";
  try {
    return formatDistanceToNowStrict(new Date(iso), { addSuffix: true });
  } catch {
    return "";
  }
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ── Message Bubble ────────────────────────────────────────────────────────────

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
            <AvatarFallback className="text-[9px] font-black bg-blue-100 dark:bg-blue-900/40 text-blue-600">
              {initials(msg.senderName ?? "B")}
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

// ── Conversation List Item ────────────────────────────────────────────────────

function ConversationItem({
  conv,
  isSelected,
  onClick,
}: {
  conv: DirectChatConversation;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-border/40 last:border-0",
        isSelected
          ? "bg-primary/8 dark:bg-primary/10"
          : "hover:bg-muted/50",
      )}
    >
      <Avatar className="w-9 h-9 shrink-0">
        <AvatarFallback className="text-[11px] font-black bg-blue-100 dark:bg-blue-900/40 text-blue-600">
          {initials(conv.buyerName)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="text-[12px] font-bold text-foreground truncate">
            {conv.buyerName}
          </span>
          <span className="text-[10px] text-muted-foreground shrink-0">
            {timeAgo(conv.lastMessageAt)}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground truncate">
          {conv.lastMessage || "No messages yet"}
        </p>
      </div>
      {conv.unreadBySeller > 0 && (
        <Badge className="h-5 min-w-5 rounded-full px-1.5 text-[10px] font-bold bg-primary shrink-0">
          {conv.unreadBySeller}
        </Badge>
      )}
    </button>
  );
}

// ── Conversation Panel ────────────────────────────────────────────────────────

function ConversationPanel({
  conversationId,
  currentUserId,
  buyerName,
  isAdmin,
  canReply,
  onBack,
}: {
  conversationId: string;
  currentUserId: string;
  buyerName: string;
  isAdmin: boolean;
  canReply: boolean;
  onBack: () => void;
}) {
  const [input, setInput] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data, isLoading, error } = useSellerConversation(conversationId);
  const reply = useSellerReply(conversationId);

  useDirectChatChannel(conversationId, ["seller-conversation", conversationId]);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [data?.messages]);

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || reply.isPending || !canReply) return;
    setInput("");
    textareaRef.current?.focus();
    reply.mutate(trimmed);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sub-header */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-border/40 bg-muted/20 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 rounded-full shrink-0"
          onClick={onBack}
        >
          <ArrowLeft size={14} />
        </Button>
        <Avatar className="w-7 h-7 shrink-0">
          <AvatarFallback className="text-[10px] font-black bg-blue-100 dark:bg-blue-900/40 text-blue-600">
            {initials(buyerName)}
          </AvatarFallback>
        </Avatar>
        <span className="text-[12px] font-bold text-foreground truncate flex-1">
          {buyerName}
        </span>
        {isAdmin && !canReply && (
          <Badge
            variant="outline"
            className="text-[9px] font-bold gap-1 text-amber-600 border-amber-400/50 shrink-0"
          >
            <ShieldAlert size={9} />
            Read-only
          </Badge>
        )}
      </div>

      {/* Messages */}
      {isLoading ? (
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center flex-1 gap-2 text-destructive/70 text-sm">
          <AlertCircle size={15} />
          Failed to load conversation
        </div>
      ) : (
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 min-h-[220px] max-h-[300px]">
          {(data?.messages ?? []).length === 0 ? (
            <div className="flex items-center justify-center h-full text-[11px] text-muted-foreground py-8">
              No messages yet
            </div>
          ) : (
            (data?.messages ?? []).map((msg) => (
              <MessageBubble
                key={msg._id}
                msg={msg}
                isOwn={
                  msg.senderRole === "seller" &&
                  (msg.senderId === currentUserId || msg.senderId === "me")
                }
              />
            ))
          )}
        </div>
      )}

      {/* Reply input — only for the property's seller (including admin who owns it) */}
      {canReply && (
        <div className="border-t border-border/50 bg-muted/20 px-3 py-3 shrink-0">
          {reply.isError && (
            <p className="text-[11px] text-destructive font-medium mb-2 flex items-center gap-1.5">
              <AlertCircle size={12} />
              {reply.error?.message ?? "Failed to send. Try again."}
            </p>
          )}
          <div className="flex items-end gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Reply to ${buyerName.split(" ")[0]}… (Enter to send)`}
              className="resize-none text-sm rounded-xl min-h-[40px] max-h-28 flex-1 py-2.5 leading-snug border-border/60 focus-visible:ring-primary/30 bg-background"
              rows={1}
              disabled={reply.isPending}
              maxLength={2000}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || reply.isPending}
              size="icon"
              className={cn(
                "h-10 w-10 rounded-xl shrink-0 transition-all",
                input.trim()
                  ? "bg-primary hover:bg-primary/90 shadow-sm"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {reply.isPending ? (
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
      )}
    </div>
  );
}

// ── Main: Seller Chat Inbox ───────────────────────────────────────────────────

export default function SellerChatInbox({
  propertyId,
  currentUserId,
  isAdmin = false,
  isOwner = false,
}: Props) {
  // Admin who listed this property can reply; pure admin observers cannot
  const canReply = isOwner || !isAdmin;
  const [selectedConv, setSelectedConv] = useState<DirectChatConversation | null>(null);

  const { data, isLoading, error } = useSellerChatInbox(propertyId);

  useSellerInboxChannel(currentUserId, propertyId);
  usePropertyAdminInboxChannel(isAdmin, propertyId);

  const conversations = data?.conversations ?? [];

  return (
    <div className="flex-1 min-w-0 w-full rounded-2xl border border-border/60 overflow-hidden bg-card flex flex-col lg:sticky lg:top-[72px]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-muted/30 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Users size={15} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold leading-tight">
            {selectedConv ? selectedConv.buyerName : "Buyer Messages"}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {selectedConv
              ? "Direct conversation"
              : `${conversations.length} conversation${conversations.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        {isAdmin && !canReply && !selectedConv && (
          <Badge
            variant="outline"
            className="text-[9px] font-bold gap-1 text-amber-600 border-amber-400/50 shrink-0"
          >
            <ShieldAlert size={9} />
            Read-only
          </Badge>
        )}
      </div>

      {/* Body */}
      {selectedConv ? (
        <ConversationPanel
          conversationId={selectedConv._id}
          currentUserId={currentUserId}
          buyerName={selectedConv.buyerName}
          isAdmin={isAdmin}
          canReply={canReply}
          onBack={() => setSelectedConv(null)}
        />
      ) : isLoading ? (
        <div className="flex items-center justify-center flex-1 h-40">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center flex-1 h-40 gap-2 text-destructive/70 text-sm">
          <AlertCircle size={15} />
          Failed to load inbox
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-2 text-center py-12 px-6">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
            <MessageCircle size={20} className="text-muted-foreground" />
          </div>
          <p className="text-[12px] font-bold text-foreground">No messages yet</p>
          <p className="text-[11px] text-muted-foreground">
            Buyers who contact you about this property will appear here.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <ConversationItem
              key={conv._id}
              conv={conv}
              isSelected={selectedConv?._id === conv._id}
              onClick={() => setSelectedConv(conv)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
