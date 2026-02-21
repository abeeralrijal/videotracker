"use client";

import { useState, useCallback } from "react";
import type { Alert } from "@/lib/types";
import type { ReviewSeverity } from "@/lib/types";

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border-2 border-dashed border-zinc-300 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 shrink-0 rounded-full bg-red-500" />
            <h2 className="text-lg font-bold text-zinc-900">
              {alert.type} - Confidence: {alert.confidence}%
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
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
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Video Clip Player
            </h3>
            <div className="aspect-video rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-400 text-sm">
              (5-10 second clip)
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
              >
                <svg className="ml-0.5 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
              <div className="h-2 flex-1 rounded-full bg-zinc-200">
                <div className="h-full w-1/3 rounded-full bg-zinc-600" />
              </div>
              <span className="text-sm text-zinc-600">0:08</span>
            </div>
          </div>

          {/* AI Explanation */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              AI Explanation:
            </h3>
            <p className="text-sm text-red-600">
              {alert.description}
            </p>
          </div>

          {/* Your Review */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Your Review:
            </h3>

            <div>
              <p className="mb-2 text-sm font-medium text-zinc-700">Was AI correct?</p>
              <div className="flex gap-4">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="wasCorrect"
                    checked={wasCorrect === true}
                    onChange={() => setWasCorrect(true)}
                    className="h-4 w-4 accent-emerald-600"
                  />
                  <span className="text-sm text-zinc-700">✓ Yes, correct</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="wasCorrect"
                    checked={wasCorrect === false}
                    onChange={() => setWasCorrect(false)}
                    className="h-4 w-4 accent-red-600"
                  />
                  <span className="text-sm text-zinc-700">✗ False alarm</span>
                </label>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-zinc-700">Severity:</p>
              <div className="flex flex-wrap gap-4">
                {(["Low", "Medium", "High", "Critical"] as const).map((s) => (
                  <label key={s} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="severity"
                      checked={severity === s}
                      onChange={() => setSeverity(s)}
                      className="h-4 w-4 accent-zinc-900"
                    />
                    <span className="text-sm text-zinc-700">{s}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="mb-2 block text-sm font-medium text-zinc-700">
                Notes:
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Students roughhousing, not a real fight"
                rows={3}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={wasCorrect === null}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-6 py-3.5 font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>💾</span>
            <span>Submit Review</span>
          </button>
        </div>
      </div>
    </div>
  );
}
