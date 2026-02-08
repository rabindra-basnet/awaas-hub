"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/client/query-client";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AnonymousProvider } from "./guest-provider";

export default function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
          <AnonymousProvider />
          {children}
        </QueryClientProvider>
      </ThemeProvider>
    </>
  );
}
