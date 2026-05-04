"use client";
import { useState } from "react";
import {
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  BadgeDollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  useVerifyProperty,
  useMarkPropertySold,
  type VerificationStatus,
} from "@/lib/client/queries/properties.verify.queries";
import { toast } from "sonner";

// ── Status option config ──────────────────────────────────────────────────────
const STATUS_OPTIONS: {
  value: VerificationStatus;
  label: string;
  desc: string;
  icon: React.ElementType;
  selectedCls: string;
  iconCls: string;
  dotCls: string;
}[] = [
  {
    value: "verified",
    label: "Verified",
    desc: "Approve this listing — it becomes live and visible to all buyers",
    icon: CheckCircle2,
    selectedCls:
      "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400",
    iconCls: "text-emerald-500",
    dotCls: "bg-emerald-500",
  },
  {
    value: "rejected",
    label: "Rejected",
    desc: "Decline this listing — it will be hidden from public listings",
    icon: XCircle,
    selectedCls:
      "border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400",
    iconCls: "text-rose-500",
    dotCls: "bg-rose-500",
  },
  {
    value: "pending",
    label: "Pending",
    desc: "Reset to pending — listing stays hidden until re-reviewed",
    icon: Clock,
    selectedCls:
      "border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400",
    iconCls: "text-amber-500",
    dotCls: "bg-amber-400",
  },
];

// ── Props ─────────────────────────────────────────────────────────────────────
interface VerifyPropertyDialogProps {
  propertyId: string;
  propertyTitle: string;
  currentStatus: VerificationStatus;
  propertyStatus: "available" | "booked" | "sold";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function VerifyPropertyDialog({
  propertyId,
  propertyTitle,
  currentStatus,
  propertyStatus,
  open,
  onOpenChange,
}: VerifyPropertyDialogProps) {
  const [selected, setSelected] = useState<VerificationStatus>(currentStatus);
  const verifyMutation = useVerifyProperty(propertyId);
  const soldMutation = useMarkPropertySold(propertyId);

  const isSold = propertyStatus === "sold";
  const isVerified = currentStatus === "verified";
  const isAnyPending = verifyMutation.isPending || soldMutation.isPending;

  const isDirty = selected !== currentStatus;
  const selectedOption = STATUS_OPTIONS.find((o) => o.value === selected)!;

  const handleSubmit = async () => {
    if (!isDirty) return;
    await verifyMutation.mutateAsync(selected);
    onOpenChange(false);
  };

  const handleMarkSold = async () => {
    await soldMutation.mutateAsync();
    onOpenChange(false);
  };

  // verifyMutation.error &&
  //   toast.error(verifyMutation.error?.message ?? "Something went wrong");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Shield size={16} className="text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base leading-none">
                Verify Property
              </DialogTitle>
              <DialogDescription className="text-xs mt-1 line-clamp-1">
                {propertyTitle}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Error */}
        {verifyMutation.isError && (
          <div className="px-3 py-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive font-medium">
            {verifyMutation.error?.message ?? "Something went wrong"}
          </div>
        )}

        {/* Status radio options */}
        <div className="flex flex-col gap-2 py-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Verification Status
          </p>
          {STATUS_OPTIONS.map((opt) => {
            const isSelected = selected === opt.value;
            const isCurrent = currentStatus === opt.value;
            return (
              <label
                key={opt.value}
                className={cn(
                  "flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all select-none",
                  isSelected
                    ? opt.selectedCls
                    : "border-border/60 hover:border-border bg-muted/10 hover:bg-muted/30 text-foreground",
                )}
              >
                {/* Custom radio circle */}
                <span
                  className={cn(
                    "mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                    isSelected
                      ? `${opt.dotCls} border-current`
                      : "border-muted-foreground/40 bg-background",
                  )}
                >
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </span>
                <input
                  type="radio"
                  className="sr-only"
                  name="verificationStatus"
                  value={opt.value}
                  checked={isSelected}
                  onChange={() => setSelected(opt.value)}
                />
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <opt.icon
                      size={13}
                      className={
                        isSelected ? opt.iconCls : "text-muted-foreground"
                      }
                    />
                    <span className="text-sm font-semibold">{opt.label}</span>
                    {isCurrent && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide opacity-50 ml-auto">
                        current
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] opacity-60 leading-relaxed">
                    {opt.desc}
                  </span>
                </div>
              </label>
            );
          })}
        </div>

        {/* Mark as Sold */}
        <div className="pt-1 border-t border-border/50">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Property Sale
          </p>
          <Button
            size="sm"
            className={cn(
              "w-full font-bold transition-colors gap-2",
              isSold
                ? "bg-orange-100 text-orange-700 border border-orange-300 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800 cursor-default"
                : "bg-orange-500 hover:bg-orange-600 text-white",
            )}
            disabled={isSold || !isVerified || isAnyPending}
            onClick={isSold || !isVerified ? undefined : handleMarkSold}
          >
            {soldMutation.isPending ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Marking as sold…
              </>
            ) : (
              <>
                <BadgeDollarSign size={14} />
                {isSold ? "Already Sold" : "Mark as Sold"}
              </>
            )}
          </Button>
          {!isVerified && !isSold && (
            <p className="text-[11px] text-muted-foreground mt-1.5 text-center">
              Property must be verified before it can be marked as sold
            </p>
          )}
        </div>

        <DialogFooter className="flex gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={isAnyPending}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className={cn(
              "flex-1 font-bold transition-colors",
              isDirty &&
                selected === "verified" &&
                "bg-emerald-600 hover:bg-emerald-700 text-white",
              isDirty &&
                selected === "rejected" &&
                "bg-rose-600 hover:bg-rose-700 text-white",
              isDirty &&
                selected === "pending" &&
                "bg-amber-500 hover:bg-amber-600 text-white",
            )}
            disabled={!isDirty || isAnyPending}
            onClick={handleSubmit}
          >
            {verifyMutation.isPending ? (
              <>
                <Loader2 size={13} className="animate-spin mr-1.5" />
                Saving…
              </>
            ) : isDirty ? (
              `Set as ${selectedOption.label}`
            ) : (
              "No changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
