// "use client";

// import { useEffect, useRef, useState } from "react";
// import { X } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import type { Ad } from "@/lib/client/queries/ads.queries";

// const COUNTDOWN_SECONDS = 5;
// const SESSION_KEY = "interstitial_ad_shown";

// export function InterstitialAd() {
//   const [ad, setAd] = useState<Ad | null>(null);
//   const [visible, setVisible] = useState(false);
//   const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
//   const htmlRef = useRef<HTMLDivElement>(null);
//   const trackedRef = useRef(false);

//   useEffect(() => {
//     // Show only once per browser session
//     if (sessionStorage.getItem(SESSION_KEY)) return;

//     fetch("/api/ads?slot=interstitial")
//       .then((r) => {
//         if (r.status === 204) return null;
//         return r.json();
//       })
//       .then((data) => {
//         if (!data) return;
//         setAd(data);
//         setVisible(true);
//         sessionStorage.setItem(SESSION_KEY, "1");
//       })
//       .catch(() => {});
//   }, []);

//   // Track impression
//   useEffect(() => {
//     if (ad?._id && visible && !trackedRef.current) {
//       trackedRef.current = true;
//       fetch(`/api/ads/${ad._id}/impression`, { method: "POST" }).catch(
//         () => {},
//       );
//     }
//   }, [ad, visible]);

//   // Countdown timer
//   useEffect(() => {
//     if (!visible || countdown === 0) return;
//     const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
//     return () => clearTimeout(t);
//   }, [visible, countdown]);

//   // Inject HTML ad content safely
//   useEffect(() => {
//     if (!ad?.htmlContent || !htmlRef.current) return;
//     const range = document.createRange();
//     range.selectNode(htmlRef.current);
//     const fragment = range.createContextualFragment(ad.htmlContent);
//     htmlRef.current.innerHTML = "";
//     htmlRef.current.appendChild(fragment);
//   }, [ad?.htmlContent]);

//   if (!visible || !ad) return null;

//   const handleClick = () => {
//     fetch(`/api/ads/${ad._id}/click`, { method: "POST" }).catch(() => {});
//   };

//   const handleDismiss = () => setVisible(false);

//   const canDismiss = countdown === 0;

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
//       onClick={(e) => {
//         // Dismiss on backdrop click only if countdown done
//         if (canDismiss && e.target === e.currentTarget) handleDismiss();
//       }}
//     >
//       <div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in zoom-in-95 duration-300">
//         {/* Top bar */}
//         <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/30">
//           <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
//             Advertisement
//           </span>
//           <button
//             disabled={!canDismiss}
//             onClick={handleDismiss}
//             className={`flex items-center justify-center w-7 h-7 rounded-full transition-all ${
//               canDismiss
//                 ? "bg-foreground/10 hover:bg-foreground/20 cursor-pointer"
//                 : "bg-muted cursor-not-allowed opacity-60"
//             }`}
//             aria-label={canDismiss ? "Close ad" : `Wait ${countdown}s`}
//           >
//             {canDismiss ? (
//               <X size={13} />
//             ) : (
//               <span className="text-[11px] font-bold tabular-nums">
//                 {countdown}
//               </span>
//             )}
//           </button>
//         </div>

//         {/* Ad content */}
//         {ad.htmlContent ? (
//           <div ref={htmlRef} onClick={handleClick} className="cursor-pointer" />
//         ) : (
//           <a
//             href={ad.targetUrl}
//             target="_blank"
//             rel="noopener noreferrer sponsored"
//             onClick={handleClick}
//             className="block"
//           >
//             {/* eslint-disable-next-line @next/next/no-img-element */}
//             <img
//               src={ad.imageUrl}
//               alt={ad.altText ?? "Advertisement"}
//               className="w-full object-cover"
//             />
//           </a>
//         )}

//         {/* Bottom bar */}
//         <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/30">
//           <p className="text-xs text-muted-foreground">
//             {canDismiss
//               ? "You can now close this ad"
//               : `You can close this ad in ${countdown}s`}
//           </p>
//           <Button
//             size="sm"
//             variant={canDismiss ? "default" : "outline"}
//             disabled={!canDismiss}
//             onClick={handleDismiss}
//             className="h-8 text-xs"
//           >
//             {canDismiss ? "Close Ad" : `Skip in ${countdown}s`}
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Ad } from "@/lib/client/queries/ads.queries";

const COUNTDOWN_SECONDS = 5;
const SESSION_KEY = "interstitial_ad_shown";

export function InterstitialAd() {
  const [ad, setAd] = useState<Ad | null>(null);
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const htmlRef = useRef<HTMLDivElement>(null);
  const trackedRef = useRef(false);

  useEffect(() => {
    // Show only once per browser session
    if (sessionStorage.getItem(SESSION_KEY)) return;

    fetch("/api/ads?slot=interstitial")
      .then((r) => {
        if (r.status === 204) return null;
        return r.json();
      })
      .then((data) => {
        // Only show if a real ad came back
        if (!data || !data._id) return;
        setAd(data);
        setVisible(true);
        sessionStorage.setItem(SESSION_KEY, "1");
      })
      .catch(() => {});
    // No sessionStorage write on failure — allow retry next load
  }, []);

  // Track impression
  useEffect(() => {
    if (ad?._id && visible && !trackedRef.current) {
      trackedRef.current = true;
      fetch(`/api/ads/${ad._id}/impression`, { method: "POST" }).catch(
        () => {},
      );
    }
  }, [ad, visible]);

  // Countdown timer
  useEffect(() => {
    if (!visible || countdown === 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [visible, countdown]);

  // Inject HTML ad content safely
  useEffect(() => {
    if (!ad?.htmlContent || !htmlRef.current) return;
    const range = document.createRange();
    range.selectNode(htmlRef.current);
    const fragment = range.createContextualFragment(ad.htmlContent);
    htmlRef.current.innerHTML = "";
    htmlRef.current.appendChild(fragment);
  }, [ad?.htmlContent]);

  // No ad or dismissed — render nothing, zero DOM footprint
  if (!visible || !ad) return null;

  const handleClick = () => {
    fetch(`/api/ads/${ad._id}/click`, { method: "POST" }).catch(() => {});
  };

  const handleDismiss = () => setVisible(false);
  const canDismiss = countdown === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={(e) => {
        if (canDismiss && e.target === e.currentTarget) handleDismiss();
      }}
    >
      <div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/30">
          <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
            Advertisement
          </span>
          <button
            disabled={!canDismiss}
            onClick={handleDismiss}
            className={`flex items-center justify-center w-7 h-7 rounded-full transition-all ${
              canDismiss
                ? "bg-foreground/10 hover:bg-foreground/20 cursor-pointer"
                : "bg-muted cursor-not-allowed opacity-60"
            }`}
            aria-label={canDismiss ? "Close ad" : `Wait ${countdown}s`}
          >
            {canDismiss ? (
              <X size={13} />
            ) : (
              <span className="text-[11px] font-bold tabular-nums">
                {countdown}
              </span>
            )}
          </button>
        </div>

        {/* Ad content */}
        {ad.htmlContent ? (
          <div ref={htmlRef} onClick={handleClick} className="cursor-pointer" />
        ) : (
          <a
            href={ad.targetUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={handleClick}
            className="block"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ad.imageUrl}
              alt={ad.altText ?? "Advertisement"}
              className="w-full object-cover"
            />
          </a>
        )}

        {/* Bottom bar */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/30">
          <p className="text-xs text-muted-foreground">
            {canDismiss
              ? "You can now close this ad"
              : `You can close this ad in ${countdown}s`}
          </p>
          <Button
            size="sm"
            variant={canDismiss ? "default" : "outline"}
            disabled={!canDismiss}
            onClick={handleDismiss}
            className="h-8 text-xs"
          >
            {canDismiss ? "Close Ad" : `Skip in ${countdown}s`}
          </Button>
        </div>
      </div>
    </div>
  );
}
