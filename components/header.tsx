// // "use client";

// // import React from "react";
// // import Image from "next/image";
// // import Link from "next/link";
// // import { Menu, X } from "lucide-react";
// // import { Button } from "@/components/ui/button";
// // import { ModeToggle } from "@/components/theme-toggle";

// // interface HeaderProps {
// //   isMenuOpen: boolean;
// //   setIsMenuOpen: (isOpen: boolean) => void;
// //   isDocsPage?: boolean; // ← pass true from docs/legal layouts
// // }

// // export default function Header({
// //   isMenuOpen,
// //   setIsMenuOpen,
// //   isDocsPage = false,
// // }: HeaderProps) {
// //   const navItems = [
// //     { name: "Home", href: "/" },
// //     { name: "Properties", href: "/properties" },
// //     { name: "Features", href: "#features" },
// //     { name: "Contact", href: "#contact" },
// //   ];

// //   return (
// //     <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
// //       <nav>
// //         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
// //           <div className="flex h-20 items-center justify-between">
// //             <Link href="/" className="flex items-center gap-2">
// //               <Image
// //                 src="/home-logo.png"
// //                 alt="Awaas Hub Logo"
// //                 width={40}
// //                 height={40}
// //                 className="h-10 w-auto"
// //                 priority
// //               />
// //               <span className="sr-only">Awaas Hub</span>
// //             </Link>

// //             <div className="hidden md:flex items-center gap-8">
// //               {!isDocsPage &&
// //                 navItems.map((item) => (
// //                   <Link
// //                     key={item.name}
// //                     href={item.href}
// //                     className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
// //                   >
// //                     {item.name}
// //                   </Link>
// //                 ))}

// //               <div className="flex items-center gap-3">
// //                 <Link href="/login">
// //                   <Button variant="outline" className="rounded-full">
// //                     Login
// //                   </Button>
// //                 </Link>
// //                 <Link href="/signup">
// //                   <Button className="rounded-full">Sign Up</Button>
// //                 </Link>
// //                 <ModeToggle />
// //               </div>
// //             </div>

// //             <Button
// //               variant="ghost"
// //               size="icon"
// //               className="md:hidden"
// //               onClick={() => setIsMenuOpen(!isMenuOpen)}
// //             >
// //               {isMenuOpen ? (
// //                 <X className="h-5 w-5" />
// //               ) : (
// //                 <Menu className="h-5 w-5" />
// //               )}
// //             </Button>
// //           </div>

// //           {isMenuOpen && (
// //             <div className="md:hidden border-t border-border py-4">
// //               {!isDocsPage && (
// //                 <div className="space-y-3 px-4">
// //                   {navItems.map((item) => (
// //                     <Link
// //                       key={item.name}
// //                       href={item.href}
// //                       onClick={() => setIsMenuOpen(false)}
// //                       className="block text-sm font-medium text-muted-foreground hover:text-foreground"
// //                     >
// //                       {item.name}
// //                     </Link>
// //                   ))}
// //                 </div>
// //               )}

// //               <div className="px-4 pt-3 space-y-2">
// //                 <Link href="/login" onClick={() => setIsMenuOpen(false)}>
// //                   <Button variant="outline" className="w-full rounded-full">
// //                     Login
// //                   </Button>
// //                 </Link>
// //                 <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
// //                   <Button className="w-full rounded-full">Sign Up</Button>
// //                 </Link>
// //               </div>
// //             </div>
// //           )}
// //         </div>
// //       </nav>
// //     </header>
// //   );
// // }

// "use client";

// import React from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { Menu, X } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { ModeToggle } from "@/components/theme-toggle";

// interface HeaderProps {
//   isMenuOpen: boolean;
//   setIsMenuOpen: (isOpen: boolean) => void;
//   isDocsPage?: boolean; // ← pass true from docs/legal layouts
// }

// export default function Header({
//   isMenuOpen,
//   setIsMenuOpen,
//   isDocsPage = false,
// }: HeaderProps) {
//   const navItems = [
//     { name: "Home", href: "/" },
//     { name: "Properties", href: "/properties" },
//     { name: "Features", href: "#features" },
//     { name: "Contact", href: "#contact" },
//   ];

//   return (
//     <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
//       <nav>
//         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//           <div className="flex h-20 items-center justify-between">
//             <Link href="/" className="flex items-center gap-2">
//               <Image
//                 src="/home-logo.png"
//                 alt="Awaas Hub Logo"
//                 width={40}
//                 height={40}
//                 className="h-10 w-auto"
//                 priority
//               />
//               <span className="sr-only">Awaas Hub</span>
//             </Link>

//             <div className="hidden md:flex items-center gap-8">
//               {!isDocsPage &&
//                 navItems.map((item) => (
//                   <Link
//                     key={item.name}
//                     href={item.href}
//                     className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
//                   >
//                     {item.name}
//                   </Link>
//                 ))}

//               <div className="flex items-center gap-3">
//                 <Button asChild variant="outline" className="dark:text-white">
//                   <Link href="/login">Login</Link>
//                 </Button>

//                 <Button asChild className="rounded-full">
//                   <Link href="/signup">Sign Up</Link>
//                 </Button>
//                 <ModeToggle />
//               </div>
//             </div>

//             <Button
//               variant="ghost"
//               size="icon"
//               className="md:hidden"
//               onClick={() => setIsMenuOpen(!isMenuOpen)}
//             >
//               {isMenuOpen ? (
//                 <X className="h-5 w-5" />
//               ) : (
//                 <Menu className="h-5 w-5" />
//               )}
//             </Button>
//           </div>

//           {isMenuOpen && (
//             <div className="md:hidden border-t border-border py-4">
//               {!isDocsPage && (
//                 <div className="space-y-3 px-4">
//                   {navItems.map((item) => (
//                     <Link
//                       key={item.name}
//                       href={item.href}
//                       onClick={() => setIsMenuOpen(false)}
//                       className="block text-sm font-medium text-muted-foreground hover:text-foreground"
//                     >
//                       {item.name}
//                     </Link>
//                   ))}
//                 </div>
//               )}

//               <div className="px-4 pt-3 space-y-2">
//                 <Link href="/login" onClick={() => setIsMenuOpen(false)}>
//                   <Button variant="outline" className="w-full rounded-full">
//                     Login
//                   </Button>
//                 </Link>
//                 <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
//                   <Button className="w-full rounded-full">Sign Up</Button>
//                 </Link>
//               </div>
//             </div>
//           )}
//         </div>
//       </nav>
//     </header>
//   );
// }

"use client";

import Link from "next/link";
import { useLanguage } from "@/hooks/use-language";
import LanguageSwitcher from "./language-switcher";
import { Button } from "@/components/ui/button";
import { Menu, X, Home } from "lucide-react";
import { ModeToggle } from "./theme-toggle";
import Image from "next/image";

interface HeaderProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
}

export default function Header({ isMenuOpen, setIsMenuOpen }: HeaderProps) {
  const { t } = useLanguage();

  const navLinks = [
    { name: t("nav.home") as string, href: "/" },
    { name: t("nav.properties") as string, href: "/properties" },
    { name: t("nav.about") as string, href: "/about" },
    { name: t("nav.blog") as string, href: "/blog" },
    { name: t("nav.contact") as string, href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/home-logo.png"
              alt="Awaas Hub Logo"
              width={40}
              height={40}
              className="h-10 w-auto"
              priority
            />
            <span className="sr-only">Awaas Hub</span>
          </Link>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex justify-center"></div>
          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <ModeToggle />
            <LanguageSwitcher />

            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">{t("nav.login")}</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">{t("nav.register")}</Link>
              </Button>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex gap-2 pt-4 border-t border-border">
                <Button variant="outline" className="flex-1" asChild>
                  <Link href="/login">{t("nav.login")}</Link>
                </Button>
                <Button className="flex-1" asChild>
                  <Link href="/register">{t("nav.register")}</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
