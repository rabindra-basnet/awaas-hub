"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/theme-toggle";

interface HeaderProps {
    isMenuOpen: boolean;
    setIsMenuOpen: (isOpen: boolean) => void;
    isDocsPage?: boolean; // ← pass true from docs/legal layouts
}

export default function Header({ isMenuOpen, setIsMenuOpen, isDocsPage = false }: HeaderProps) {
    const navItems = [
        { name: "Home", href: "/" },
        { name: "Properties", href: "#properties" },
        { name: "Features", href: "#features" },
        { name: "Contact", href: "#contact" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
            <nav>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-20 items-center justify-between">
                        <Link href="/" className="flex items-center gap-2">
                            <Image src="/home-logo.png" alt="Awaas Hub Logo" width={40} height={40} className="h-10 w-auto" priority />
                            <span className="sr-only">Awaas Hub</span>
                        </Link>

                        <div className="hidden md:flex items-center gap-8">
                            {!isDocsPage &&
                                navItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {item.name}
                                    </Link>
                                ))}

                            <div className="flex items-center gap-3">
                                <Link href="/login"><Button variant="outline" className="rounded-full">Login</Button></Link>
                                <Link href="/signup"><Button className="rounded-full">Sign Up</Button></Link>
                                <ModeToggle />
                            </div>
                        </div>

                        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>

                    {isMenuOpen && (
                        <div className="md:hidden border-t border-border py-4">
                            {!isDocsPage && (
                                <div className="space-y-3 px-4">
                                    {navItems.map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setIsMenuOpen(false)}
                                            className="block text-sm font-medium text-muted-foreground hover:text-foreground"
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                            )}

                            <div className="px-4 pt-3 space-y-2">
                                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                                    <Button variant="outline" className="w-full rounded-full">Login</Button>
                                </Link>
                                <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                                    <Button className="w-full rounded-full">Sign Up</Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </nav>
        </header>
    );
}