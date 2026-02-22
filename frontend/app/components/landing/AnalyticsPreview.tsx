"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChartIcon } from "@/app/components/icons";
import {
  buildBars,
  buildLinePath,
  generateFakeAnalytics,
} from "@/lib/analyticsDemo";

export function AnalyticsPreview() {
  const [data, setData] = useState(() => generateFakeAnalytics(10, 42));

  useEffect(() => {
    setData(generateFakeAnalytics(10));
  }, []);
  const incidentSeries = data.daily.map((point) => point.incidents);
  const criticalSeries = data.daily.map((point) => point.critical);
  const linePath = buildLinePath(incidentSeries, 480, 120);
  const criticalPath = buildLinePath(criticalSeries, 480, 120);
  const bars = buildBars(
    data.categoryStats.slice(0, 6).map((stat) => stat.count),
    480,
    90
  );

  const totalIncidents = incidentSeries.reduce((sum, value) => sum + value, 0);
  const totalCritical = criticalSeries.reduce((sum, value) => sum + value, 0);
  const topCategory = data.categoryStats[0]?.label ?? "Unknown";
  const topLocation = data.locations[0] ?? "North Lot";

  return (
    <section className="panel mt-12 p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="badge border-cyan-400/40 bg-cyan-400/10 text-cyan-200">
            Analytics Preview
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-slate-100">
            Ops Intelligence Snapshot
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Metrics refresh on each load. Open the full analytics dashboard for
            detailed trends.
          </p>
        </div>
        <Link href="/analytics-insights" className="btn-secondary">
          <span className="flex items-center gap-2">
            <BarChartIcon className="h-4 w-4 text-amber-300" />
            View Analytics
          </span>
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <PreviewStat label="Total Incidents (10d)" value={totalIncidents} />
        <PreviewStat label="Critical Incidents" value={totalCritical} highlight />
        <PreviewStat label="Top Category" value={topCategory} />
        <PreviewStat label="Hotspot" value={topLocation} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800/70 bg-slate-950/60 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Incident Volume
            </h3>
            <span className="text-xs text-slate-500">Last 10 days</span>
          </div>
          <div className="mt-4">
            <svg viewBox="0 0 480 140" className="h-36 w-full">
              <path d={linePath} fill="none" stroke="#fbbf24" strokeWidth="3" />
              <path d={criticalPath} fill="none" stroke="#f87171" strokeWidth="2" />
            </svg>
            <div className="mt-2 flex justify-between text-[11px] text-slate-500">
              {data.daily.map((point) => (
                <span key={point.label}>{point.label}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800/70 bg-slate-950/60 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Top Categories
            </h3>
            <span className="text-xs text-slate-500">Snapshot</span>
          </div>
          <div className="mt-4">
            <svg viewBox="0 0 480 100" className="h-28 w-full">
              {bars.map((bar, index) => (
                <rect
                  key={`bar-${index}`}
                  x={bar.x}
                  y={bar.y}
                  width={bar.width}
                  height={bar.height}
                  rx={6}
                  fill={getPreviewBarColor(index)}
                />
              ))}
            </svg>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-400">
              {data.categoryStats.slice(0, 6).map((stat) => (
                <div key={stat.label} className="flex items-center justify-between">
                  <span>{stat.label}</span>
                  <span className="text-slate-200">{stat.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PreviewStat({
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
        className={`mt-2 text-2xl font-semibold ${
          highlight ? "text-amber-300" : "text-slate-100"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function getPreviewBarColor(index: number) {
  const colors = ["#38bdf8", "#fbbf24", "#f472b6", "#34d399", "#a78bfa", "#f97316"];
  return colors[index % colors.length];
}
