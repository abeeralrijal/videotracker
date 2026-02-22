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
    <div className="flex flex-col gap-3 rounded-xl border border-slate-800/70 bg-slate-950/50 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span
            className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${dotColor}`}
          />
          <div>
            <p className="text-sm font-medium text-slate-100">{alert.type}</p>
            <p className="text-xs text-slate-500">
              {alert.timestamp} · {alert.confidence}%
            </p>
          </div>
          <span className="flex items-center gap-1 rounded-md bg-slate-900/70 px-2 py-0.5 text-xs text-slate-300">
            <span className="animate-pulse text-amber-300">⏳</span>
            {alert.status}
          </span>
        </div>
      </div>
      <p className="text-sm italic text-slate-300">"{alert.description}"</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onPlayClip(alert)}
          className="btn-secondary flex items-center gap-1.5 px-2.5 py-1.5 text-xs"
        >
          <PlayIcon className="h-3.5 w-3.5" />
          Play Clip
        </button>
        <button
          type="button"
          onClick={() => onReview(alert)}
          className="rounded-md border border-amber-400/40 bg-amber-400/10 px-2.5 py-1.5 text-xs font-medium text-amber-200 transition-colors hover:bg-amber-400/20"
        >
          Review
        </button>
        <button
          type="button"
          onClick={() => onConfirm(alert)}
          className="rounded-md border border-emerald-400/40 bg-emerald-400/10 px-2.5 py-1.5 text-xs font-medium text-emerald-200 transition-colors hover:bg-emerald-400/20"
        >
          ✓ Confirm
        </button>
        <button
          type="button"
          onClick={() => onDismiss(alert)}
          className="rounded-md border border-slate-700/70 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800/70"
        >
          ✗ Dismiss
        </button>
      </div>
    </div>
  );
}
