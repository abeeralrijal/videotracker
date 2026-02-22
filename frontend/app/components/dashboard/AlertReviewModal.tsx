"use client";

import { useState, useCallback, useMemo } from "react";
import type { Alert } from "@/lib/types";
import type { ReviewSeverity } from "@/lib/types";
import { API_BASE_URL } from "@/lib/api/client";

/** Props for AlertReviewModal */
interface AlertReviewModalProps {
  alert: Alert;
  onClose: () => void;
  onSubmit: (alert: Alert, review: { wasCorrect: boolean; severity: ReviewSeverity; notes: string }) => void;
}

/** Modal for operator to review alert: video clip, AI explanation, correctness, severity, notes. */
export function AlertReviewModal({
  alert,
  onClose,
  onSubmit,
}: AlertReviewModalProps) {
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [severity, setSeverity] = useState<ReviewSeverity>("High");
  const [notes, setNotes] = useState("");

  const clipUrl = useMemo(() => {
    if (!alert.videoId || !alert.chunkFilename) return undefined;
    return `${API_BASE_URL}/api/video/${alert.videoId}/${alert.chunkFilename}`;
  }, [alert.videoId, alert.chunkFilename]);

  const handleSubmit = useCallback(() => {
    if (wasCorrect === null) return;
    onSubmit(alert, { wasCorrect, severity, notes });
    onClose();
  }, [alert, wasCorrect, severity, notes, onSubmit, onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-800/70 bg-slate-950/95 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/70 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 shrink-0 rounded-full bg-amber-400" />
            <h2 className="text-lg font-bold text-slate-100">
              {alert.type} - Confidence: {alert.confidence}%
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
            aria-label="Close"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="space-y-6 p-6">
          {/* Video Clip Player */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Video Clip Player
            </h3>
            <div className="flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-slate-800/70 bg-slate-900/70 text-sm text-slate-400">
              {clipUrl ? (
                <video
                  src={clipUrl}
                  className="h-full w-full object-contain"
                  controls
                  playsInline
                />
              ) : (
                <span>Clip not available</span>
              )}
            </div>
          </div>

          {/* AI Explanation */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              AI Explanation:
            </h3>
            <p className="text-sm text-amber-200">
              {alert.description}
            </p>
          </div>

          {/* Your Review */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Your Review:
            </h3>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-200">Was AI correct?</p>
              <div className="flex gap-4">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="wasCorrect"
                    checked={wasCorrect === true}
                    onChange={() => setWasCorrect(true)}
                    className="h-4 w-4 accent-emerald-400"
                  />
                  <span className="text-sm text-slate-200">✓ Yes, correct</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="wasCorrect"
                    checked={wasCorrect === false}
                    onChange={() => setWasCorrect(false)}
                    className="h-4 w-4 accent-red-400"
                  />
                  <span className="text-sm text-slate-200">✗ False alarm</span>
                </label>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-200">Severity:</p>
              <div className="flex flex-wrap gap-4">
                {(["Low", "Medium", "High", "Critical"] as const).map((s) => (
                  <label key={s} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="severity"
                      checked={severity === s}
                      onChange={() => setSeverity(s)}
                      className="h-4 w-4 accent-amber-400"
                    />
                    <span className="text-sm text-slate-200">{s}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="mb-2 block text-sm font-medium text-slate-200">
                Notes:
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Students roughhousing, not a real fight"
                rows={3}
                className="input-field"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={wasCorrect === null}
            className="btn-primary flex w-full items-center justify-center gap-2"
          >
            <span>💾</span>
            <span>Submit Review</span>
          </button>
        </div>
      </div>
    </div>
  );
}
