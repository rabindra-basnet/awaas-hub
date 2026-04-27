"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/client/query-client";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AnonymousProvider } from "./guest-provider";
import AblyProvider from "./ably-provider";

export default function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Wrap singleton in useState so it isn't re-created on every render
  const [qc] = useState(() => queryClient);

  return (
    <>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <QueryClientProvider client={qc}>
          <Toaster />
          {/*<AnonymousProvider>*/}
          {/* <AblyProvider> */}
          {children}
          {/* </AblyProvider> */}
          {/*</AnonymousProvider>*/}
        </QueryClientProvider>
      </ThemeProvider>
    </>
  );
}
