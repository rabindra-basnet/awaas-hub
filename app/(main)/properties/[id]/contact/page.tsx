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
  Star,
  BadgeCheck,
  MapPin,
  Clock,
  Zap,
  Phone,
  CalendarCheck,
  ChevronRight,
  Eye,
  EyeOff,
  Sparkles,
  BarChart3,
  Contact,
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

interface Params {
  id: string;
}

const MOCK_SELLER = {
  id: "seller_001",
  name: "Ramesh Shrestha",
  username: "@ramesh.property",
  avatarUrl: "",
  initials: "RS",
  verified: true,
  rating: 4.8,
  reviews: 214,
  location: "Kathmandu, Bagmati",
  memberSince: "Jan 2020",
  responseTime: "~20 min",
  email: "ramesh@propertynepal.com",
  phone: "+977 980-000-0000",
  bio: "Property with 8+ years in Kathmandu Valley real estate. Specialising in residential plots, commercial spaces & investment properties.",
  badges: ["Top Agent", "Fast Responder", "ID Verified"],
  totalListings: 134,
  totalSold: 89,
  responseRate: 97,
};

// set true to preview the unlocked premium state during development
const USE_MOCK_PREMIUM = false;

// ── Shared helpers ────────────────────────────────────────────────

function StatItem({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 flex-1">
      <span className="text-lg font-black text-foreground leading-none">
        {value}
      </span>
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

function PremiumBlur({
  children,
  locked,
}: {
  children: React.ReactNode;
  locked: boolean;
}) {
  if (!locked) return <>{children}</>;
  return (
    <div className="relative select-none">
      <div className="blur-sm opacity-40 pointer-events-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-center gap-1.5 bg-background/80 backdrop-blur-md border border-border/60 rounded-full px-3 py-1.5 shadow-lg">
          <Lock size={11} className="text-amber-500" />
          <span className="text-[11px] font-bold text-muted-foreground">
            Premium only
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Card 1 — Seller Profile ───────────────────────────────────────

function SellerProfileCard({ seller }: { seller: typeof MOCK_SELLER }) {
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
        {/* Avatar + rating */}
        <div className="flex items-end justify-between mb-3">
          <div className="relative">
            <Avatar className="w-14 h-14 border-[3px] border-background shadow-lg">
              <AvatarImage src={seller.avatarUrl} />
              <AvatarFallback className="text-sm font-black bg-primary/10 text-primary">
                {seller.initials}
              </AvatarFallback>
            </Avatar>
            {seller.verified && (
              <span className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-[3px] border-2 border-background">
                <BadgeCheck size={9} className="text-white" />
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 bg-muted/60 rounded-xl px-2.5 py-1.5 border border-border/50">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            <span className="text-sm font-bold">{seller.rating}</span>
            <span className="text-[10px] text-muted-foreground">
              ({seller.reviews})
            </span>
          </div>
        </div>

        {/* Name + badge */}
        <div className="mb-0.5 flex items-center gap-1.5 flex-wrap">
          <h2 className="text-sm font-black text-foreground">{seller.name}</h2>
          {seller.verified && (
            <Badge
              variant="secondary"
              className="text-[9px] px-1.5 h-4 font-bold"
            >
              Verified
            </Badge>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground mb-2">
          {seller.username}
        </p>

        {/* Location */}
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-2 flex-wrap">
          <MapPin size={10} className="text-destructive shrink-0" />
          {seller.location}
          <span className="mx-1">·</span>
          <Clock size={10} className="shrink-0" />
          Since {seller.memberSince}
        </div>

        {/* Bio */}
        <p className="text-[11px] text-muted-foreground leading-relaxed mb-3 flex-1">
          {seller.bio}
        </p>

        {/* Trust badges */}
        <div className="flex flex-wrap gap-1 mb-3">
          {seller.badges.map((b) => (
            <Badge
              key={b}
              variant="outline"
              className="text-[9px] gap-1 font-semibold px-1.5 py-0.5"
            >
              <ShieldCheck size={9} className="text-green-500" />
              {b}
            </Badge>
          ))}
        </div>

        <Separator className="mb-3" />

        {/* Stats row */}
        <div className="flex gap-2 divide-x divide-border">
          <StatItem value={seller.totalListings} label="Listings" />
          <StatItem value={seller.totalSold} label="Sold" />
          <StatItem value={`${seller.responseRate}%`} label="Response" />
        </div>
      </CardContent>
    </Card>
  );
}

// ── Card 2 — Contact Methods ──────────────────────────────────────

function ContactMethodsCard({
  seller,
  isPremium,
  showPhone,
  setShowPhone,
  onMessageClick,
  id,
}: {
  seller: typeof MOCK_SELLER;
  isPremium: boolean;
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
        {/* Response time pill */}
        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/60 rounded-xl px-3 py-2">
          <Zap
            size={13}
            className="text-green-600 dark:text-green-400 shrink-0"
          />
          <p className="text-[10px] font-semibold text-green-700 dark:text-green-400">
            Responds within{" "}
            <span className="font-black">{seller.responseTime}</span>
          </p>
        </div>

        {/* In-app Message */}
        <button
          disabled={!isPremium}
          onClick={() => isPremium && onMessageClick()}
          className={cn(
            "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left group",
            isPremium
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
            <p className="text-[12px] font-bold text-foreground">
              Send a direct message
            </p>
          </span>
          {isPremium ? (
            <ChevronRight
              size={15}
              className="text-muted-foreground group-hover:text-primary transition-colors"
            />
          ) : (
            <Lock size={12} className="text-amber-500 shrink-0" />
          )}
        </button>

        {/* Email */}
        <div
          className={cn(
            "rounded-xl border overflow-hidden",
            isPremium ? "border-border" : "border-border/50",
          )}
        >
          <PremiumBlur locked={!isPremium}>
            <a
              href={isPremium ? `mailto:${seller.email}` : undefined}
              className={cn(
                "flex items-center gap-3 p-3 bg-card transition-all text-left group",
                isPremium
                  ? "hover:bg-orange-50 dark:hover:bg-orange-950/20 cursor-pointer"
                  : "cursor-default",
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
                  {isPremium ? seller.email : "••••••@propertynepal.com"}
                </p>
              </span>
              {isPremium ? (
                <ChevronRight
                  size={15}
                  className="text-muted-foreground group-hover:text-orange-500 transition-colors"
                />
              ) : (
                <Lock size={12} className="text-amber-500 shrink-0" />
              )}
            </a>
          </PremiumBlur>
        </div>

        {/* Phone */}
        <div className="rounded-xl border border-border/50 overflow-hidden">
          <PremiumBlur locked={!isPremium}>
            <div
              className={cn(
                "flex items-center gap-3 p-3 bg-card",
                isPremium ? "cursor-pointer" : "cursor-default",
              )}
              onClick={() => isPremium && setShowPhone((v) => !v)}
            >
              <span className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Phone size={16} />
              </span>
              <span className="flex-1 min-w-0">
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mb-0.5">
                  Phone
                </p>
                <p className="text-[12px] font-bold text-foreground">
                  {isPremium
                    ? showPhone
                      ? seller.phone
                      : "+977 980-•••-••••"
                    : "+977 980-•••-••••"}
                </p>
              </span>
              {isPremium ? (
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

        {/* Book visit mini-card — pushed to bottom */}
        <div className="mt-auto pt-1">
          <Card className="rounded-xl border-primary/20 bg-primary/5">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <CalendarCheck size={15} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-bold text-foreground">
                  Schedule a Site Visit
                </p>
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  Book in-person appointment
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="text-[10px] font-bold h-7 rounded-lg border-primary/30 px-2.5"
                onClick={() =>
                  (window.location.href = `/appointments/new?propertyId=${id}`)
                }
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
  isPremium,
  onUpgrade,
}: {
  seller: typeof MOCK_SELLER;
  isPremium: boolean;
  onUpgrade: () => void;
}) {
  const rows = [
    { label: "Member since", value: seller.memberSince },
    {
      label: "Response rate",
      value: `${seller.responseRate}%`,
      highlight: true,
    },
    { label: "Avg response time", value: seller.responseTime },
    { label: "Total listings", value: seller.totalListings },
    { label: "Properties sold", value: seller.totalSold },
  ];

  return (
    <Card className="rounded-2xl border-border/60 shadow-sm h-full flex flex-col">
      <CardHeader className="px-5 pt-5 pb-3 shrink-0">
        <CardTitle className="text-sm font-black flex items-center gap-2">
          <BarChart3 size={15} className="text-primary" />
          Seller Stats
        </CardTitle>
      </CardHeader>

      <CardContent className="px-5 pb-5 flex flex-col gap-3 flex-1">
        {/* Stat rows */}
        <div className="space-y-2">
          {rows.map((row, i, arr) => (
            <React.Fragment key={row.label}>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-muted-foreground font-medium">
                  {row.label}
                </span>
                <span
                  className={cn(
                    "text-[11px] font-bold",
                    (row as any).highlight
                      ? "text-green-600 dark:text-green-400"
                      : "text-foreground",
                  )}
                >
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
              <span>Response Rate</span>
              <span>{seller.responseRate}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-green-500 transition-all duration-700"
                style={{ width: `${seller.responseRate}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5 font-semibold">
              <span>Overall Rating</span>
              <span>{seller.rating} / 5</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-400 transition-all duration-700"
                style={{ width: `${(seller.rating / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Premium gate / active badge — pushed to bottom */}
        <div className="mt-auto pt-2">
          {!isPremium ? (
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
                  Premium Active
                </p>
                <p className="text-[9px] text-green-600/80 dark:text-green-500/70">
                  Full seller access unlocked
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

export default function ContactPage({ params }: { params: Promise<Params> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();

  // swap with your real RBAC check
  const isPremium: boolean =
    USE_MOCK_PREMIUM ||
    (session?.user as any)?.subscription === "premium" ||
    (session?.user as any)?.role === "admin";

  const seller = MOCK_SELLER; // swap with useSellerByPropertyId(id)

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
        {/* ── Page header ── */}
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
            <h1 className="text-base font-bold tracking-tight">
              Contact Seller
            </h1>
            <p className="text-[10px] text-muted-foreground font-medium">
              Property #{id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <div className="ml-auto">
            {isPremium && (
              <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-400/30 text-[10px] font-bold px-2 gap-1">
                <Crown size={9} />
                Premium
              </Badge>
            )}
          </div>
        </div>

        {/* ── 3-column grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {/* Col 1: Seller identity */}
          <SellerProfileCard seller={seller} />

          {/* Col 2: Contact methods */}
          <ContactMethodsCard
            seller={seller}
            isPremium={isPremium}
            showPhone={showPhone}
            setShowPhone={setShowPhone}
            onMessageClick={() => setMsgOpen(true)}
            id={id}
          />

          {/* Col 3: Stats + premium gate */}
          <SellerStatsCard
            seller={seller}
            isPremium={isPremium}
            onUpgrade={() => router.push("/upgrade")}
          />
        </div>

        {/* ── Bottom CTA ── */}
        <div className="flex gap-3">
          {isPremium ? (
            <>
              <Button
                variant="outline"
                className="flex-1 rounded-xl gap-2 font-bold text-[11px] h-11 border-2"
                onClick={() =>
                  router.push(`/appointments/new?propertyId=${id}`)
                }
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
              onClick={() => router.push("/upgrade")}
            >
              <Crown size={15} />
              Unlock Seller Details — Upgrade to Premium
            </Button>
          )}
        </div>
      </div>

      {/* ── Message dialog ── */}
      <Dialog open={msgOpen} onOpenChange={setMsgOpen}>
        <DialogContent className="max-w-sm mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 text-sm">
              <Avatar className="w-7 h-7 border border-border">
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
                <Send
                  size={22}
                  className="text-green-600 dark:text-green-400"
                />
              </div>
              <p className="text-sm font-bold text-foreground">Message Sent!</p>
              <p className="text-[11px] text-muted-foreground text-center">
                {seller.name} will reply within{" "}
                <span className="font-bold">{seller.responseTime}</span>
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
