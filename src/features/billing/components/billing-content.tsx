"use client";

import { Suspense, useState } from "react";
import { useCreditBalance, useCheckout } from "@/features/billing/queries/billing.queries";
import { Button } from "@/shared/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { toast } from "sonner";
import {
  Coins, CreditCard, CheckCircle2, XCircle, Clock,
  TrendingUp, Loader2, ArrowRight, Wallet,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

const PLANS = [
  { credits: 3,  amount: 500,  label: "Starter",  popular: false, perCredit: "NPR 167" },
  { credits: 10, amount: 1500, label: "Standard",  popular: true,  perCredit: "NPR 150" },
  { credits: 25, amount: 3000, label: "Pro",       popular: false, perCredit: "NPR 120" },
  { credits: 50, amount: 5000, label: "Business",  popular: false, perCredit: "NPR 100" },
] as const;

function BalanceCard() {
  const { data } = useCreditBalance();
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-6 py-5 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Available Credits</p>
              <p className="text-3xl font-bold tabular-nums">{data.remaining}</p>
            </div>
          </div>
          <div className="text-right text-xs text-muted-foreground space-y-1">
            <p>{data.total} total purchased</p>
            <p>{data.used} used</p>
          </div>
        </div>
      </div>
      <div className="px-6 py-3 flex items-center gap-2 text-xs text-muted-foreground">
        <TrendingUp className="w-3.5 h-3.5" />
        1 credit unlocks full access to a property (contact, chat, map, tour)
      </div>
    </div>
  );
}

function TransactionHistory() {
  const { data } = useCreditBalance();
  if (!data.history?.length) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold">Purchase History</h2>
      <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
        {data.history.map((tx: any) => (
          <div key={tx._id} className="flex items-center gap-3 px-4 py-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              tx.status === "paid"    ? "bg-green-100 dark:bg-green-900/30"  :
              tx.status === "failed" ? "bg-red-100 dark:bg-red-900/30"      :
              "bg-yellow-100 dark:bg-yellow-900/30"
            }`}>
              {tx.status === "paid"    ? <CheckCircle2 className="w-4 h-4 text-green-600" /> :
               tx.status === "failed" ? <XCircle className="w-4 h-4 text-red-600" />        :
               <Clock className="w-4 h-4 text-yellow-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                {tx.status === "paid" ? tx.credits : tx.creditsToAdd} credits
                <span className="text-xs text-muted-foreground ml-1.5 font-normal capitalize">via {tx.paymentMethod}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                NPR {tx.amount.toLocaleString()} · {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
              </p>
            </div>
            <span className={`text-xs font-medium capitalize px-2 py-0.5 rounded-full ${
              tx.status === "paid"    ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"  :
              tx.status === "failed" ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"          :
              "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
            }`}>
              {tx.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PurchaseForm() {
  const checkout = useCheckout();
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[number]>(PLANS[1]);
  const [provider, setProvider] = useState<"esewa" | "khalti">("esewa");

  const handleCheckout = () => {
    checkout.mutate(
      { amount: selectedPlan.amount, credits: selectedPlan.credits, paymentMethod: provider },
      {
        onSuccess: (data: any) => {
          if (provider === "esewa" && data.formAction && data.fields) {
            const form = document.createElement("form");
            form.method = "POST";
            form.action = data.formAction;
            Object.entries(data.fields).forEach(([key, val]) => {
              const input = document.createElement("input");
              input.type = "hidden";
              input.name = key;
              input.value = String(val);
              form.appendChild(input);
            });
            document.body.appendChild(form);
            form.submit();
          } else if (data.formAction) {
            window.location.href = data.formAction;
          }
        },
        onError: (e: any) => toast.error(e.message || "Checkout failed"),
      },
    );
  };

  return (
    <div className="space-y-5">
      <h2 className="text-sm font-semibold">Choose a Plan</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {PLANS.map((plan) => (
          <button
            key={plan.credits}
            type="button"
            onClick={() => setSelectedPlan(plan)}
            className={`rounded-xl border-2 p-4 text-left transition-all relative ${
              selectedPlan.credits === plan.credits
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/40"
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-2 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                Popular
              </span>
            )}
            <div className="flex items-center gap-1.5 mb-1">
              <Coins className="w-4 h-4 text-primary" />
              <span className="font-bold text-lg">{plan.credits}</span>
            </div>
            <p className="text-xs text-muted-foreground">{plan.label}</p>
            <p className="font-semibold mt-2 text-sm">NPR {plan.amount.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">{plan.perCredit}/credit</p>
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <CreditCard className="w-4 h-4" /> Payment
        </h3>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Payment Method</label>
          <Select value={provider} onValueChange={(v) => setProvider(v as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="esewa">eSewa</SelectItem>
              <SelectItem value="khalti">Khalti</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">Order summary</p>
            <p className="text-sm font-medium flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-primary" /> {selectedPlan.credits} credits · {selectedPlan.label}
            </p>
          </div>
          <p className="font-bold">NPR {selectedPlan.amount.toLocaleString()}</p>
        </div>

        <Button className="w-full" onClick={handleCheckout} disabled={checkout.isPending}>
          {checkout.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <ArrowRight className="w-4 h-4 mr-2" />
          )}
          Pay via {provider === "esewa" ? "eSewa" : "Khalti"}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Credits never expire. Use them to unlock any property's full details.
        </p>
      </div>
    </div>
  );
}

export default function BillingContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing & Credits</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Purchase credits to unlock property contacts, maps, tours, and chat
        </p>
      </div>

      {status === "success" && (
        <div className="flex items-center gap-3 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 px-5 py-4">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          <p className="text-sm font-medium text-green-800 dark:text-green-300">Payment successful! Credits added to your account.</p>
        </div>
      )}
      {status === "failed" && (
        <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 px-5 py-4">
          <XCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm font-medium text-red-800 dark:text-red-300">Payment failed. Please try again.</p>
        </div>
      )}

      <Suspense fallback={<Skeleton className="h-28 w-full rounded-2xl" />}>
        <BalanceCard />
      </Suspense>

      <PurchaseForm />

      <Suspense fallback={<Skeleton className="h-48 w-full rounded-xl" />}>
        <TransactionHistory />
      </Suspense>
    </div>
  );
}
