"use client";

/**
 * Event history / analytics: summary stats and breakdown by event type.
 * Data from useAnalytics hook.
 */

import Link from "next/link";
import { ShieldIcon, BarChartIcon } from "@/app/components/icons";
import { useAnalytics } from "@/hooks";

export default function AnalyticsPage() {
  const { summary, eventStats, isLoading, error } = useAnalytics();

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <ShieldIcon className="h-6 w-6 text-red-500" />
          <span className="text-xl font-semibold tracking-tight text-zinc-900">
            SentinelAI
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
          >
            Dashboard
          </Link>
          <div className="flex items-center gap-2 rounded-md border border-zinc-300 bg-zinc-50 px-4 py-2">
            <BarChartIcon className="h-5 w-5 text-zinc-600" />
            <span className="text-sm font-medium text-zinc-700">
              Event History
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error.message}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <span className="text-zinc-500">Loading analytics...</span>
          </div>
        ) : summary ? (
          <>
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <SummaryCard
                label="Total Events"
                value={summary.totalEvents}
                highlight
              />
              <SummaryCard label="Confirmed" value={summary.confirmed} />
              <SummaryCard
                label="Dismissed"
                value={summary.dismissed}
                highlight
              />
              <SummaryCard
                label="AI Accuracy"
                value={`${summary.aiAccuracy}%`}
                highlight
              />
              <SummaryCard
                label="Avg Confidence"
                value={`${summary.avgConfidence}%`}
                highlight
              />
            </div>

            <div className="overflow-hidden rounded-xl border-2 border-dashed border-zinc-300 bg-white">
              <h2 className="border-b border-zinc-200 px-6 py-4 text-sm font-semibold uppercase tracking-wider text-zinc-600">
                Detailed Events
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50">
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                        Event Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                        Count
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                        Confirmed
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                        Accuracy
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {eventStats.map((row) => (
                      <tr key={row.eventType} className="hover:bg-zinc-50/50">
                        <td className="px-6 py-4 text-sm font-medium text-zinc-900">
                          {row.eventType}
                        </td>
                        <td className="px-6 py-4 text-sm text-emerald-600">
                          {row.count}
                        </td>
                        <td className="px-6 py-4 text-sm text-emerald-600">
                          {row.confirmed}
                        </td>
                        <td className="px-6 py-4 text-sm text-emerald-600">
                          {row.accuracy}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number | string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border-2 border-dashed border-zinc-300 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p
        className={`mt-1 text-2xl font-bold ${
          highlight ? "text-emerald-600" : "text-zinc-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
