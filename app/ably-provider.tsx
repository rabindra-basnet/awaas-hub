"use client";

import { Realtime } from "ably";
import { AblyProvider as Provider } from "ably/react";

const client = new Realtime({
  authUrl: "/api/ably/token",
});

export default function AblyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Provider client={client}>{children}</Provider>;
}
