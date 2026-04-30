"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  useAdminSupportInbox,
  useAdminConversation,
  useAdminReply,
  useSupportChannel,
  useAdminInboxChannel,
  type SupportConversation,
  type SupportMessage,
} from "@/lib/client/queries/support.queries";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  Send,
  Loader2,
  MessageSquare,
  Building2,
  Search,
  CheckCheck,
  Clock,
  Home,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";

export default function SupportInbox() {
  const searchParams = useSearchParams();
  const idFromUrl = searchParams.get("id");

  // manualSelectedId wins over the URL param; allows clicking rows to change selection
  const [manualSelectedId, setManualSelectedId] = useState<string | null>(null);
  const selectedId = manualSelectedId ?? idFromUrl;

  const [search, setSearch] = useState("");
  const { data: inboxData, isLoading } = useAdminSupportInbox();
  const scrolledForRef = useRef<string | null>(null);

  useAdminInboxChannel();
  useSupportChannel(selectedId ?? undefined, [
    "support-conversation",
    selectedId,
  ]);

  // Scroll sidebar row into view the first time this conversation is auto-selected
  useEffect(() => {
    if (!selectedId || !inboxData || scrolledForRef.current === selectedId) return;
    scrolledForRef.current = selectedId;
    requestAnimationFrame(() => {
      document
        .querySelector(`[data-conv-id="${selectedId}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }, [inboxData, selectedId]);

  const conversations = inboxData?.conversations ?? [];
  const filtered = conversations.filter(
    (c) =>
      c.userName.toLowerCase().includes(search.toLowerCase()) ||
      c.propertyTitle?.toLowerCase().includes(search.toLowerCase()) ||
      c.lastMessage?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 h-full flex flex-col">
      {/* Main panel */}
      <div className="flex flex-1 gap-4 min-h-0">
        {/* ── Left sidebar ── */}
        <aside className="w-72 shrink-0 flex flex-col rounded-2xl border border-border/60 bg-card overflow-hidden">
          {/* Search */}
          <div className="px-3 py-3 border-b border-border/60 shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations…"
                className="pl-8 h-8 text-xs bg-muted/30 border-border/40 focus-visible:ring-primary/30"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground px-4 text-center">
                <MessageSquare className="h-8 w-8 opacity-20" />
                <p className="text-sm">
                  {search ? "No results found." : "No support requests yet."}
                </p>
              </div>
            ) : (
              filtered.map((conv) => (
                <ConversationRow
                  key={conv._id}
                  conversation={conv}
                  isSelected={selectedId === conv._id}
                  onSelect={() => setManualSelectedId(conv._id)}
                />
              ))
            )}
          </div>
        </aside>

        {/* ── Right: chat view ── */}
        <div className="flex-1 flex flex-col rounded-2xl border border-border/60 bg-card overflow-hidden min-w-0">
          {selectedId ? (
            <ConversationView conversationId={selectedId} />
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 gap-3 text-muted-foreground">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                <MessageSquare className="h-6 w-6 opacity-30" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">No conversation selected</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">
                  Pick one from the list to start replying
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Conversation row ──────────────────────────────────────────────────────────

function ConversationRow({
  conversation,
  isSelected,
  onSelect,
}: {
  conversation: SupportConversation;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const initials = conversation.userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <button
      data-conv-id={conversation._id}
      onClick={onSelect}
      className={cn(
        "w-full text-left px-3 py-3 border-b border-border/40 transition-colors group",
        isSelected
          ? "bg-primary/8 border-l-2 border-l-primary"
          : "hover:bg-muted/40",
      )}
    >
      <div className="flex items-start gap-2.5">
        {/* Avatar */}
        <div className="relative shrink-0 mt-0.5">
          <Avatar className="w-8 h-8">
            <AvatarFallback
              className={cn(
                "text-[11px] font-bold",
                isSelected
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          {conversation.unreadByAdmin > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-primary rounded-full border-2 border-card" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span
              className={cn(
                "text-[13px] font-semibold truncate",
                conversation.unreadByAdmin > 0
                  ? "text-foreground"
                  : "text-foreground/80",
              )}
            >
              {conversation.userName}
            </span>
            {conversation.lastMessageAt && (
              <span className="text-[10px] text-muted-foreground/60 shrink-0">
                {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                  addSuffix: false,
                })}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 mb-1">
            <Badge
              variant="outline"
              className={cn(
                "text-[9px] py-0 h-3.5 font-medium border-border/40",
                conversation.userRole === "seller"
                  ? "text-violet-600 dark:text-violet-400"
                  : "text-blue-600 dark:text-blue-400",
              )}
            >
              {conversation.userRole}
            </Badge>
            {conversation.propertyTitle && (
              <span className="flex items-center gap-0.5 text-[10px] text-primary/70 font-medium truncate">
                <Building2 className="h-2.5 w-2.5 shrink-0" />
                <span className="truncate">{conversation.propertyTitle}</span>
              </span>
            )}
          </div>

          <p
            className={cn(
              "text-[11px] truncate",
              conversation.unreadByAdmin > 0
                ? "text-foreground/70 font-medium"
                : "text-muted-foreground",
            )}
          >
            {conversation.lastMessage || "No messages yet"}
          </p>
        </div>
      </div>
    </button>
  );
}

// ── Conversation view ─────────────────────────────────────────────────────────

function ConversationView({ conversationId }: { conversationId: string }) {
  const { data, isLoading } = useAdminConversation(conversationId);
  const reply = useAdminReply(conversationId);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages]);

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || reply.isPending) return;
    setInput("");
    reply.mutate(trimmed);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center flex-1">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const conv = data?.conversation;
  const initials = (conv?.userName ?? "?")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {/* ── Header ── */}
      <div className="px-5 py-3.5 border-b border-border/60 shrink-0 bg-muted/20">
        <div className="flex items-center gap-3">
          <Avatar className="w-9 h-9 shrink-0">
            <AvatarFallback className="text-[12px] font-bold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{conv?.userName}</span>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] py-0 h-4 font-medium",
                  conv?.userRole === "seller"
                    ? "text-violet-600 border-violet-200 dark:text-violet-400"
                    : "text-blue-600 border-blue-200 dark:text-blue-400",
                )}
              >
                {conv?.userRole}
              </Badge>
              <Badge
                variant={conv?.status === "open" ? "default" : "secondary"}
                className="text-[10px] py-0 h-4 ml-auto"
              >
                {conv?.status === "open" ? "Open" : "Closed"}
              </Badge>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              {conv?.propertyTitle && (
                <span className="flex items-center gap-1 text-[11px] text-primary/70 font-medium">
                  <Building2 className="h-3 w-3" />
                  {conv.propertyTitle}
                </span>
              )}
              {conv?.propertyId && (
                <span className="flex items-center gap-1 text-[11px] text-primary/70 font-medium">
                  <Home className="h-3 w-3" />
                 ID: {conv.propertyId}
                </span>
              )}
              {conv?.lastMessageAt && (
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(conv.lastMessageAt), {
                    addSuffix: true,
                  })}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Messages — this is the ONLY scrollable section ── */}
      <div className="flex-1 overflow-y-auto min-h-0 px-5 py-4 space-y-4">
        {!data?.messages.length ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground py-16">
            <MessageSquare className="h-8 w-8 opacity-20" />
            <p className="text-sm">No messages yet.</p>
          </div>
        ) : (
          data.messages.map((msg) => (
            <AdminMessageBubble key={msg._id} message={msg} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Reply input ── */}
      <div className="border-t border-border/60 px-4 py-3 shrink-0 bg-muted/10">
        {reply.isError && (
          <p className="text-[11px] text-destructive font-medium mb-2">
            Failed to send. Please try again.
          </p>
        )}
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Reply as Support… (Enter to send, Shift+Enter for newline)"
            rows={2}
            className="resize-none flex-1 text-sm rounded-xl border-border/60 focus-visible:ring-primary/30 bg-background"
            maxLength={2000}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || reply.isPending}
            className={cn(
              "h-11 w-11 rounded-xl shrink-0 transition-all",
              input.trim()
                ? "bg-primary hover:bg-primary/90 shadow-sm"
                : "bg-muted text-muted-foreground",
            )}
          >
            {reply.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
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
    </>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────

function AdminMessageBubble({ message }: { message: SupportMessage }) {
  const isAdmin = message.senderRole === "admin";
  const isOptimistic = message._id.startsWith("optimistic-");

  return (
    <div
      className={cn("flex gap-2.5", isAdmin ? "flex-row-reverse" : "flex-row")}
    >
      {/* Avatar */}
      {!isAdmin && (
        <Avatar className="w-7 h-7 shrink-0 mt-0.5">
          <AvatarFallback className="text-[10px] font-bold bg-muted text-muted-foreground">
            {message.senderName?.slice(0, 2).toUpperCase() ?? "??"}
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "flex flex-col gap-1 max-w-[72%]",
          isAdmin ? "items-end" : "items-start",
        )}
      >
        {/* Name + role */}
        <div className="flex items-center gap-1.5 px-1">
          <span className="text-[11px] text-muted-foreground font-medium">
            {isAdmin ? "You (Support)" : message.senderName}
          </span>
          {!isAdmin && (
            <Badge variant="outline" className="text-[9px] py-0 h-3.5">
              {message.senderRole}
            </Badge>
          )}
        </div>

        {/* Bubble */}
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words",
            isAdmin
              ? "bg-primary text-primary-foreground rounded-br-sm shadow-sm"
              : "bg-muted/70 text-foreground rounded-bl-sm border border-border/40",
            isOptimistic && "opacity-60",
          )}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
          <span
            className={cn(
              "flex items-center gap-1 text-[10px] mt-1 font-medium",
              isAdmin
                ? "text-primary-foreground/60 justify-end"
                : "text-muted-foreground/70",
            )}
          >
            {isOptimistic ? (
              <>
                <Loader2 size={9} className="animate-spin" /> Sending
              </>
            ) : (
              <>
                {format(new Date(message.createdAt), "hh:mm a")}
                {isAdmin && <CheckCheck size={11} className="ml-0.5" />}
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
