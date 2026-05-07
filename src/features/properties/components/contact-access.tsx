"use client";

import { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { ArrowLeft, Phone, Mail, Building2, CheckCircle2, CreditCard, Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Role } from "@/features/auth/rbac/access";

type Props = {
  id: string;
  property: { title: string; location: string; sellerId: string };
  userId: string;
  userRole: string;
};

type AccessState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "no_credits"; remaining: number }
  | { status: "granted"; seller: { name: string; email: string; image: string | null; totalListings: number; verifiedListings: number }; remaining: number | null };

export default function ContactAccess({ id, property, userId, userRole }: Props) {
  const isAdmin = userRole === Role.ADMIN;
  const isOwner = property.sellerId === userId;
  const [state, setState] = useState<AccessState>({ status: "idle" });

  useEffect(() => {
    if (isAdmin || isOwner) {
      setState({ status: "loading" });
      fetchAccess();
    } else {
      checkAccess();
    }
  }, []);

  async function checkAccess() {
    setState({ status: "loading" });
    try {
      const res = await fetch(`/api/properties/${id}/contact-access`);
      const data = await res.json();
      if (data.hasAccess) {
        await loadSeller(data.remainingCredits);
      } else {
        setState({ status: "no_credits", remaining: data.remainingCredits ?? 0 });
      }
    } catch {
      toast.error("Failed to check access");
      setState({ status: "idle" });
    }
  }

  async function fetchAccess() {
    try {
      const res = await fetch(`/api/properties/${id}/seller`);
      if (!res.ok) throw new Error("Failed to load seller info");
      const seller = await res.json();
      setState({ status: "granted", seller, remaining: null });
    } catch {
      toast.error("Failed to load seller info");
      setState({ status: "idle" });
    }
  }

  async function loadSeller(remaining: number | null) {
    const res = await fetch(`/api/properties/${id}/seller`);
    const seller = await res.json();
    setState({ status: "granted", seller, remaining });
  }

  async function unlockContact() {
    setState({ status: "loading" });
    try {
      const res = await fetch(`/api/properties/${id}/contact-access`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403) {
          toast.error(data.message || "No credits remaining");
          setState({ status: "no_credits", remaining: 0 });
          return;
        }
        throw new Error(data.message);
      }
      await loadSeller(data.remainingCredits);
      toast.success("Contact unlocked! 1 credit used.");
    } catch (e: any) {
      toast.error(e.message || "Failed to unlock contact");
      setState({ status: "idle" });
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10 space-y-6">
      <Button variant="ghost" size="sm" render={<Link href={`/properties/${id}`} />} nativeButton={false}>
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Property
      </Button>

      <div className="space-y-1">
        <h1 className="text-xl font-bold">Seller Contact</h1>
        <p className="text-sm text-muted-foreground">{property.title} · {property.location}</p>
      </div>

      {state.status === "loading" && (
        <div className="rounded-2xl border border-border bg-card p-10 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {state.status === "no_credits" && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4 text-center">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto">
            <CreditCard className="w-7 h-7 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold">Credits Required</p>
            <p className="text-sm text-muted-foreground mt-1">
              Viewing seller contact info costs 1 credit. You have {state.remaining} credit{state.remaining !== 1 ? "s" : ""} remaining.
            </p>
          </div>
          {state.remaining > 0 ? (
            <Button className="w-full" onClick={unlockContact}>
              Use 1 Credit to Unlock Contact
            </Button>
          ) : (
            <Button className="w-full" render={<Link href="/billing" />} nativeButton={false}>
              <CreditCard className="w-4 h-4 mr-2" /> Purchase Credits
            </Button>
          )}
        </div>
      )}

      {state.status === "granted" && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">Contact unlocked</span>
            {state.remaining !== null && (
              <span className="ml-auto text-xs text-muted-foreground">{state.remaining} credits remaining</span>
            )}
          </div>

          <div className="p-6 space-y-5">
            <div className="flex items-center gap-4">
              <Avatar className="w-14 h-14">
                <AvatarImage src={state.seller.image ?? undefined} />
                <AvatarFallback className="text-lg font-bold">
                  {state.seller.name?.charAt(0)?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg">{state.seller.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> {state.seller.totalListings} listing{state.seller.totalListings !== 1 ? "s" : ""}
                  </span>
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {state.seller.verifiedListings} verified
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <a href={`mailto:${state.seller.email}`}
                className="flex items-center gap-3 rounded-xl border border-border px-4 py-3.5 hover:bg-muted/30 transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{state.seller.email}</p>
                </div>
              </a>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Please be respectful. Contact sellers only for genuine inquiries.
            </p>
          </div>
        </div>
      )}

      {state.status === "idle" && (
        <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-4">
          <p className="text-sm text-muted-foreground">Unable to load contact info.</p>
          <Button variant="outline" onClick={checkAccess}>Try Again</Button>
        </div>
      )}
    </div>
  );
}
