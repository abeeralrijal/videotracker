"use client";

/** Props for ProcessingStatus */
interface ProcessingStatusProps {
  progress: number;
  chunksAnalyzed: number;
  totalChunks: number;
}

/** Displays video processing progress and chunks analyzed. */
export function ProcessingStatus({
  progress,
  chunksAnalyzed,
  totalChunks,
}: ProcessingStatusProps) {
  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-zinc-600">Processing:</span>
        <span className="inline-flex items-center gap-1">
          <span className="animate-pulse">...</span>
          <span className="font-medium text-zinc-900">{progress}%</span>
        </span>
      </div>
      <p className="text-xs text-zinc-500">
        Chunks analyzed: {chunksAnalyzed}/{totalChunks}
      </p>
    </div>
  );
}
