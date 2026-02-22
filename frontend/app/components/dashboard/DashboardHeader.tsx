"use client";

import Link from "next/link";
import { ShieldIcon, BarChartIcon } from "../icons";

/** Props for DashboardHeader */
interface DashboardHeaderProps {
  onStop: () => void;
  mode?: "monitor" | "ask";
  videoId?: string;
}

/** Dashboard header: logo, use case selector, monitoring status, Event History link, Stop button. */
export function DashboardHeader({
  onStop,
  mode = "monitor",
  videoId,
}: DashboardHeaderProps) {
  const isAskMode = mode === "ask";
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-slate-800/70 bg-slate-950/70 px-6 py-4 backdrop-blur">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <ShieldIcon className="h-6 w-6 text-amber-400" />
          <span className="text-xl font-semibold tracking-tight text-slate-100">
            SentinelAI
          </span>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        {!isAskMode && (
          <Link
            href={videoId ? `/analytics?videoId=${videoId}` : "/analytics"}
            className="btn-secondary flex items-center gap-2 px-3 py-1.5 text-sm"
          >
            <BarChartIcon className="h-4 w-4" />
            Event History
          </Link>
        )}
        {isAskMode ? (
          <span className="badge border-amber-400/40 bg-amber-400/10 text-amber-200">
            Ask Mode
          </span>
        ) : (
          <span className="flex items-center gap-2 text-sm font-medium text-emerald-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            MONITORING
          </span>
        )}
        <button
          type="button"
          onClick={onStop}
          className="btn-ghost flex items-center gap-1.5 px-3 py-1.5 text-sm"
        >
          <span className="text-slate-400">■</span>
          {isAskMode ? "Exit" : "Stop"}
        </button>
      </div>
    </header>
  );
}
