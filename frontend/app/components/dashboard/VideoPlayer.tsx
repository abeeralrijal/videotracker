"use client";

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
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    onSeek?.(value);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Video Player
        </h3>
        <p className="text-xs text-zinc-500">(uploaded video playing)</p>
      </div>

      <div className="aspect-video overflow-hidden rounded-lg bg-zinc-900">
        {src ? (
          <video
            src={src}
            className="h-full w-full object-contain"
            controls
            playsInline
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-500">
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
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 accent-zinc-900"
        />
        <div className="flex justify-between text-sm text-zinc-600">
          <span>{formatTime(currentTime)}</span>
          <span> / </span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}
