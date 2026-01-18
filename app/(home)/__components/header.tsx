// "use client";

// import React, { useRef } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { Menu, X } from "lucide-react";
// import { Button } from "@/components/ui/button";

// interface HeaderProps {
//     isMenuOpen: boolean;
//     setIsMenuOpen: (isOpen: boolean) => void;
// }

// const Header: React.FC<HeaderProps> = ({ isMenuOpen, setIsMenuOpen }) => {
//     const navItems = [
//         { name: "Home", href: "/" },
//         { name: "Properties", href: "#properties" },
//         { name: "Features", href: "#features" },
//         { name: "Contact", href: "#contact" },
//     ];

//     return (
//         <header className="sticky top-0 z-50 w-full bg-linear-to-r from-orange-500/95 via-orange-500/95 to-red-400/95">
//             <nav className="bg-white/95 backdrop-blur-sm">
//                 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//                     <div className="flex h-20 items-center justify-between">
//                         {/* Logo */}
//                         <Link href="/" className="flex items-center space-x-2">
//                             <Image
//                                 src="/home-logo.png"
//                                 alt="Awaas Hub - Secure Property Management System Logo"
//                                 width={40}
//                                 height={40}
//                                 className="h-18 w-auto"
//                                 priority
//                             />
//                         </Link>

//                         {/* Desktop Menu */}
//                         <div className="hidden md:flex items-center space-x-8">
//                             {navItems.map((item) => (
//                                 <Link
//                                     key={item.name}
//                                     href={item.href}
//                                     className="text-gray-700 hover:text-orange-600 transition font-medium"
//                                 >
//                                     {item.name}
//                                 </Link>
//                             ))}

//                             {/* Auth buttons */}
//                             <div className="flex items-center space-x-3">
//                                 <Link href="/login">
//                                     <Button variant="outline" className="rounded-full">
//                                         Login
//                                     </Button>
//                                 </Link>

//                                 <Link href="/signup">
//                                     <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full">
//                                         Sign Up
//                                     </Button>
//                                 </Link>
//                             </div>
//                         </div>

//                         {/* Mobile Menu Button */}
//                         <Button
//                             onClick={() => setIsMenuOpen(!isMenuOpen)}
//                             variant="ghost"
//                             className="md:hidden"
//                         >
//                             {isMenuOpen ? (
//                                 <X className="h-6 w-6" />
//                             ) : (
//                                 <Menu className="h-6 w-6" />
//                             )}
//                         </Button>
//                     </div>

//                     {/* Mobile Menu */}
//                     {isMenuOpen && (
//                         <div className="md:hidden border-t border-gray-200 py-4 space-y-3">
//                             {navItems.map((item) => (
//                                 <Link
//                                     key={item.name}
//                                     href={item.href}
//                                     onClick={() => setIsMenuOpen(false)}
//                                     className="block px-4 py-2 text-gray-700 hover:text-orange-600 font-medium transition"
//                                 >
//                                     {item.name}
//                                 </Link>
//                             ))}

//                             {/* Mobile Auth buttons */}
//                             <div className="px-4 pt-3 space-y-2">
//                                 <Link href="/login" onClick={() => setIsMenuOpen(false)}>
//                                     <Button variant="outline" className="w-full rounded-full">
//                                         Login
//                                     </Button>
//                                 </Link>

//                                 <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
//                                     <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-full">
//                                         Sign Up
//                                     </Button>
//                                 </Link>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </nav>
//         </header>
//     );
// };

// export default Header;

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
}

const Header: React.FC<HeaderProps> = ({ isMenuOpen, setIsMenuOpen }) => {
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

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center gap-8">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {item.name}
                                </Link>
                            ))}

                            {/* Auth buttons */}
                            <div className="flex items-center gap-3">
                                <Link href="/login">
                                    <Button variant="outline" className="rounded-full">
                                        Login
                                    </Button>
                                </Link>

                                <Link href="/signup">
                                    <Button className="rounded-full">
                                        Sign Up
                                    </Button>
                                </Link>
                                <ModeToggle />
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>

                    {/* Mobile Menu */}
                    {isMenuOpen && (
                        <div className="md:hidden border-t border-border py-4 space-y-3">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {item.name}
                                </Link>
                            ))}

                            <div className="px-4 pt-3 space-y-2">
                                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                                    <Button variant="outline" className="w-full rounded-full">
                                        Login
                                    </Button>
                                </Link>

                                <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                                    <Button className="w-full rounded-full">
                                        Sign Up
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;

