"use client";

/** Props for ProcessingStatus */
interface ProcessingStatusProps {
  progress: number;
  chunksAnalyzed: number;
  totalChunks: number;
  failedChunks?: number;
}

/** Displays video processing progress and chunks analyzed. */
export function ProcessingStatus({
  progress,
  chunksAnalyzed,
  totalChunks,
  failedChunks = 0,
}: ProcessingStatusProps) {
  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-400">Processing:</span>
        <span className="inline-flex items-center gap-1">
          <span className="animate-pulse text-amber-300">...</span>
          <span className="font-medium text-slate-100">{progress}%</span>
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-amber-400 transition-all"
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        />
      </div>
      <p className="text-xs text-slate-500">
        Chunks analyzed: {chunksAnalyzed}/{totalChunks}
      </p>
      {failedChunks > 0 && (
        <p className="text-xs text-amber-300">
          Analysis warning: {failedChunks} chunk{failedChunks === 1 ? "" : "s"} failed to process.
        </p>
      )}
    </div>
  );
}
