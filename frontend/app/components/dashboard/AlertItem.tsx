"use client";

import { PlayIcon } from "../icons";
import type { Alert } from "@/lib/types";

/** Props for AlertItem */
interface AlertItemProps {
  alert: Alert;
  onPlayClip: (alert: Alert) => void;
  onConfirm: (alert: Alert) => void;
  onDismiss: (alert: Alert) => void;
  onReview: (alert: Alert) => void;
}

const SEVERITY_STYLES = {
  HIGH: "bg-red-500",
  MED: "bg-amber-500",
  LOW: "bg-emerald-500",
} as const;

/** Single alert card with Play Clip, Review, Confirm, Dismiss actions. */
export function AlertItem({
  alert,
  onPlayClip,
  onConfirm,
  onDismiss,
  onReview,
}: AlertItemProps) {
  const dotColor = SEVERITY_STYLES[alert.severity];

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span
            className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${dotColor}`}
          />
          <div>
            <p className="text-sm font-medium text-zinc-900">{alert.type}</p>
            <p className="text-xs text-zinc-500">
              {alert.timestamp} · {alert.confidence}%
            </p>
          </div>
          <span className="flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
            <span className="animate-pulse">⏳</span>
            {alert.status}
          </span>
        </div>
      </div>
      <p className="text-sm italic text-zinc-600">"{alert.description}"</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onPlayClip(alert)}
          className="flex items-center gap-1.5 rounded-md border border-zinc-300 px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          <PlayIcon className="h-3.5 w-3.5" />
          Play Clip
        </button>
        <button
          type="button"
          onClick={() => onReview(alert)}
          className="rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100"
        >
          Review
        </button>
        <button
          type="button"
          onClick={() => onConfirm(alert)}
          className="rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
        >
          ✓ Confirm
        </button>
        <button
          type="button"
          onClick={() => onDismiss(alert)}
          className="rounded-md border border-zinc-300 px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
        >
          ✗ Dismiss
        </button>
      </div>
    </div>
  );
}
