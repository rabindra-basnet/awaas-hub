"use client"
import Header from "@/components/header";
import { useState } from "react";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <>
            <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} isDocsPage={true} />
            <main className="min-h-screen bg-background">
                <div className="container max-w-4xl mx-auto py-12 px-6">
                    {children}
                </div>
            </main>
        </>
    );
}