// import React from 'react'
// import Link from 'next/link'
// import { Home } from 'lucide-react'

// const Footer: React.FC = () => {
//     const quickLinks = [
//         { name: 'About Us', href: '/about' },
//         { name: 'Properties', href: '/properties' },
//         // { name: 'Agents', href: '/agents' },
//         { name: 'Blog', href: '/blog' }
//     ]

//     const supportLinks = [
//         // { name: 'Help Center', href: '/help' },
//         { name: 'Contact Us', href: '/contact' },
//         { name: 'Terms of Service', href: '/terms-and-conditions' },
//         { name: 'Privacy Policy', href: '/privacy-policy' }
//     ]

//     return (
//         <footer className="border-t border-border bg-card py-12 px-4 sm:px-6 lg:px-8">
//             <div className="mx-auto max-w-7xl">
//                 <div className="mb-8 grid gap-8 md:grid-cols-4">
//                     {/* Company Info */}
//                     <div>
//                         <div className="mb-4 flex items-center gap-2">
//                             <div className="rounded-lg bg-primary p-2 text-primary-foreground">
//                                 <Home className="h-6 w-6" />
//                             </div>
//                             <span className="text-2xl font-bold text-foreground">
//                                 AawasHub
//                             </span>
//                         </div>
//                         <p className="text-muted-foreground">
//                             Your trusted partner in finding the perfect property in Nepal.
//                         </p>
//                     </div>

//                     {/* Quick Links */}
//                     <div>
//                         <h4 className="mb-4 font-bold text-foreground">
//                             Quick Links
//                         </h4>
//                         <ul className="space-y-2 text-muted-foreground">
//                             {quickLinks.map(link => (
//                                 <li key={link.name}>
//                                     <Link
//                                         href={link.href}
//                                         className="transition hover:text-primary"
//                                     >
//                                         {link.name}
//                                     </Link>
//                                 </li>
//                             ))}
//                         </ul>
//                     </div>

//                     {/* Support */}
//                     <div>
//                         <h4 className="mb-4 font-bold text-foreground">
//                             Support
//                         </h4>
//                         <ul className="space-y-2 text-muted-foreground">
//                             {supportLinks.map(link => (
//                                 <li key={link.name}>
//                                     <Link
//                                         href={link.href}
//                                         className="transition hover:text-primary"
//                                     >
//                                         {link.name}
//                                     </Link>
//                                 </li>
//                             ))}
//                         </ul>
//                     </div>

//                     {/* Contact */}
//                     <div>
//                         <h4 className="mb-4 font-bold text-foreground">
//                             Contact
//                         </h4>
//                         <ul className="space-y-2 text-muted-foreground">
//                             <li>Kathmandu, Nepal</li>
//                             <li>contact@aawashub.com</li>
//                             <li>+977 1 234 5678</li>
//                         </ul>
//                     </div>
//                 </div>

//                 <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
//                     <p>&copy; 2024 AawasHub. All rights reserved.</p>
//                 </div>
//             </div>
//         </footer>
//     )
// }

// export default Footer

"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import Image from "next/image";

export default function Footer() {
  const { t } = useLanguage();

  const quickLinks = [
    { name: t("nav.about"), href: "/about" },
    { name: t("nav.properties"), href: "/properties" },
    { name: t("nav.blog"), href: "/blog" },
  ];

  const supportLinks = [
    { name: t("nav.contact"), href: "/contact" },
    {
      name: t("footer.terms") || "Terms of Service",
      href: "/terms-and-conditions",
    },
    { name: t("footer.privacy") || "Privacy Policy", href: "/privacy-policy" },
  ];

  return (
    <footer className="border-t border-border bg-card py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
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
              <p className="text-muted-foreground">{t("footer.company")}</p>
            </div>
            <p className="text-muted-foreground">{t("footer.tagline")}</p>
          </div>

          <div>
            <h4 className="mb-4 font-bold text-foreground">
              {t("footer.quickLinks")}
            </h4>
            <ul className="space-y-2 text-muted-foreground">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition hover:text-primary"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-bold text-foreground">
              {t("footer.support")}
            </h4>
            <ul className="space-y-2 text-muted-foreground">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition hover:text-primary"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-bold text-foreground">
              {t("footer.contact")}
            </h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>{t("footer.address")}</li>
              <li>{t("footer.email")}</li>
              <li>{t("footer.phone")}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>
            &copy; 2024 {t("footer.company")}. {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
