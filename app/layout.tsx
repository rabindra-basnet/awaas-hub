import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
// import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Real Estate Platform",
  description: "Find your perfect home with our modern real estate platform",
 icons: {
    icon: '/favicon.ico',                 // ← this points to public/favicon.ico
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className={`font-sans antialiased`} >
        <Providers>
          {children}
          {/* <Analytics /> */}
        </Providers>
      </body>
    </html>
  );
}