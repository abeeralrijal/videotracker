"use client";

import Link from "next/link";
import { ShieldIcon, BarChartIcon } from "../icons";
import { USE_CASES, type UseCaseValue } from "@/lib/constants";

/** Props for DashboardHeader */
interface DashboardHeaderProps {
  useCase: UseCaseValue;
  onUseCaseChange: (value: UseCaseValue) => void;
  onStop: () => void;
}

/** Dashboard header: logo, use case selector, monitoring status, Event History link, Stop button. */
export function DashboardHeader({
  useCase,
  onUseCaseChange,
  onStop,
}: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-zinc-200 px-6 py-4">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <ShieldIcon className="h-6 w-6 text-red-500" />
          <span className="text-xl font-semibold tracking-tight text-zinc-900">
            SentinelAI
          </span>
        </Link>
        <select
          value={useCase}
          onChange={(e) => onUseCaseChange(e.target.value as UseCaseValue)}
          className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        >
          {USE_CASES.map((uc) => (
            <option key={uc.value} value={uc.value}>
              {uc.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-4">
        <Link
          href="/analytics"
          className="flex items-center gap-2 rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          <BarChartIcon className="h-4 w-4" />
          Event History
        </Link>
        <span className="flex items-center gap-2 text-sm font-medium text-emerald-600">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          MONITORING
        </span>
        <button
          type="button"
          onClick={onStop}
          className="flex items-center gap-1.5 rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
        >
          <span className="text-zinc-500">■</span>
          Stop
        </button>
      </div>
    </header>
  );
}
