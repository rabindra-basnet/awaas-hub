"use client";

// components/chat/InAppChat.tsx

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Send, MessageCircle, Loader2, AlertCircle, Wifi } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  useConversation,
  useSendMessage,
  useSendTyping,
  useChatSSE,
  type ChatMessage,
} from "@/lib/client/queries/chat.queries";

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function groupMessagesByDate(messages: ChatMessage[]) {
  const groups: { date: string; messages: ChatMessage[] }[] = [];
  for (const msg of messages) {
    const date = formatDate(msg.createdAt);
    const last = groups[groups.length - 1];
    if (last?.date === date) {
      last.messages.push(msg);
    } else {
      groups.push({ date, messages: [msg] });
    }
  }
  return groups;
}

// ── Message Bubble ────────────────────────────────────────────────────────────
function MessageBubble({
  msg,
  isMine,
  showAvatar,
}: {
  msg: ChatMessage;
  isMine: boolean;
  showAvatar: boolean;
}) {
  const isOptimistic = msg._id.startsWith("optimistic-");

  return (
    <div
      className={cn(
        "flex items-end gap-2 group",
        isMine ? "flex-row-reverse" : "flex-row",
      )}
    >
      {/* Avatar */}
      {!isMine && (
        <Avatar
          className={cn(
            "w-7 h-7 shrink-0 transition-opacity",
            showAvatar ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
        >
          <AvatarFallback className="text-[10px] font-black bg-primary/10 text-primary">
            {msg.senderName?.slice(0, 2).toUpperCase() ?? "??"}
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "flex flex-col gap-1 max-w-[75%]",
          isMine ? "items-end" : "items-start",
        )}
      >
        {/* Sender name — only show when avatar shows */}
        {!isMine && showAvatar && (
          <span className="text-[10px] font-semibold text-muted-foreground px-1">
            {msg.senderName}
          </span>
        )}

        {/* Bubble */}
        <div
          className={cn(
            "relative px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed transition-all",
            isMine
              ? "bg-primary text-primary-foreground rounded-br-sm shadow-sm"
              : "bg-muted/70 text-foreground rounded-bl-sm border border-border/40",
            isOptimistic && "opacity-70",
          )}
        >
          <p className="whitespace-pre-wrap break-words">{msg.content}</p>

          {/* Timestamp inside bubble */}
          <span
            className={cn(
              "block text-[10px] mt-1 font-medium",
              isMine
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
    </div>
  );
}

// ── Typing Indicator ──────────────────────────────────────────────────────────
function TypingIndicator({ name }: { name: string }) {
  return (
    <div className="flex items-end gap-2">
      <Avatar className="w-7 h-7 shrink-0">
        <AvatarFallback className="text-[10px] font-black bg-primary/10 text-primary">
          {name?.slice(0, 2).toUpperCase() ?? "??"}
        </AvatarFallback>
      </Avatar>
      <div className="bg-muted/70 border border-border/40 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
      <span className="text-[10px] text-muted-foreground font-medium">
        {name} is typing
      </span>
    </div>
  );
}

// ── Date Divider ──────────────────────────────────────────────────────────────
function DateDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-2">
      <div className="flex-1 h-px bg-border/40" />
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2">
        {label}
      </span>
      <div className="flex-1 h-px bg-border/40" />
    </div>
  );
}

// ── Main Chat Component ───────────────────────────────────────────────────────
interface InAppChatProps {
  propertyId: string;
  currentUserId: string;
  currentUserName: string;
  sellerName: string;
  isPremium: boolean;
}

export default function InAppChat({
  propertyId,
  currentUserId,
  currentUserName,
  sellerName,
  isPremium,
}: InAppChatProps) {
  const [input, setInput] = useState("");
  const [typingUser, setTypingUser] = useState<{
    name: string;
    senderId: string;
  } | null>(null);
  const [connected, setConnected] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const { data, isLoading, error } = useConversation(propertyId, isPremium);

  const sendMutation = useSendMessage(propertyId);
  const { onKeyPress: onTypingKeyPress, sendTyping } = useSendTyping(
    data?.conversation._id,
  );

  // Handle typing events from SSE
  const handleTyping = useCallback(
    (event: { senderId: string; senderName: string; isTyping: boolean }) => {
      if (event.senderId === currentUserId) return;
      if (event.isTyping) {
        setTypingUser({ name: event.senderName, senderId: event.senderId });
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 3000);
      } else {
        setTypingUser(null);
      }
    },
    [currentUserId],
  );

  // SSE connection
  useChatSSE(data?.conversation._id, propertyId, handleTyping);

  // Mark as connected once conversation loads
  useEffect(() => {
    if (data?.conversation._id) setConnected(true);
  }, [data?.conversation._id]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages, typingUser]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sendMutation.isPending) return;
    setInput("");
    sendTyping(false);
    textareaRef.current?.focus();
    await sendMutation.mutateAsync(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    onTypingKeyPress();
  };

  const messages = data?.messages ?? [];
  const grouped = groupMessagesByDate(messages);

  // ── Not premium ────────────────────────────────────────────────────────────
  if (!isPremium) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3 text-center p-6 rounded-2xl bg-muted/30 border border-dashed border-border">
        <MessageCircle size={28} className="text-muted-foreground/40" />
        <div>
          <p className="text-sm font-bold text-foreground">Premium feature</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Upgrade to message the seller directly
          </p>
        </div>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col rounded-2xl border border-border/60 overflow-hidden bg-card h-96">
        <ChatHeader sellerName={sellerName} connected={false} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-xs font-medium">Loading conversation…</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col rounded-2xl border border-destructive/30 overflow-hidden bg-card h-48">
        <div className="flex-1 flex items-center justify-center gap-2 text-destructive/70 text-sm font-medium">
          <AlertCircle size={16} />
          Failed to load conversation
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-2xl border border-border/60 overflow-hidden bg-card shadow-sm">
      {/* ── Header ── */}
      <ChatHeader sellerName={sellerName} connected={connected} />

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-[280px] max-h-[380px] scroll-smooth">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-10">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <MessageCircle size={22} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                Start the conversation
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Ask {sellerName} about this property
              </p>
            </div>
          </div>
        ) : (
          grouped.map((group) => (
            <React.Fragment key={group.date}>
              <DateDivider label={group.date} />
              {group.messages.map((msg, i) => {
                const isMine =
                  msg.senderId === currentUserId || msg.senderId === "me";
                const nextMsg = group.messages[i + 1];
                const isLastInGroup =
                  !nextMsg || nextMsg.senderId !== msg.senderId;
                return (
                  <MessageBubble
                    key={msg._id}
                    msg={msg}
                    isMine={isMine}
                    showAvatar={isLastInGroup}
                  />
                );
              })}
            </React.Fragment>
          ))
        )}

        {/* Typing indicator */}
        {typingUser && <TypingIndicator name={typingUser.name} />}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input ── */}
      <div className="border-t border-border/50 bg-muted/20 px-4 py-3">
        {sendMutation.isError && (
          <p className="text-[11px] text-destructive font-medium mb-2 flex items-center gap-1.5">
            <AlertCircle size={12} />
            {sendMutation.error?.message ?? "Failed to send. Try again."}
          </p>
        )}
        <div className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${sellerName}… (Enter to send, Shift+Enter for newline)`}
            className="resize-none text-sm rounded-xl min-h-[44px] max-h-32 flex-1 py-3 leading-snug border-border/60 focus-visible:ring-primary/30 bg-background"
            rows={1}
            disabled={sendMutation.isPending}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || sendMutation.isPending}
            size="icon"
            className={cn(
              "h-11 w-11 rounded-xl shrink-0 transition-all",
              input.trim()
                ? "bg-primary hover:bg-primary/90 shadow-sm"
                : "bg-muted text-muted-foreground",
            )}
          >
            {sendMutation.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 text-right">
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

// ── Chat Header ───────────────────────────────────────────────────────────────
function ChatHeader({
  sellerName,
  connected,
}: {
  sellerName: string;
  connected: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-muted/20">
      <Avatar className="w-8 h-8 shrink-0">
        <AvatarFallback className="text-[11px] font-black bg-primary/10 text-primary">
          {sellerName?.slice(0, 2).toUpperCase() ?? "??"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground truncate">
          {sellerName}
        </p>
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-colors",
              connected ? "bg-green-500" : "bg-muted-foreground/40",
            )}
          />
          <span className="text-[10px] text-muted-foreground font-medium">
            {connected ? "Connected" : "Connecting…"}
          </span>
        </div>
      </div>
      <Wifi
        size={14}
        className={cn(
          "transition-colors",
          connected ? "text-green-500" : "text-muted-foreground/30",
        )}
      />
    </div>
  );
}
