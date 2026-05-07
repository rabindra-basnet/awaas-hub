import Link from "next/link";
import { Building2 } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — branding panel, hidden on mobile */}
      <div className="hidden lg:flex flex-col relative bg-primary text-primary-foreground overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary-foreground/10 via-transparent to-transparent" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative flex flex-col h-full p-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 font-bold text-xl w-fit">
            <div className="w-8 h-8 rounded-lg bg-primary-foreground/15 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            AawasHub
          </Link>

          {/* Center content */}
          <div className="flex-1 flex flex-col justify-center space-y-6 max-w-sm">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold leading-tight">
                Nepal&apos;s modern real estate platform
              </h1>
              <p className="text-primary-foreground/70 leading-relaxed">
                Browse verified properties, connect with owners, and close deals — all in one place.
              </p>
            </div>

            <div className="space-y-3">
              {[
                "Verified property listings across Nepal",
                "Direct chat with property owners",
                "Schedule viewings and inspections",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary-foreground/20 flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-sm text-primary-foreground/80">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="relative text-xs text-primary-foreground/40">
            © {new Date().getFullYear()} AawasHub. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex flex-col min-h-screen lg:min-h-0">
        {/* Mobile logo */}
        <div className="flex items-center justify-between p-6 lg:hidden border-b border-border">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Building2 className="w-5 h-5 text-primary" />
            AawasHub
          </Link>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
