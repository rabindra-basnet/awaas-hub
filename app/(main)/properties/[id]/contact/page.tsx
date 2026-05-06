"use client";

import React, { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Crown,
  Lock,
  Mail,
  ShieldCheck,
  BadgeCheck,
  MapPin,
  Phone,
  CalendarCheck,
  Eye,
  EyeOff,
  Sparkles,
  HeadphonesIcon,
  CheckCircle2,
  TrendingUp,
  Home,
  ExternalLink,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/client/auth-client";
import {
  usePropertySeller,
  type SellerProfile,
} from "@/lib/client/queries/seller.queries";
import { useProperty } from "@/lib/client/queries/properties.queries";
import { useUserNotificationsChannel } from "@/lib/client/queries/support.queries";
import PropertyDirectChat from "../../_components/PropertyDirectChat";
import SellerChatInbox from "../../_components/SellerChatInbox";

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ContactPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-20 h-14 border-b border-border/40 bg-background/95 backdrop-blur-xl" />
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-[300px] shrink-0 space-y-4">
            <div className="rounded-3xl h-64 bg-muted/30 animate-pulse" />
            <div className="rounded-3xl h-44 bg-muted/30 animate-pulse" />
            <div className="rounded-3xl h-36 bg-muted/30 animate-pulse" />
          </div>
          <div className="flex-1 rounded-3xl h-[520px] bg-muted/30 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// ── Premium Lock Overlay ──────────────────────────────────────────────────────

function PremiumBlur({ children, locked }: { children: React.ReactNode; locked: boolean }) {
  if (!locked) return <>{children}</>;
  return (
    <div className="relative select-none">
      <div className="blur-sm opacity-30 pointer-events-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="inline-flex items-center gap-1.5 bg-background/90 backdrop-blur border border-amber-400/30 text-amber-600 dark:text-amber-400 rounded-full px-3 py-1 text-[10px] font-bold tracking-wide shadow">
          <Lock size={10} />
          Premium only
        </span>
      </div>
    </div>
  );
}

// ── Seller Hero Card ──────────────────────────────────────────────────────────

function SellerHeroCard({ seller, hasAccess }: { seller: SellerProfile; hasAccess: boolean }) {
  return (
    <div className="rounded-3xl overflow-hidden border border-border/50 shadow-sm">
      {/* Banner */}
      <div className="relative h-20 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, hsl(var(--primary)/0.4) 0%, transparent 60%), radial-gradient(circle at 80% 20%, hsl(var(--primary)/0.2) 0%, transparent 50%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, currentColor 0, currentColor 1px, transparent 0, transparent 8px)",
            backgroundSize: "12px 12px",
          }}
        />
      </div>

      <div className="bg-card px-5 pb-5 -mt-7">
        {/* Avatar + badge */}
        <div className="flex items-end justify-between mb-3">
          <div className="relative">
            <div className="p-0.5 rounded-full bg-gradient-to-br from-primary/60 to-primary/20 shadow-lg">
              <Avatar className="w-14 h-14 border-2 border-card">
                <AvatarImage src={seller.image ?? undefined} />
                <AvatarFallback className="text-base font-black bg-primary/10 text-primary">
                  {seller.initials}
                </AvatarFallback>
              </Avatar>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-card shadow">
              <BadgeCheck size={10} className="text-white" />
            </span>
          </div>

          {hasAccess ? (
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-400/25 rounded-full px-2.5 py-1 text-[10px] font-bold">
              <CheckCircle2 size={10} />
              Unlocked
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-400/25 rounded-full px-2.5 py-1 text-[10px] font-bold">
              <Crown size={10} />
              Premium
            </span>
          )}
        </div>

        {/* Name + meta */}
        <h2 className="text-[15px] font-black text-foreground leading-tight">{seller.name}</h2>
        <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
          <MapPin size={9} className="text-primary/60" />
          AawasHub · Since {seller.memberSince}
        </p>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { n: seller.totalListings, label: "Listings" },
            { n: seller.soldCount, label: "Sold" },
            { n: seller.activeListings, label: "Active" },
          ].map(({ n, label }) => (
            <div
              key={label}
              className="flex flex-col items-center bg-muted/30 rounded-2xl py-2.5 gap-0.5"
            >
              <span className="text-[18px] font-black leading-none tabular-nums text-foreground">
                {n}
              </span>
              <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Verified chips */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {["ID Verified", "Licensed Agent"].map((label) => (
            <span
              key={label}
              className="inline-flex items-center gap-1 text-[9px] font-semibold text-muted-foreground bg-muted/50 border border-border/50 rounded-full px-2 py-0.5"
            >
              <ShieldCheck size={8} className="text-emerald-500" />
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Contact Details Card ──────────────────────────────────────────────────────

function ContactDetailsCard({
  seller,
  hasAccess,
  showPhone,
  setShowPhone,
  id,
}: {
  seller: SellerProfile;
  hasAccess: boolean;
  showPhone: boolean;
  setShowPhone: React.Dispatch<React.SetStateAction<boolean>>;
  id: string;
}) {
  return (
    <div className="rounded-3xl border border-border/50 bg-card shadow-sm overflow-hidden">
      <div className="px-5 pt-4 pb-2 flex items-center justify-between">
        <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
          Contact
        </span>
        <span
          className={cn(
            "text-[9px] font-bold px-2 py-0.5 rounded-full",
            hasAccess
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-amber-500/10 text-amber-600 dark:text-amber-400",
          )}
        >
          {hasAccess ? "Unlocked" : "Locked"}
        </span>
      </div>

      <div className="px-4 pb-4 space-y-2">
        {/* Email row */}
        <PremiumBlur locked={!hasAccess}>
          <a
            href={hasAccess && seller.email ? `mailto:${seller.email}` : undefined}
            className={cn(
              "flex items-center gap-3 rounded-2xl px-3 py-3 border transition-all group",
              hasAccess
                ? "border-border/50 hover:border-primary/30 hover:bg-primary/5 cursor-pointer"
                : "border-border/30 cursor-default",
            )}
          >
            <span className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
              <Mail size={14} className="text-orange-500" />
            </span>
            <span className="flex-1 min-w-0">
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">
                Email
              </p>
              <p className="text-[12px] font-semibold text-foreground truncate mt-0.5">
                {hasAccess && seller.email ? seller.email : "••••••@•••••.com"}
              </p>
            </span>
            {hasAccess && (
              <ExternalLink size={12} className="text-muted-foreground/50 group-hover:text-primary transition-colors" />
            )}
          </a>
        </PremiumBlur>

        {/* Phone row */}
        <PremiumBlur locked={!hasAccess}>
          <button
            onClick={() => hasAccess && setShowPhone((v) => !v)}
            className={cn(
              "w-full flex items-center gap-3 rounded-2xl px-3 py-3 border transition-all text-left",
              hasAccess
                ? "border-border/50 hover:border-primary/30 hover:bg-primary/5 cursor-pointer"
                : "border-border/30 cursor-default",
            )}
          >
            <span className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
              <Phone size={14} className="text-emerald-500" />
            </span>
            <span className="flex-1 min-w-0">
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">
                Phone
              </p>
              <p className="text-[12px] font-semibold text-foreground mt-0.5">
                {hasAccess && showPhone ? "Send a message below" : "+977 98•-•••-••••"}
              </p>
            </span>
            {hasAccess && (
              showPhone ? <EyeOff size={12} className="text-muted-foreground/50" /> : <Eye size={12} className="text-muted-foreground/50" />
            )}
          </button>
        </PremiumBlur>

        {/* Book visit */}
        <button
          onClick={() => (window.location.href = `/appointments/new?propertyId=${id}`)}
          className="w-full flex items-center gap-3 rounded-2xl px-3 py-3 border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all text-left group"
        >
          <span className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <CalendarCheck size={14} className="text-primary" />
          </span>
          <span className="flex-1">
            <p className="text-[11px] font-bold text-foreground">Schedule a Visit</p>
            <p className="text-[9px] text-muted-foreground mt-0.5">Book in-person appointment</p>
          </span>
          <span className="text-[10px] font-bold text-primary bg-primary/10 group-hover:bg-primary/20 px-2.5 py-1 rounded-full transition-all">
            Book
          </span>
        </button>
      </div>
    </div>
  );
}

// ── Seller Stats Card ─────────────────────────────────────────────────────────

function SellerStatsCard({
  seller,
  hasAccess,
  onUpgrade,
}: {
  seller: SellerProfile;
  hasAccess: boolean;
  onUpgrade: () => void;
}) {
  const soldPct = seller.totalListings > 0
    ? Math.round((seller.soldCount / seller.totalListings) * 100)
    : 0;
  const activePct = seller.totalListings > 0
    ? Math.round((seller.activeListings / seller.totalListings) * 100)
    : 0;

  return (
    <div className="rounded-3xl border border-border/50 bg-card shadow-sm overflow-hidden">
      <div className="px-5 pt-4 pb-2">
        <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <TrendingUp size={11} className="text-primary" />
          Performance
        </span>
      </div>

      <div className="px-5 pb-4 space-y-3">
        {/* Bar rows */}
        {[
          { label: "Sold Rate", pct: soldPct, color: "bg-rose-500", track: "bg-rose-100 dark:bg-rose-950/40" },
          { label: "Active Rate", pct: activePct, color: "bg-emerald-500", track: "bg-emerald-100 dark:bg-emerald-950/40" },
        ].map(({ label, pct, color, track }) => (
          <div key={label}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground">{label}</span>
              <span className="text-[11px] font-black text-foreground tabular-nums">{pct}%</span>
            </div>
            <div className={cn("h-1.5 rounded-full overflow-hidden", track)}>
              <div
                className={cn("h-full rounded-full transition-all duration-700", color)}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        ))}

        {/* Rows */}
        <div className="pt-1 space-y-0 rounded-2xl border border-border/40 overflow-hidden">
          {[
            { label: "Member since", value: seller.memberSince },
            { label: "Total listings", value: seller.totalListings },
          ].map(({ label, value }, i, arr) => (
            <div
              key={label}
              className={cn(
                "flex items-center justify-between px-3.5 py-2.5 text-[11px]",
                i % 2 === 0 ? "bg-muted/20" : "bg-transparent",
                i < arr.length - 1 && "border-b border-border/30",
              )}
            >
              <span className="text-muted-foreground font-medium">{label}</span>
              <span className="font-bold text-foreground">{value}</span>
            </div>
          ))}
        </div>

        {!hasAccess && (
          <div className="rounded-2xl border border-amber-400/30 bg-amber-50/50 dark:bg-amber-950/20 p-3.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 mt-0.5">
              <Crown size={13} className="text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400">Premium Access</p>
              <p className="text-[10px] text-amber-600/70 dark:text-amber-500/70 mt-0.5 leading-relaxed">
                Unlock full contact details and direct email.
              </p>
              <button
                onClick={onUpgrade}
                className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-bold text-white bg-amber-500 hover:bg-amber-600 px-3 py-1.5 rounded-full transition-colors"
              >
                <Sparkles size={10} />
                Upgrade now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ContactPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();

  const { data, isLoading, isError } = usePropertySeller(id, !!session);
  const { data: property } = useProperty(id);

  const [showPhone, setShowPhone] = useState(false);

  useUserNotificationsChannel(session?.user?.id || undefined);

  if (isLoading) return <ContactPageSkeleton />;

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto">
            <Home size={20} className="text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Unable to load seller details</p>
            <p className="text-xs text-muted-foreground mt-1">Something went wrong. Please try again.</p>
          </div>
          <Button variant="outline" size="sm" className="rounded-full gap-2" onClick={() => router.push(`/properties/${id}`)}>
            <ArrowLeft size={14} />
            Back to property
          </Button>
        </div>
      </div>
    );
  }

  const { seller, hasAccess } = data;
  const propertyTitle = property?.title ?? "";
  const currentUserId = session?.user?.id ?? "";

  return (
    <div className="min-h-screen bg-background">
      {/* Soft ambient background */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-30 dark:opacity-15"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 30% -10%, hsl(var(--primary)/0.12), transparent), radial-gradient(ellipse 60% 40% at 80% 90%, hsl(var(--primary)/0.06), transparent)",
        }}
      />

      {/* Top nav */}
      <div className="sticky top-0 z-30 border-b border-border/40 bg-background/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-14 flex items-center gap-3">
          <button
            onClick={() => router.push(`/properties/${id}`)}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted/60 transition-colors shrink-0"
          >
            <ArrowLeft size={16} className="text-foreground" />
          </button>

          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <Avatar className="w-7 h-7 shrink-0">
              <AvatarImage src={seller.image ?? undefined} />
              <AvatarFallback className="text-[10px] font-black bg-primary/10 text-primary">
                {seller.initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-bold leading-tight truncate">{seller.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">
                #{id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            {hasAccess ? (
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-400/25 rounded-full px-2.5 py-1 text-[10px] font-bold">
                <ShieldCheck size={9} />
                Access Granted
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-400/25 rounded-full px-2.5 py-1 text-[10px] font-bold">
                <Crown size={9} />
                Premium
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-5 items-start">

          {/* ── Left sidebar ── */}
          <div className="w-full lg:w-[290px] shrink-0 space-y-4">
            <SellerHeroCard seller={seller} hasAccess={hasAccess} />
            <ContactDetailsCard
              seller={seller}
              hasAccess={hasAccess}
              showPhone={showPhone}
              setShowPhone={setShowPhone}
              id={id}
            />
            <SellerStatsCard
              seller={seller}
              hasAccess={hasAccess}
              onUpgrade={() => router.push(`/properties/${id}`)}
            />
          </div>

          {/* ── Chat panel ── */}
          {(data.isOwner || data.isAdmin) ? (
            <SellerChatInbox
              propertyId={id}
              currentUserId={currentUserId}
              isAdmin={data.isAdmin}
              isOwner={data.isOwner}
            />
          ) : (
            <div className="flex-1 min-w-0 w-full rounded-3xl border border-border/50 overflow-hidden bg-card shadow-sm flex flex-col lg:sticky lg:top-[72px]">
              {/* Chat header */}
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border/40 bg-muted/20 shrink-0">
                <div className="relative">
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={seller.image ?? undefined} />
                    <AvatarFallback className="text-[11px] font-black bg-primary/10 text-primary">
                      {seller.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-card" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold leading-tight">
                    {seller.name.split(" ")[0]}
                  </p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <HeadphonesIcon size={9} />
                    Direct message · replies within 24h
                  </p>
                </div>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
              </div>

              {/* Chat body */}
              <PropertyDirectChat
                propertyId={id}
                sellerId={seller.id}
                sellerName={seller.name}
                propertyTitle={propertyTitle}
                currentUserId={currentUserId}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
