"use client";

import React, { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Crown,
  Lock,
  Mail,
  MessageCircle,
  Send,
  ShieldCheck,
  BadgeCheck,
  MapPin,
  Zap,
  Phone,
  CalendarCheck,
  ChevronRight,
  Eye,
  EyeOff,
  Sparkles,
  BarChart3,
  Contact,
  Building2,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/client/auth-client";
import { usePropertySeller, type SellerProfile } from "@/lib/client/queries/seller.queries";

// ── Shared helpers ────────────────────────────────────────────────

function StatItem({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 flex-1">
      <span className="text-lg font-black text-foreground leading-none">{value}</span>
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

function PremiumBlur({ children, locked }: { children: React.ReactNode; locked: boolean }) {
  if (!locked) return <>{children}</>;
  return (
    <div className="relative select-none">
      <div className="blur-sm opacity-40 pointer-events-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-center gap-1.5 bg-background/80 backdrop-blur-md border border-border/60 rounded-full px-3 py-1.5 shadow-lg">
          <Lock size={11} className="text-amber-500" />
          <span className="text-[11px] font-bold text-muted-foreground">Premium only</span>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────

function ContactPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-[95vw] mx-auto px-4 lg:px-6 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-4 w-32 rounded bg-muted animate-pulse" />
            <div className="h-3 w-20 rounded bg-muted animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-border/60 h-80 bg-muted/20 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Card 1 — Seller Profile ───────────────────────────────────────

function SellerProfileCard({
  seller,
  hasAccess,
}: {
  seller: SellerProfile;
  hasAccess: boolean;
}) {
  return (
    <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden h-full flex flex-col">
      {/* decorative header strip */}
      <div className="h-14 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent relative shrink-0">
        <div
          className="absolute inset-0 opacity-20 dark:opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, hsl(var(--primary)/0.3) 0, hsl(var(--primary)/0.3) 1px, transparent 0, transparent 50%)",
            backgroundSize: "8px 8px",
          }}
        />
      </div>

      <CardContent className="px-5 pb-5 -mt-7 flex flex-col flex-1">
        {/* Avatar */}
        <div className="flex items-end justify-between mb-3">
          <div className="relative">
            <Avatar className="w-14 h-14 border-[3px] border-background shadow-lg">
              <AvatarImage src={seller.image ?? undefined} />
              <AvatarFallback className="text-sm font-black bg-primary/10 text-primary">
                {seller.initials}
              </AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-[3px] border-2 border-background">
              <BadgeCheck size={9} className="text-white" />
            </span>
          </div>
          <Badge variant="outline" className="text-[10px] font-bold capitalize px-2 py-0.5">
            {seller.role}
          </Badge>
        </div>

        {/* Name */}
        <div className="mb-0.5 flex items-center gap-1.5 flex-wrap">
          <h2 className="text-sm font-black text-foreground">{seller.name}</h2>
        </div>

        {/* Member since */}
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-3 flex-wrap">
          <MapPin size={10} className="text-destructive shrink-0" />
          AawasHub
          <span className="mx-1">·</span>
          Member since {seller.memberSince}
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap gap-1 mb-3">
          {[
            hasAccess ? "Access Granted" : "Verified Agent",
            "ID Verified",
          ].map((b) => (
            <Badge key={b} variant="outline" className="text-[9px] gap-1 font-semibold px-1.5 py-0.5">
              <ShieldCheck size={9} className="text-green-500" />
              {b}
            </Badge>
          ))}
        </div>

        <Separator className="mb-3" />

        {/* Stats row */}
        <div className="flex gap-2 divide-x divide-border">
          <StatItem value={seller.totalListings} label="Listings" />
          <StatItem value={seller.soldCount} label="Sold" />
          <StatItem value={seller.activeListings} label="Active" />
        </div>
      </CardContent>
    </Card>
  );
}

// ── Card 2 — Contact Methods ──────────────────────────────────────

function ContactMethodsCard({
  seller,
  hasAccess,
  showPhone,
  setShowPhone,
  onMessageClick,
  id,
}: {
  seller: SellerProfile;
  hasAccess: boolean;
  showPhone: boolean;
  setShowPhone: React.Dispatch<React.SetStateAction<boolean>>;
  onMessageClick: () => void;
  id: string;
}) {
  return (
    <Card className="rounded-2xl border-border/60 shadow-sm h-full flex flex-col">
      <CardHeader className="px-5 pt-5 pb-3 shrink-0">
        <CardTitle className="text-sm font-black flex items-center gap-2">
          <Contact size={15} className="text-primary" />
          Contact Options
        </CardTitle>
      </CardHeader>

      <CardContent className="px-5 pb-5 flex flex-col gap-3 flex-1">
        {/* Access indicator */}
        <div className={cn(
          "flex items-center gap-2 rounded-xl px-3 py-2 border",
          hasAccess
            ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900/60"
            : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60",
        )}>
          <Zap size={13} className={cn(
            "shrink-0",
            hasAccess ? "text-green-600 dark:text-green-400" : "text-amber-500",
          )} />
          <p className={cn(
            "text-[10px] font-semibold",
            hasAccess ? "text-green-700 dark:text-green-400" : "text-amber-700 dark:text-amber-400",
          )}>
            {hasAccess
              ? "Full contact details unlocked"
              : "Upgrade to access contact details"}
          </p>
        </div>

        {/* In-app Message */}
        <button
          disabled={!hasAccess}
          onClick={() => hasAccess && onMessageClick()}
          className={cn(
            "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left group",
            hasAccess
              ? "border-border bg-card hover:border-primary/50 hover:bg-primary/5 active:scale-[0.98] cursor-pointer"
              : "border-border/50 bg-muted/30 cursor-not-allowed opacity-70",
          )}
        >
          <span className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <MessageCircle size={16} />
          </span>
          <span className="flex-1 min-w-0">
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mb-0.5">
              In-app Message
            </p>
            <p className="text-[12px] font-bold text-foreground">Send a direct message</p>
          </span>
          {hasAccess ? (
            <ChevronRight size={15} className="text-muted-foreground group-hover:text-primary transition-colors" />
          ) : (
            <Lock size={12} className="text-amber-500 shrink-0" />
          )}
        </button>

        {/* Email */}
        <div className={cn("rounded-xl border overflow-hidden", hasAccess ? "border-border" : "border-border/50")}>
          <PremiumBlur locked={!hasAccess}>
            <a
              href={hasAccess && seller.email ? `mailto:${seller.email}` : undefined}
              className={cn(
                "flex items-center gap-3 p-3 bg-card transition-all text-left group",
                hasAccess ? "hover:bg-orange-50 dark:hover:bg-orange-950/20 cursor-pointer" : "cursor-default",
              )}
            >
              <span className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-500 flex items-center justify-center shrink-0">
                <Mail size={16} />
              </span>
              <span className="flex-1 min-w-0">
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mb-0.5">
                  Email
                </p>
                <p className="text-[12px] font-bold text-foreground truncate">
                  {hasAccess && seller.email ? seller.email : "••••••@email.com"}
                </p>
              </span>
              {hasAccess ? (
                <ChevronRight size={15} className="text-muted-foreground group-hover:text-orange-500 transition-colors" />
              ) : (
                <Lock size={12} className="text-amber-500 shrink-0" />
              )}
            </a>
          </PremiumBlur>
        </div>

        {/* Phone — not stored in schema, show placeholder */}
        <div className="rounded-xl border border-border/50 overflow-hidden">
          <PremiumBlur locked={!hasAccess}>
            <div
              className={cn("flex items-center gap-3 p-3 bg-card", hasAccess ? "cursor-pointer" : "cursor-default")}
              onClick={() => hasAccess && setShowPhone((v) => !v)}
            >
              <span className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Phone size={16} />
              </span>
              <span className="flex-1 min-w-0">
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mb-0.5">
                  Phone
                </p>
                <p className="text-[12px] font-bold text-foreground">
                  {hasAccess
                    ? showPhone
                      ? "Contact via message"
                      : "+977 98•-•••-••••"
                    : "+977 98•-•••-••••"}
                </p>
              </span>
              {hasAccess ? (
                showPhone ? (
                  <EyeOff size={13} className="text-muted-foreground" />
                ) : (
                  <Eye size={13} className="text-muted-foreground" />
                )
              ) : (
                <Lock size={12} className="text-amber-500 shrink-0" />
              )}
            </div>
          </PremiumBlur>
        </div>

        {/* Book visit */}
        <div className="mt-auto pt-1">
          <Card className="rounded-xl border-primary/20 bg-primary/5">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <CalendarCheck size={15} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-bold text-foreground">Schedule a Site Visit</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">Book in-person appointment</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="text-[10px] font-bold h-7 rounded-lg border-primary/30 px-2.5"
                onClick={() => (window.location.href = `/appointments/new?propertyId=${id}`)}
              >
                Book
              </Button>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Card 3 — Seller Stats + Premium Gate ─────────────────────────

function SellerStatsCard({
  seller,
  hasAccess,
  onUpgrade,
}: {
  seller: SellerProfile;
  hasAccess: boolean;
  onUpgrade: () => void;
}) {
  const rows = [
    { label: "Member since", value: seller.memberSince },
    { label: "Total listings", value: seller.totalListings },
    { label: "Properties sold", value: seller.soldCount, highlight: true },
    { label: "Currently booked", value: seller.bookedCount },
    { label: "Active listings", value: seller.activeListings },
  ];

  const soldPct = seller.totalListings > 0
    ? Math.round((seller.soldCount / seller.totalListings) * 100)
    : 0;

  const activePct = seller.totalListings > 0
    ? Math.round((seller.activeListings / seller.totalListings) * 100)
    : 0;

  return (
    <Card className="rounded-2xl border-border/60 shadow-sm h-full flex flex-col">
      <CardHeader className="px-5 pt-5 pb-3 shrink-0">
        <CardTitle className="text-sm font-black flex items-center gap-2">
          <BarChart3 size={15} className="text-primary" />
          Seller Stats
        </CardTitle>
      </CardHeader>

      <CardContent className="px-5 pb-5 flex flex-col gap-3 flex-1">
        <div className="space-y-2">
          {rows.map((row, i, arr) => (
            <React.Fragment key={row.label}>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-muted-foreground font-medium">{row.label}</span>
                <span className={cn(
                  "text-[11px] font-bold",
                  (row as any).highlight
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-foreground",
                )}>
                  {row.value}
                </span>
              </div>
              {i < arr.length - 1 && <Separator />}
            </React.Fragment>
          ))}
        </div>

        {/* Progress bars */}
        <div className="space-y-3 pt-1">
          <div>
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5 font-semibold">
              <span>Sold Rate</span>
              <span>{soldPct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-rose-500 transition-all duration-700"
                style={{ width: `${soldPct}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5 font-semibold">
              <span>Active Rate</span>
              <span>{activePct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                style={{ width: `${activePct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Premium gate / active badge */}
        <div className="mt-auto pt-2">
          {!hasAccess ? (
            <div className="relative overflow-hidden rounded-xl border border-amber-400/40 bg-amber-50 dark:bg-amber-950/20 p-4">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/10 to-transparent pointer-events-none" />
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Crown size={15} className="text-amber-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[11px] font-bold text-amber-700 dark:text-amber-400 mb-0.5">
                    Premium Members Only
                  </h3>
                  <p className="text-[10px] text-amber-600/80 dark:text-amber-500/80 leading-relaxed">
                    Unlock full contact details, direct email & messaging.
                  </p>
                  <Button
                    size="sm"
                    className="mt-2.5 h-7 text-[10px] font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-white gap-1.5 px-3"
                    onClick={onUpgrade}
                  >
                    <Sparkles size={11} />
                    Upgrade to Premium
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-950/20 p-3 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center shrink-0">
                <Crown size={13} className="text-amber-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-green-700 dark:text-green-400">
                  Full Access Granted
                </p>
                <p className="text-[9px] text-green-600/80 dark:text-green-500/70">
                  Seller details are fully visible
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Page ─────────────────────────────────────────────────────

export default function ContactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();

  const { data, isLoading, isError } = usePropertySeller(id, !!session);

  const [msgOpen, setMsgOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  const handleSend = () => {
    if (!message.trim()) return;
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setMessage("");
      setMsgOpen(false);
    }, 2000);
  };

  if (isLoading) return <ContactPageSkeleton />;

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-sm font-semibold">Unable to load seller details</p>
          <Button variant="outline" size="sm" onClick={() => router.push(`/properties/${id}`)}>
            <ArrowLeft size={14} className="mr-1.5" /> Back to Property
          </Button>
        </div>
      </div>
    );
  }

  const { seller, hasAccess } = data;

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient gradient */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-30 dark:opacity-20"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% -10%, hsl(var(--primary)/0.15), transparent)",
        }}
      />

      <div className="relative z-10 w-full max-w-[95vw] mx-auto px-4 lg:px-6 py-6 space-y-6">
        {/* Page header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-8 h-8 shrink-0"
            onClick={() => router.push(`/properties/${id}`)}
          >
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h1 className="text-base font-bold tracking-tight">Contact Seller</h1>
            <p className="text-[10px] text-muted-foreground font-medium">
              Property #{id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <div className="ml-auto">
            {hasAccess ? (
              <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border border-green-400/30 text-[10px] font-bold px-2 gap-1">
                <ShieldCheck size={9} />
                Access Granted
              </Badge>
            ) : (
              <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-400/30 text-[10px] font-bold px-2 gap-1">
                <Crown size={9} />
                Premium
              </Badge>
            )}
          </div>
        </div>

        {/* 3-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          <SellerProfileCard seller={seller} hasAccess={hasAccess} />
          <ContactMethodsCard
            seller={seller}
            hasAccess={hasAccess}
            showPhone={showPhone}
            setShowPhone={setShowPhone}
            onMessageClick={() => setMsgOpen(true)}
            id={id}
          />
          <SellerStatsCard
            seller={seller}
            hasAccess={hasAccess}
            onUpgrade={() => router.push(`/properties/${id}/contact`)}
          />
        </div>

        {/* Bottom CTAs */}
        <div className="flex gap-3">
          {hasAccess ? (
            <>
              <Button
                variant="outline"
                className="flex-1 rounded-xl gap-2 font-bold text-[11px] h-11 border-2"
                onClick={() => router.push(`/appointments/new?propertyId=${id}`)}
              >
                <CalendarCheck size={15} />
                Book a Visit
              </Button>
              <Button
                className="flex-1 rounded-xl gap-2 font-bold text-[11px] h-11"
                onClick={() => setMsgOpen(true)}
              >
                <MessageCircle size={15} />
                Message Seller
              </Button>
            </>
          ) : (
            <Button
              className="w-full rounded-xl gap-2 font-bold text-[12px] h-11 bg-amber-500 hover:bg-amber-600 text-white"
              onClick={() => router.push(`/properties/${id}`)}
            >
              <Crown size={15} />
              Unlock Seller Details — Get Premium Access
            </Button>
          )}
        </div>
      </div>

      {/* Message dialog */}
      <Dialog open={msgOpen} onOpenChange={setMsgOpen}>
        <DialogContent className="max-w-sm mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 text-sm">
              <Avatar className="w-7 h-7 border border-border">
                <AvatarImage src={seller.image ?? undefined} />
                <AvatarFallback className="text-xs font-black bg-primary/10 text-primary">
                  {seller.initials}
                </AvatarFallback>
              </Avatar>
              Message {seller.name.split(" ")[0]}
            </DialogTitle>
            <DialogDescription className="text-[11px]">
              Your message will be delivered via the platform.
            </DialogDescription>
          </DialogHeader>

          {sent ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Send size={22} className="text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm font-bold text-foreground">Message Sent!</p>
              <p className="text-[11px] text-muted-foreground text-center">
                {seller.name.split(" ")[0]} will get back to you shortly.
              </p>
            </div>
          ) : (
            <>
              <Textarea
                placeholder={`Hi ${seller.name.split(" ")[0]}, I'm interested in property #${id.slice(0, 6).toUpperCase()}. Could you please…`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[110px] resize-none text-sm rounded-xl"
              />
              <DialogFooter className="gap-2 sm:gap-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl text-[11px] font-bold"
                  onClick={() => setMsgOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 rounded-xl gap-1.5 text-[11px] font-bold"
                  disabled={!message.trim()}
                  onClick={handleSend}
                >
                  <Send size={13} />
                  Send Message
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
