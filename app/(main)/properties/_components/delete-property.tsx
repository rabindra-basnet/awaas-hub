"use client";

import { useState, useEffect, useRef } from "react";
import { Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface DeletePropertyDialogProps {
  propertyId: string;
  propertyTitle?: string;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

const CONFIRM_WORD = "delete";

export default function DeletePropertyDialog({
  propertyId,
  propertyTitle,
  onDelete,
  isDeleting = false,
}: DeletePropertyDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const wasDeleting = useRef(false);

  const canConfirm = confirmText.toLowerCase() === CONFIRM_WORD && !isDeleting;

  // Close dialog once deletion finishes
  useEffect(() => {
    if (isDeleting) {
      wasDeleting.current = true;
    } else if (wasDeleting.current) {
      wasDeleting.current = false;
      setIsOpen(false);
      setConfirmText("");
    }
  }, [isDeleting]);

  const handleOpenChange = (open: boolean) => {
    if (isDeleting) return;
    if (!open) setConfirmText("");
    setIsOpen(open);
  };

  return (
    <>
      {/* Trigger — styled to match DropdownMenuItem */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!isDeleting) setIsOpen(true);
        }}
        disabled={isDeleting}
        className="relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-destructive/10 text-destructive disabled:pointer-events-none disabled:opacity-50"
      >
        {isDeleting ? (
          <Loader2 size={13} className="animate-spin" />
        ) : (
          <Trash2 size={13} />
        )}
        {isDeleting ? "Deleting…" : "Delete"}
      </button>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-sm" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 size={16} />
              Delete Property
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>This action is permanent and cannot be undone.</p>
                {propertyTitle && (
                  <p>
                    <span className="font-semibold text-foreground">
                      &ldquo;{propertyTitle}&rdquo;
                    </span>{" "}
                    and all associated data will be removed.
                  </p>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-1">
            <Label className="text-xs text-muted-foreground">
              Type{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground">
                delete
              </code>{" "}
              to confirm
            </Label>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && canConfirm && onDelete(propertyId)
              }
              placeholder="delete"
              disabled={isDeleting}
              autoComplete="off"
              spellCheck={false}
              className="font-mono"
            />
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenChange(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(propertyId)}
              disabled={!canConfirm}
              className="min-w-[90px] gap-1.5"
            >
              {isDeleting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Deleting…
                </>
              ) : (
                <>
                  <Trash2 size={13} />
                  Delete
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
