"use client";

import { useState } from "react";
import { useProperty } from "@/features/properties/queries/properties.queries";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { propertyKeys } from "@/features/properties/lib/property-keys";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { ArrowLeft, CheckCircle2, XCircle, Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Props = { id: string; defaultAction: "verify" | "reject" };

export default function PropertyVerify({ id, defaultAction }: Props) {
  const { data: property } = useProperty(id);
  const [action, setAction] = useState<"verify" | "reject">(defaultAction);
  const [reason, setReason] = useState("");
  const router = useRouter();
  const qc = useQueryClient();

  const verify = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/properties/${id}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationStatus: action === "verify" ? "verified" : "rejected", reason: reason || undefined }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Action failed");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: propertyKeys.detail(id) });
      qc.invalidateQueries({ queryKey: propertyKeys.all });
      toast.success(action === "verify" ? "Property verified!" : "Property rejected");
      router.push(`/properties/${id}`);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const heroImage = (property.images as any[])?.[0];

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" render={<Link href={`/properties/${id}`} />} nativeButton={false}>
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Property
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {heroImage && (
          <div className="relative aspect-[16/6] w-full">
            <Image src={heroImage.url} alt={property.title} fill className="object-cover" />
          </div>
        )}
        <div className="p-6 space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold">{property.title}</h1>
              <p className="text-sm text-muted-foreground">{property.location}</p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
              property.verificationStatus === "verified"   ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
              property.verificationStatus === "rejected"   ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
              "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
            }`}>
              {property.verificationStatus}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            NPR {property.price?.toLocaleString()} · {property.category} · {property.area ?? "N/A"}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Verification Decision</h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setAction("verify")}
            className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-colors ${
              action === "verify"
                ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                : "border-border hover:border-green-300"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" /> Verify
          </button>
          <button
            type="button"
            onClick={() => setAction("reject")}
            className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-colors ${
              action === "reject"
                ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                : "border-border hover:border-red-300"
            }`}
          >
            <XCircle className="w-4 h-4" /> Reject
          </button>
        </div>

        <div className="space-y-1.5">
          <Label>{action === "reject" ? "Rejection reason (optional)" : "Notes (optional)"}</Label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={action === "reject" ? "Explain why this property is being rejected..." : "Any notes for the seller..."}
            rows={3}
            className="resize-none"
          />
        </div>

        <Button
          className={`w-full ${action === "verify" ? "bg-green-600 hover:bg-green-700" : ""}`}
          variant={action === "reject" ? "destructive" : "default"}
          onClick={() => verify.mutate()}
          disabled={verify.isPending}
        >
          {verify.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : action === "verify" ? (
            <CheckCircle2 className="w-4 h-4 mr-2" />
          ) : (
            <XCircle className="w-4 h-4 mr-2" />
          )}
          {action === "verify" ? "Verify Property" : "Reject Property"}
        </Button>
      </div>
    </div>
  );
}
