"use client";

/**
 * Event history / analytics: summary stats and breakdown by event type.
 * Data from useAnalytics hook.
 */

import { useAnalytics, useAuthGuard } from "@/hooks";
import { AppShell } from "@/app/components/layout/AppShell";

export default function AnalyticsPage() {
  useAuthGuard();
  const { summary, eventStats, isLoading, error } = useAnalytics({});

  return (
    <AppShell
      title="Event History"
      subtitle="Analytics"
      status={
        <span className="badge border-cyan-400/40 bg-cyan-400/10 text-cyan-200">
          Analytics
        </span>
      }
    >
      <div className="mx-auto max-w-5xl">
        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error.message}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <span className="text-slate-400">Loading analytics...</span>
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

            <div className="overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950/70">
              <h2 className="border-b border-slate-800/70 px-6 py-4 text-sm font-semibold uppercase tracking-wider text-slate-300">
                Detailed Events
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800/70 bg-slate-900/80">
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Event Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Count
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Confirmed
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Accuracy
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {eventStats.map((row) => (
                      <tr key={row.eventType} className="hover:bg-slate-900/40">
                        <td className="px-6 py-4 text-sm font-medium text-slate-100">
                          {row.eventType}
                        </td>
                        <td className="px-6 py-4 text-sm text-emerald-300">
                          {row.count}
                        </td>
                        <td className="px-6 py-4 text-sm text-emerald-300">
                          {row.confirmed}
                        </td>
                        <td className="px-6 py-4 text-sm text-emerald-300">
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
      </div>
    </AppShell>
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
    <div className="rounded-xl border border-slate-800/70 bg-slate-950/60 p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p
        className={`mt-1 text-2xl font-bold ${
          highlight ? "text-emerald-300" : "text-slate-100"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
