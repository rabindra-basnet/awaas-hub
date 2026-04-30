"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AnonymousProvider } from "./guest-provider";
import AblyProvider from "./ably-provider";

export default function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // getQueryClient() on the browser always returns the same browserQueryClient
  const queryClient = getQueryClient();

  return (
    <>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <QueryClientProvider client={queryClient}>
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
