"use client";

import { useEffect, useRef } from "react";

/** Props for VideoPlayer */
interface VideoPlayerProps {
  src?: string;
  currentTime: number;
  duration: number;
  onSeek?: (time: number) => void;
}

/** Format seconds as HH:MM:SS */
function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [h, m, s].map((n) => n.toString().padStart(2, "0")).join(":");
}

/** Video player with progress bar and seek control. Shows placeholder when no src. */
export function VideoPlayer({
  src,
  currentTime,
  duration,
  onSeek,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!videoRef.current || !Number.isFinite(currentTime)) return;
    const delta = Math.abs(videoRef.current.currentTime - currentTime);
    if (delta > 0.25) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime, src]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    onSeek?.(value);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Video Player
        </h3>
        <p className="text-xs text-slate-500">(uploaded video playing)</p>
      </div>

      <div className="aspect-video overflow-hidden rounded-xl border border-slate-800/70 bg-slate-950/60">
        {src ? (
          <video
            src={src}
            ref={videoRef}
            className="h-full w-full object-contain"
            controls
            playsInline
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-500">
            <span className="text-sm">No video loaded</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSliderChange}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-800 accent-amber-400"
        />
        <div className="flex justify-between text-sm text-slate-400">
          <span>{formatTime(currentTime)}</span>
          <span> / </span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}
