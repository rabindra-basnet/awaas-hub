"use client";

import { useState } from "react";
import { MessageCircle, X, ChevronDown, HeadphonesIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import PropertySupportChat from "./PropertySupportChat";

interface FloatingChatProps {
  propertyId: string;
  propertyTitle: string;
  currentUserId: string;
}

export default function FloatingChat({
  propertyId,
  propertyTitle,
  currentUserId,
}: FloatingChatProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat panel */}
      <div
        className={cn(
          "w-80 md:w-96 rounded-2xl shadow-2xl border border-border/60 bg-card overflow-hidden transition-all duration-300 origin-bottom-right",
          open
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none h-0",
        )}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <HeadphonesIcon className="h-4 w-4 text-primary" />
            <div>
              <span className="text-sm font-semibold block leading-tight">Support</span>
              {propertyTitle && (
                <span className="text-[10px] text-muted-foreground truncate max-w-[180px] block">
                  {propertyTitle}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        <PropertySupportChat
          propertyId={propertyId}
          propertyTitle={propertyTitle}
          currentUserId={currentUserId}
        />
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200",
          open
            ? "bg-muted text-foreground hover:bg-muted/80"
            : "bg-primary text-primary-foreground hover:bg-primary/90",
        )}
        aria-label={open ? "Close support chat" : "Open support chat"}
      >
        {open ? (
          <X className="h-5 w-5" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>
    </div>
  );
}
