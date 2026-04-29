"use client";

import { useRef, useEffect, useState } from "react";
import { useSession } from "@/lib/client/auth-client";
import {
  useSupportThread,
  useSendSupportMessage,
  useSupportChannel,
  type SupportMessage,
} from "@/lib/client/queries/support.queries";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Send, Loader2, MessageSquare } from "lucide-react";
import { format } from "date-fns";

export default function SupportChat() {
  const { data: session } = useSession();
  const { data, isLoading } = useSupportThread("");
  const sendMessage = useSendSupportMessage("", "");
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const conversationId = data?.conversation._id;

  useSupportChannel(conversationId, ["support-thread", ""]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages]);

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || sendMessage.isPending) return;
    setInput("");
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
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const currentUserId = session?.user.id;

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {!data?.messages.length && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground py-16">
            <MessageSquare className="h-10 w-10 opacity-30" />
            <p className="text-sm">
              Send a message to start chatting with support.
            </p>
          </div>
        )}

        {data?.messages.map((msg) => (
          <MessageBubble
            key={msg._id}
            message={msg}
            isOwn={msg.senderId === currentUserId || msg.senderId === "me"}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t px-4 py-3 flex gap-2 items-end">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send)"
          rows={2}
          className="resize-none flex-1"
          maxLength={2000}
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!input.trim() || sendMessage.isPending}
        >
          {sendMessage.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  isOwn,
}: {
  message: SupportMessage;
  isOwn: boolean;
}) {
  const isAdmin = message.senderRole === "admin";

  return (
    <div className={cn("flex flex-col gap-1", isOwn ? "items-end" : "items-start")}>
      <span className="text-[11px] text-muted-foreground px-1">
        {isAdmin ? "Support" : message.senderName}
      </span>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words",
          isOwn
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted text-foreground rounded-bl-sm",
        )}
      >
        {message.content}
      </div>
      <span className="text-[10px] text-muted-foreground/60 px-1">
        {format(new Date(message.createdAt), "hh:mm a")}
      </span>
    </div>
  );
}
