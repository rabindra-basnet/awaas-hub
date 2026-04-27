"use client";

import { use, useEffect, useState } from "react";
import { createAblyClient } from "@/lib/ably";
import { useSession } from "@/lib/client/auth-client";

export default function PropertyChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = useSession();

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    let channel: any;

    const init = async () => {
      const client = await createAblyClient();

      channel = client.channels.get(`property:${id}`);

      await channel.subscribe("message", (msg: any) => {
        setMessages((prev) => [...prev, msg.data]);
      });
    };

    init();

    return () => {
      channel?.unsubscribe();
    };
  }, [id]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const client = await createAblyClient();
    const channel = client.channels.get(`property:${id}`);

    const message = {
      senderId: session?.user?.id,
      senderName: session?.user?.name,
      text: input,
      timestamp: new Date().toISOString(),
    };

    await channel.publish("message", message);

    setInput("");
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b font-bold">Property Chat - {id}</div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 rounded-lg w-fit max-w-[70%] ${
              msg.senderId === session?.user?.id
                ? "ml-auto bg-primary text-white"
                : "bg-muted"
            }`}
          >
            <div className="text-xs opacity-70">{msg.senderName}</div>
            <div>{msg.text}</div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t flex gap-2">
        <input
          className="flex-1 border rounded-lg px-3 py-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type message..."
        />
        <button
          onClick={sendMessage}
          className="bg-primary text-white px-4 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
}
