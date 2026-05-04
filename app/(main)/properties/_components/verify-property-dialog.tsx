"use client";
import { useState } from "react";
import {
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  BadgeDollarSign,
  Lock,
  RotateCcw,
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
  useRevertPropertySold,
  type VerificationStatus,
} from "@/lib/client/queries/properties.verify.queries";

// ── Status option config ──────────────────────────────────────────────────────
const STATUS_OPTIONS: {
  value: VerificationStatus;
  label: string;
  desc: string;
  soldDesc: string;
  icon: React.ElementType;
  selectedCls: string;
  iconCls: string;
  dotCls: string;
  lockedWhenSold: boolean;
}[] = [
  {
    value: "verified",
    label: "Verified",
    desc: "Approve this listing — it becomes live and visible to all buyers",
    soldDesc: "Sold properties must remain verified",
    icon: CheckCircle2,
    selectedCls:
      "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400",
    iconCls: "text-emerald-500",
    dotCls: "bg-emerald-500",
    lockedWhenSold: false,
  },
  {
    value: "rejected",
    label: "Rejected",
    desc: "Decline this listing — it will be hidden from public listings",
    soldDesc: "Cannot reject a sold property",
    icon: XCircle,
    selectedCls:
      "border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400",
    iconCls: "text-rose-500",
    dotCls: "bg-rose-500",
    lockedWhenSold: true,
  },
  {
    value: "pending",
    label: "Pending",
    desc: "Reset to pending — listing stays hidden until re-reviewed",
    soldDesc: "Cannot set a sold property back to pending",
    icon: Clock,
    selectedCls:
      "border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400",
    iconCls: "text-amber-500",
    dotCls: "bg-amber-400",
    lockedWhenSold: true,
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
  const revertMutation = useRevertPropertySold(propertyId);

  const isSold = propertyStatus === "sold";
  const isVerified = currentStatus === "verified";
  const isAnyPending =
    verifyMutation.isPending ||
    soldMutation.isPending ||
    revertMutation.isPending;

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

  const handleRevert = async (status: "available" | "booked") => {
    await revertMutation.mutateAsync(status);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto [scrollbar-width:thin]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                isSold
                  ? "bg-rose-500/10"
                  : "bg-primary/10",
              )}
            >
              {isSold ? (
                <BadgeDollarSign size={16} className="text-rose-500" />
              ) : (
                <Shield size={16} className="text-primary" />
              )}
            </div>
            <div>
              <DialogTitle className="text-base leading-none">
                {isSold ? "Property Sold" : "Verify Property"}
              </DialogTitle>
              <DialogDescription className="text-xs mt-1 line-clamp-1">
                {propertyTitle}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Sold lock notice */}
        {isSold && (
          <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800">
            <Lock size={13} className="text-rose-500 shrink-0 mt-0.5" />
            <p className="text-xs text-rose-700 dark:text-rose-400 leading-relaxed">
              This property has been marked as sold. Verification status is
              locked to <strong>Verified</strong> and cannot be changed to
              Pending or Rejected.
            </p>
          </div>
        )}

        {/* Mutation error */}
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
            const isLocked = isSold && opt.lockedWhenSold;

            return (
              <label
                key={opt.value}
                className={cn(
                  "flex items-start gap-3 p-3.5 rounded-xl border-2 transition-all select-none",
                  isLocked
                    ? "border-border/30 bg-muted/20 opacity-50 cursor-not-allowed"
                    : isSelected
                      ? cn("cursor-pointer", opt.selectedCls)
                      : "border-border/60 hover:border-border bg-muted/10 hover:bg-muted/30 text-foreground cursor-pointer",
                )}
              >
                {/* Custom radio / lock indicator */}
                <span
                  className={cn(
                    "mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
                    isLocked
                      ? "bg-muted border-2 border-border/40"
                      : isSelected
                        ? `${opt.dotCls} border-2 border-current`
                        : "border-2 border-muted-foreground/40 bg-background",
                  )}
                >
                  {isLocked ? (
                    <Lock size={8} className="text-muted-foreground/60" />
                  ) : (
                    isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    )
                  )}
                </span>

                <input
                  type="radio"
                  className="sr-only"
                  name="verificationStatus"
                  value={opt.value}
                  checked={isSelected}
                  disabled={isLocked}
                  onChange={() => !isLocked && setSelected(opt.value)}
                />

                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <opt.icon
                      size={13}
                      className={
                        isLocked
                          ? "text-muted-foreground/40"
                          : isSelected
                            ? opt.iconCls
                            : "text-muted-foreground"
                      }
                    />
                    <span className="text-sm font-semibold">{opt.label}</span>
                    {isCurrent && !isLocked && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide opacity-50 ml-auto">
                        current
                      </span>
                    )}
                    {isLocked && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/50 ml-auto">
                        locked
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] opacity-60 leading-relaxed">
                    {isLocked ? opt.soldDesc : opt.desc}
                  </span>
                </div>
              </label>
            );
          })}
        </div>

        {/* Property Sale */}
        <div className="pt-1 border-t border-border/50">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Property Sale
          </p>

          {isSold ? (
            /* ── Sold → let admin revert to available or booked ── */
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/30 font-semibold"
                disabled={isAnyPending}
                onClick={() => handleRevert("available")}
              >
                {revertMutation.isPending ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <RotateCcw size={12} />
                )}
                Set Available
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950/30 font-semibold"
                disabled={isAnyPending}
                onClick={() => handleRevert("booked")}
              >
                {revertMutation.isPending ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <RotateCcw size={12} />
                )}
                Set Booked
              </Button>
            </div>
          ) : (
            /* ── Not sold → mark as sold ── */
            <>
              <Button
                size="sm"
                className="w-full font-bold transition-colors gap-2 bg-orange-500 hover:bg-orange-600 text-white"
                disabled={!isVerified || isAnyPending}
                onClick={handleMarkSold}
              >
                {soldMutation.isPending ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Marking as sold…
                  </>
                ) : (
                  <>
                    <BadgeDollarSign size={14} />
                    Mark as Sold
                  </>
                )}
              </Button>
              {!isVerified && (
                <p className="text-[11px] text-muted-foreground mt-1.5 text-center">
                  Property must be verified before it can be marked as sold
                </p>
              )}
            </>
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
            {isSold ? "Close" : "Cancel"}
          </Button>
          {!isSold && (
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
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
