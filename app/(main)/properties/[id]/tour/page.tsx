"use client";

import { use, useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  MapPin,
  Building2,
  Ruler,
  Navigation,
  SkipBack,
  SkipForward,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProperty } from "@/lib/client/queries/properties.queries";

// ── Types ────────────────────────────────────────────────────────────
interface VideoState {
  playing: boolean;
  muted: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  buffered: number;
  fullscreen: boolean;
  showControls: boolean;
  loading: boolean;
  error: boolean;
}

// ── Helpers ──────────────────────────────────────────────────────────
function formatTime(seconds: number): string {
  if (isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Detects whether a resolved YouTube ID came from a Shorts URL */
function isYouTubeShorts(url: string): boolean {
  try {
    return new URL(url).pathname.startsWith("/shorts/");
  } catch {
    return false;
  }
}

function resolveVideoUrl(url: string): {
  type: "iframe" | "video";
  src: string;
  isShorts: boolean;
} {
  try {
    const parsed = new URL(url);
    const isShorts = parsed.pathname.startsWith("/shorts/");

    // youtube.com/watch?v=…
    // youtube.com/shorts/VIDEO_ID
    // youtu.be/VIDEO_ID
    const ytId = parsed.hostname.includes("youtube.com")
      ? isShorts
        ? parsed.pathname.split("/shorts/")[1]?.split("?")[0] // /shorts/VIDEO_ID
        : parsed.searchParams.get("v") // /watch?v=VIDEO_ID
      : parsed.hostname === "youtu.be"
        ? parsed.pathname.slice(1).split("?")[0] // youtu.be/VIDEO_ID
        : null;

    if (ytId) {
      return {
        type: "iframe",
        src: `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&color=white`,
        isShorts,
      };
    }

    // Already an embed / Vimeo player URL
    if (
      parsed.pathname.includes("/embed/") ||
      parsed.hostname.includes("player.vimeo")
    ) {
      return { type: "iframe", src: url, isShorts: false };
    }
  } catch {
    // not a valid absolute URL — treat as direct video src
  }

  return { type: "video", src: url, isShorts: false };
}

const DEFAULT_VIDEO_URL = "https://www.w3schools.com/html/mov_bbb.mp4";

// ── Page ─────────────────────────────────────────────────────────────
export default function VirtualTourPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  // ✅ useSearchParams() returns a ReadonlyURLSearchParams — use .get()
  const searchParams = useSearchParams();
  const urlFromQuery = searchParams.get("videourl"); // ?videourl=https://youtube.com/watch?v=…

  const { data: property, isLoading } = useProperty(id);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── URL priority: ?videourl query param → property.videoUrl → property.tourUrl → default
  const rawUrl: string =
    urlFromQuery ||
    (property?.videoUrl as string | undefined) ||
    (property?.tourUrl as string | undefined) ||
    DEFAULT_VIDEO_URL;

  const {
    type: videoType,
    src: resolvedSrc,
    isShorts,
  } = resolveVideoUrl(rawUrl);

  const [vs, setVs] = useState<VideoState>({
    playing: false,
    muted: false,
    volume: 1,
    currentTime: 0,
    duration: 0,
    buffered: 0,
    fullscreen: false,
    showControls: true,
    loading: true,
    error: false,
  });

  // ── Auto-hide controls ───────────────────────────────────────────
  const resetControlsTimer = useCallback(() => {
    setVs((p) => ({ ...p, showControls: true }));
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => {
      setVs((p) => (p.playing ? { ...p, showControls: false } : p));
    }, 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    };
  }, []);

  // ── Video event handlers ─────────────────────────────────────────
  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    const buffered =
      v.buffered.length > 0 ? v.buffered.end(v.buffered.length - 1) : 0;
    setVs((p) => ({
      ...p,
      currentTime: v.currentTime,
      duration: v.duration || 0,
      buffered,
    }));
  };

  const onLoadedMetadata = () => {
    const v = videoRef.current;
    if (!v) return;
    setVs((p) => ({ ...p, duration: v.duration, loading: false }));
  };

  const onWaiting = () => setVs((p) => ({ ...p, loading: true }));
  const onCanPlay = () => setVs((p) => ({ ...p, loading: false }));
  const onError = () => setVs((p) => ({ ...p, error: true, loading: false }));
  const onEnded = () =>
    setVs((p) => ({ ...p, playing: false, showControls: true }));

  // ── Playback controls ────────────────────────────────────────────
  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (vs.playing) {
      v.pause();
      setVs((p) => ({ ...p, playing: false }));
    } else {
      v.play();
      setVs((p) => ({ ...p, playing: true }));
    }
    resetControlsTimer();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !vs.muted;
    setVs((p) => ({ ...p, muted: !p.muted }));
  };

  const onVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const vol = parseFloat(e.target.value);
    v.volume = vol;
    v.muted = vol === 0;
    setVs((p) => ({ ...p, volume: vol, muted: vol === 0 }));
  };

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = parseFloat(e.target.value);
    setVs((p) => ({ ...p, currentTime: v.currentTime }));
    resetControlsTimer();
  };

  const skip = (secs: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.min(Math.max(v.currentTime + secs, 0), v.duration);
    resetControlsTimer();
  };

  const restart = () => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.play();
    setVs((p) => ({ ...p, playing: true, currentTime: 0 }));
    resetControlsTimer();
  };

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      await el.requestFullscreen();
      setVs((p) => ({ ...p, fullscreen: true }));
    } else {
      await document.exitFullscreen();
      setVs((p) => ({ ...p, fullscreen: false }));
    }
  };

  useEffect(() => {
    const onFsChange = () =>
      setVs((p) => ({ ...p, fullscreen: !!document.fullscreenElement }));
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const progressPct =
    vs.duration > 0 ? (vs.currentTime / vs.duration) * 100 : 0;
  const bufferedPct = vs.duration > 0 ? (vs.buffered / vs.duration) * 100 : 0;

  // ── Loading state ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          <p className="text-white/50 text-sm font-medium tracking-widest uppercase">
            Preparing tour…
          </p>
        </div>
      </div>
    );
  }

  const { title, location, price, area, category, face } = (property ?? {}) as {
    title?: string;
    location?: string;
    price?: number;
    area?: string | number;
    category?: string;
    face?: string;
  };

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full bg-black overflow-hidden select-none"
      onMouseMove={resetControlsTimer}
      onTouchStart={resetControlsTimer}
      style={{ cursor: vs.showControls ? "default" : "none" }}
    >
      {/* ── VIDEO / IFRAME ──────────────────────────────────────── */}
      {videoType === "iframe" ? (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            isShorts && "bg-black",
          )}
        >
          <iframe
            src={resolvedSrc}
            className={cn(
              "border-0",
              // Shorts are 9:16 portrait — constrain to a centred column
              isShorts
                ? "h-full w-auto max-w-[min(100%,420px)] aspect-[9/16]"
                : "absolute inset-0 w-full h-full",
            )}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="Virtual Tour"
          />
        </div>
      ) : (
        <video
          ref={videoRef}
          src={resolvedSrc}
          className="absolute inset-0 w-full h-full object-contain"
          onClick={togglePlay}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          onWaiting={onWaiting}
          onCanPlay={onCanPlay}
          onError={onError}
          onEnded={onEnded}
          playsInline
        />
      )}

      {/* ── SPINNER ─────────────────────────────────────────────── */}
      {vs.loading && videoType === "video" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        </div>
      )}

      {/* ── ERROR ───────────────────────────────────────────────── */}
      {vs.error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-black/80">
          <Video size={40} className="text-white/30 mb-3" />
          <p className="text-white/70 font-semibold text-sm">
            Could not load video
          </p>
          <p className="text-white/40 text-xs mt-1">
            Check the tour URL and try again
          </p>
        </div>
      )}

      {/* ── TOP CHROME ──────────────────────────────────────────── */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 z-40 transition-all duration-500",
          vs.showControls
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2 pointer-events-none",
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none" />

        <div className="relative flex items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-colors backdrop-blur-sm shrink-0"
            >
              <ArrowLeft size={15} className="text-white" />
            </button>
            <div className="min-w-0">
              <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest leading-none mb-0.5">
                Virtual Tour
              </p>
              <p className="text-sm font-bold text-white truncate leading-tight">
                {title ?? "Property Tour"}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 shrink-0">
            {/* Badge shown when a custom URL was passed via query param */}
            {urlFromQuery && (
              <div className="flex items-center gap-1.5 bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-full px-3 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] text-primary font-bold uppercase tracking-widest">
                  Custom URL
                </span>
              </div>
            )}
            {/* Badge shown for YouTube Shorts */}
            {isShorts && (
              <div className="flex items-center gap-1.5 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-full px-3 py-1.5">
                <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest">
                  Shorts
                </span>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5">
                <MapPin size={11} className="text-white/60" />
                <span className="text-[11px] text-white/80 font-medium max-w-[200px] truncate">
                  {location}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── PROPERTY INFO STRIP (top-right) ─────────────────────── */}
      <div
        className={cn(
          "absolute top-16 right-5 z-40 flex flex-col gap-2 transition-all duration-500",
          vs.showControls
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-4 pointer-events-none",
        )}
      >
        {[
          { icon: Building2, value: category },
          { icon: Ruler, value: area ? `${area} Ana` : undefined },
          { icon: Navigation, value: face },
        ]
          .filter((s) => !!s.value)
          .map(({ icon: Icon, value }) => (
            <div
              key={value}
              className="flex items-center gap-2 bg-black/50 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2"
            >
              <Icon size={12} className="text-white/50 shrink-0" />
              <span className="text-[11px] text-white/80 font-semibold">
                {value}
              </span>
            </div>
          ))}

        {price != null && (
          <div className="bg-primary/90 backdrop-blur-md rounded-xl px-3 py-2">
            <p className="text-[9px] text-primary-foreground/70 font-bold uppercase tracking-wider leading-none mb-0.5">
              Price
            </p>
            <p className="text-[12px] font-black text-primary-foreground leading-none">
              NPR {new Intl.NumberFormat("en-IN").format(price)}
            </p>
          </div>
        )}
      </div>

      {/* ── BIG PLAY button (video only, paused) ────────────────── */}
      {videoType === "video" && !vs.playing && !vs.loading && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center z-30 group"
        >
          <div className="w-20 h-20 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center transition-all duration-300 group-hover:scale-110 backdrop-blur-sm">
            <Play size={32} className="text-white fill-white ml-1" />
          </div>
        </button>
      )}

      {/* ── BOTTOM CONTROLS (video only) ────────────────────────── */}
      {videoType === "video" && (
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 z-40 transition-all duration-500",
            vs.showControls
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2 pointer-events-none",
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

          <div className="relative px-5 pb-6 pt-10 space-y-3">
            {/* Progress bar */}
            <div className="relative h-1 group cursor-pointer">
              <div
                className="absolute inset-y-0 left-0 bg-white/20 rounded-full"
                style={{ width: `${bufferedPct}%` }}
              />
              <div
                className="absolute inset-y-0 left-0 bg-primary rounded-full"
                style={{ width: `${progressPct}%` }}
              />
              <input
                type="range"
                min={0}
                max={vs.duration || 100}
                step={0.1}
                value={vs.currentTime}
                onChange={onSeek}
                className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ left: `calc(${progressPct}% - 6px)` }}
              />
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-between gap-4">
              {/* Left: playback */}
              <div className="flex items-center gap-2">
                <button
                  onClick={restart}
                  className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <RotateCcw size={14} className="text-white/70" />
                </button>
                <button
                  onClick={() => skip(-10)}
                  className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <SkipBack size={14} className="text-white/70" />
                </button>
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-xl bg-white hover:bg-white/90 flex items-center justify-center transition-all shadow-lg"
                >
                  {vs.playing ? (
                    <Pause size={16} className="text-black fill-black" />
                  ) : (
                    <Play size={16} className="text-black fill-black ml-0.5" />
                  )}
                </button>
                <button
                  onClick={() => skip(10)}
                  className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <SkipForward size={14} className="text-white/70" />
                </button>
              </div>

              {/* Centre: timestamps */}
              <div className="text-[11px] font-mono text-white/60 font-medium tabular-nums">
                {formatTime(vs.currentTime)}{" "}
                <span className="text-white/30">/</span>{" "}
                {formatTime(vs.duration)}
              </div>

              {/* Right: volume + fullscreen */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  {vs.muted || vs.volume === 0 ? (
                    <VolumeX size={14} className="text-white/70" />
                  ) : (
                    <Volume2 size={14} className="text-white/70" />
                  )}
                </button>

                <div className="relative w-20 h-1">
                  <div className="absolute inset-0 bg-white/20 rounded-full" />
                  <div
                    className="absolute inset-y-0 left-0 bg-white/70 rounded-full"
                    style={{ width: `${(vs.muted ? 0 : vs.volume) * 100}%` }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={vs.muted ? 0 : vs.volume}
                    onChange={onVolumeChange}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
                  />
                </div>

                <button
                  onClick={toggleFullscreen}
                  className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  {vs.fullscreen ? (
                    <Minimize2 size={14} className="text-white/70" />
                  ) : (
                    <Maximize2 size={14} className="text-white/70" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── iframe fullscreen hint ───────────────────────────────── */}
      {videoType === "iframe" && vs.showControls && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-40">
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-4 py-2">
            <Maximize2 size={12} className="text-white/50" />
            <span className="text-[11px] text-white/60 font-medium">
              Use the player controls for fullscreen
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
