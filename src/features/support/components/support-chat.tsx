"use client";

import { useSupportThread, useSendSupportMessage } from "@/features/support/queries/support.queries";
import { useRef, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { toast } from "sonner";
import { Send, MessageCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function SupportChat() {
  const { data } = useSupportThread();
  const send = useSendSupportMessage();
  const [msg, setMsg] = useState("");

  const messages: any[] = data?.messages ?? [];

  const handleSend = () => {
    if (!msg.trim()) return;
    const content = msg.trim();
    setMsg("");
    send.mutate(content, {
      onError: (e) => toast.error(e.message),
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 h-full flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Support</h1>
        <p className="text-sm text-muted-foreground mt-1">Chat with our support team</p>
      </div>

      <div className="flex-1 rounded-xl border border-border bg-card overflow-hidden flex flex-col min-h-[400px]">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
              <MessageCircle className="w-10 h-10 opacity-20" />
              <p className="text-sm">Start a conversation with support</p>
            </div>
          ) : (
            messages.map((m: any) => (
              <div key={m._id} className={`flex ${m.senderRole === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                  m.senderRole === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted rounded-bl-sm"
                }`}>
                  <p>{m.content}</p>
                  <p className={`text-[10px] mt-1 ${m.senderRole === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {format(new Date(m.createdAt), "HH:mm")}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-border p-3 flex gap-2">
          <Input
            placeholder="Type your message..."
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            className="flex-1"
          />
          <Button size="icon" onClick={handleSend} disabled={send.isPending || !msg.trim()}>
            {send.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
