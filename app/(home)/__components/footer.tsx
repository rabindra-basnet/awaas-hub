import React from 'react'
import Link from 'next/link'
import { Home } from 'lucide-react'

const Footer: React.FC = () => {
    const quickLinks = [
        { name: 'About Us', href: '/about' },
        { name: 'Properties', href: '/properties' },
        // { name: 'Agents', href: '/agents' },
        { name: 'Blog', href: '/blog' }
    ]

    const supportLinks = [
        // { name: 'Help Center', href: '/help' },
        { name: 'Contact Us', href: '/contact' },
        { name: 'Terms of Service', href: '/terms-and-conditions' },
        { name: 'Privacy Policy', href: '/privacy-policy' }
    ]

    return (
        <footer className="border-t border-border bg-card py-12 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 grid gap-8 md:grid-cols-4">
                    {/* Company Info */}
                    <div>
                        <div className="mb-4 flex items-center gap-2">
                            <div className="rounded-lg bg-primary p-2 text-primary-foreground">
                                <Home className="h-6 w-6" />
                            </div>
                            <span className="text-2xl font-bold text-foreground">
                                AawasHub
                            </span>
                        </div>
                        <p className="text-muted-foreground">
                            Your trusted partner in finding the perfect property in Nepal.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="mb-4 font-bold text-foreground">
                            Quick Links
                        </h4>
                        <ul className="space-y-2 text-muted-foreground">
                            {quickLinks.map(link => (
                                <li key={link.name}>
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

                    {/* Support */}
                    <div>
                        <h4 className="mb-4 font-bold text-foreground">
                            Support
                        </h4>
                        <ul className="space-y-2 text-muted-foreground">
                            {supportLinks.map(link => (
                                <li key={link.name}>
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

                    {/* Contact */}
                    <div>
                        <h4 className="mb-4 font-bold text-foreground">
                            Contact
                        </h4>
                        <ul className="space-y-2 text-muted-foreground">
                            <li>Kathmandu, Nepal</li>
                            <li>contact@aawashub.com</li>
                            <li>+977 1 234 5678</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
                    <p>&copy; 2024 AawasHub. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
