"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthGuard } from "@/hooks";
import { AppShell } from "@/app/components/layout/AppShell";
import {
  buildBars,
  buildLinePath,
  generateFakeAnalytics,
} from "@/lib/analyticsDemo";
import { fetchAlerts } from "@/lib/api/alerts";
import { API_BASE_URL } from "@/lib/api/client";
import { getLastSessionId } from "@/lib/session";
import type { Alert, AlertSeverity } from "@/lib/types";

type IncidentView = {
  id: string;
  time: string;
  category: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  location: string;
  summary: string;
  status: "Open" | "Investigating" | "Resolved";
  videoId?: string;
  chunkFilename?: string;
};

export default function AnalyticsInsightsPage() {
  useAuthGuard();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hoverBar, setHoverBar] = useState<number | null>(null);
  const [clipAlert, setClipAlert] = useState<IncidentView | null>(null);
  const [recentIncidents, setRecentIncidents] = useState<IncidentView[]>([]);

  const [data, setData] = useState(() => generateFakeAnalytics(14, 42));
  const incidentSeries = data.daily.map((d) => d.incidents);
  const criticalSeries = data.daily.map((d) => d.critical);
  const lineWidth = 520;
  const lineHeight = 120;
  const barWidth = 520;
  const barHeight = 120;
  const linePath = buildLinePath(incidentSeries, lineWidth, lineHeight);
  const criticalPath = buildLinePath(criticalSeries, lineWidth, lineHeight);
  const bars = buildBars(data.categoryStats.map((c) => c.count), barWidth, barHeight);
  const incidentPoints = buildLinePoints(incidentSeries, lineWidth, lineHeight);
  const criticalPoints = buildLinePoints(criticalSeries, lineWidth, lineHeight);
  const hoverPoint =
    hoverIndex !== null ? incidentPoints[hoverIndex] : undefined;
  const hoverCritical =
    hoverIndex !== null ? criticalPoints[hoverIndex] : undefined;
  const hoverDay = hoverIndex !== null ? data.daily[hoverIndex] : undefined;
  const demoIncidents: IncidentView[] = useMemo(
    () =>
      data.recentIncidents.map((incident) => ({
        id: incident.id,
        time: incident.time,
        category: incident.category,
        severity: incident.severity,
        location: incident.location,
        summary: incident.summary,
        status: incident.status,
      })),
    [data]
  );

  useEffect(() => {
    setData(generateFakeAnalytics());
  }, []);

  useEffect(() => {
    let isMounted = true;
    const sessionId = getLastSessionId();
    if (!sessionId) {
      setRecentIncidents(demoIncidents);
      return undefined;
    }
    fetchAlerts(sessionId)
      .then((alerts) => {
        if (!isMounted) return;
        if (!alerts.length) {
          setRecentIncidents(demoIncidents);
          return;
        }
        const mapped = alerts.slice(0, 8).map((alert) => mapAlertToIncident(alert));
        setRecentIncidents(mapped);
      })
      .catch(() => {
        if (isMounted) setRecentIncidents(demoIncidents);
      });
    return () => {
      isMounted = false;
    };
  }, [demoIncidents]);

  return (
    <AppShell
      title="Ops Insights"
      subtitle="Analytics"
      status={
        <span className="badge border-cyan-400/40 bg-cyan-400/10 text-cyan-200">
          Insights
        </span>
      }
    >
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="grid gap-4 md:grid-cols-4">
          <SummaryCard label="Total Incidents (14d)" value={data.daily.reduce((a, b) => a + b.incidents, 0)} />
          <SummaryCard label="Critical Incidents" value={data.daily.reduce((a, b) => a + b.critical, 0)} highlight />
          <SummaryCard label="Avg Daily Volume" value={Math.round(incidentSeries.reduce((a, b) => a + b, 0) / incidentSeries.length)} />
          <SummaryCard label="Top Category" value={data.categoryStats[0]?.label ?? "Unknown"} />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="panel p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                Incident Volume (14 days)
              </h2>
              <span className="text-xs text-slate-400">Updated on load</span>
            </div>
            <div className="relative mt-4">
              <svg
                viewBox={`0 0 ${lineWidth} 140`}
                className="h-40 w-full cursor-crosshair"
                onMouseMove={(event) => {
                  const bounds = event.currentTarget.getBoundingClientRect();
                  const ratio = Math.min(
                    Math.max((event.clientX - bounds.left) / bounds.width, 0),
                    1
                  );
                  const index = Math.round(ratio * (incidentSeries.length - 1));
                  setHoverIndex(index);
                }}
                onMouseLeave={() => setHoverIndex(null)}
              >
                <defs>
                  <linearGradient id="incidentGlow" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={linePath} fill="none" stroke="#fbbf24" strokeWidth="3" />
                <path d={criticalPath} fill="none" stroke="#f87171" strokeWidth="2" />
                {hoverPoint && (
                  <>
                    <circle cx={hoverPoint.x} cy={hoverPoint.y} r="4" fill="#fbbf24" />
                    {hoverCritical && (
                      <circle cx={hoverCritical.x} cy={hoverCritical.y} r="3" fill="#f87171" />
                    )}
                    <line
                      x1={hoverPoint.x}
                      x2={hoverPoint.x}
                      y1={0}
                      y2={140}
                      stroke="#334155"
                      strokeDasharray="4 6"
                    />
                  </>
                )}
              </svg>
              {hoverDay && (
                <div className="absolute right-4 top-4 rounded-xl border border-slate-700/60 bg-slate-950/90 px-3 py-2 text-xs text-slate-200 shadow-lg">
                  <p className="font-semibold text-slate-100">{hoverDay.label}</p>
                  <p>Total incidents: {hoverDay.incidents}</p>
                  <p className="text-red-300">Critical: {hoverDay.critical}</p>
                </div>
              )}
              <div className="mt-3 flex justify-between text-xs text-slate-500">
                {data.daily.map((point) => (
                  <span key={point.label}>{point.label}</span>
                ))}
              </div>
            </div>
            <div className="mt-4 flex gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-300" />
                Total incidents
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                Critical
              </span>
            </div>
          </div>

          <div className="panel p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Incident Categories
            </h2>
            <div className="relative mt-4">
              <svg
                viewBox={`0 0 ${barWidth} 140`}
                className="h-40 w-full cursor-crosshair"
                onMouseMove={(event) => {
                  const bounds = event.currentTarget.getBoundingClientRect();
                  const x = ((event.clientX - bounds.left) / bounds.width) * barWidth;
                  const match = bars.findIndex(
                    (bar) => x >= bar.x && x <= bar.x + bar.width
                  );
                  setHoverBar(match >= 0 ? match : null);
                }}
                onMouseLeave={() => setHoverBar(null)}
              >
                {bars.map((bar, index) => {
                  const isActive = hoverBar === index;
                  return (
                    <rect
                      key={data.categoryStats[index].label}
                      x={bar.x}
                      y={bar.y}
                      width={bar.width}
                      height={bar.height}
                      rx={6}
                      fill={getBarColor(index, isActive)}
                      opacity={isActive ? 1 : 0.85}
                    />
                  );
                })}
              </svg>
              {hoverBar !== null && data.categoryStats[hoverBar] && (
                <div className="absolute right-4 top-4 rounded-xl border border-slate-700/60 bg-slate-950/90 px-3 py-2 text-xs text-slate-200 shadow-lg">
                  <p className="font-semibold text-slate-100">
                    {data.categoryStats[hoverBar].label}
                  </p>
                  <p>Incidents: {data.categoryStats[hoverBar].count}</p>
                  <p
                    className={
                      data.categoryStats[hoverBar].trend >= 0
                        ? "text-emerald-300"
                        : "text-red-300"
                    }
                  >
                    Trend: {data.categoryStats[hoverBar].trend}%
                  </p>
                </div>
              )}
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-400">
                {data.categoryStats.map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <span>{stat.label}</span>
                    <span className="text-slate-300">{stat.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="panel p-6 lg:col-span-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Recent Security Incidents
            </h2>
            <div className="mt-4 space-y-3">
              {recentIncidents.map((incident) => (
                <div
                  key={incident.id}
                  className="flex flex-col gap-2 rounded-xl border border-slate-800/70 bg-slate-950/40 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${getSeverityDot(
                          incident.severity
                        )}`}
                      />
                      {incident.category}
                    </div>
                    <span className="text-xs text-slate-400">{incident.time}</span>
                  </div>
                  <p className="text-xs text-slate-400">{incident.summary}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="badge">{incident.location}</span>
                    <span className={getSeverityBadge(incident.severity)}>
                      {incident.severity}
                    </span>
                    <span className={getStatusBadge(incident.status)}>
                      {incident.status}
                    </span>
                    {incident.videoId && incident.chunkFilename ? (
                      <button
                        type="button"
                        onClick={() => setClipAlert(incident)}
                        className="btn-ghost px-2.5 py-1.5 text-xs"
                      >
                        View Incident
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-500">
                        Clip unavailable
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Risk Hotspots
            </h2>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              {data.locations.map((location, index) => (
                <div key={location} className="flex items-center justify-between">
                  <span>{location}</span>
                  <span className="text-amber-300">{14 - index}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Metrics refresh on each load.
            </p>
          </div>
        </section>
      </div>

      {clipAlert && clipAlert.videoId && clipAlert.chunkFilename && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-8">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-800/70 bg-slate-950/95 p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-100">
                  {clipAlert.category}
                </p>
                <p className="text-xs text-slate-400">
                  {clipAlert.time} · {clipAlert.location}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setClipAlert(null)}
                className="btn-ghost px-2.5 py-1.5 text-xs"
              >
                Close
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-400">{clipAlert.summary}</p>
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-800/70 bg-black">
              <video
                controls
                className="h-72 w-full bg-black"
                src={`${API_BASE_URL}/api/video/${clipAlert.videoId}/${clipAlert.chunkFilename}`}
              />
            </div>
          </div>
        </div>
      )}
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
        className={`mt-2 text-2xl font-semibold ${
          highlight ? "text-amber-300" : "text-slate-100"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function buildLinePoints(points: number[], width: number, height: number) {
  const maxValue = Math.max(...points, 1);
  const minValue = Math.min(...points, 0);
  const range = Math.max(maxValue - minValue, 1);
  return points.map((value, index) => {
    const x = (index / (points.length - 1)) * width;
    const y = height - ((value - minValue) / range) * height;
    return { x, y };
  });
}

function getSeverityDot(severity: "Critical" | "High" | "Medium" | "Low") {
  if (severity === "Critical") return "bg-red-500";
  if (severity === "High") return "bg-amber-500";
  if (severity === "Medium") return "bg-cyan-500";
  return "bg-emerald-500";
}

function getSeverityBadge(severity: "Critical" | "High" | "Medium" | "Low") {
  if (severity === "Critical") {
    return "badge border-red-400/40 bg-red-400/10 text-red-200";
  }
  if (severity === "High") {
    return "badge border-amber-400/40 bg-amber-400/10 text-amber-200";
  }
  if (severity === "Medium") {
    return "badge border-cyan-400/40 bg-cyan-400/10 text-cyan-200";
  }
  return "badge border-emerald-400/40 bg-emerald-400/10 text-emerald-200";
}

function getStatusBadge(status: "Open" | "Investigating" | "Resolved") {
  if (status === "Open") {
    return "badge border-amber-400/40 bg-amber-400/10 text-amber-200";
  }
  if (status === "Investigating") {
    return "badge border-cyan-400/40 bg-cyan-400/10 text-cyan-200";
  }
  return "badge border-emerald-400/40 bg-emerald-400/10 text-emerald-200";
}

function getBarColor(index: number, active: boolean) {
  const colors = ["#38bdf8", "#fbbf24", "#f472b6", "#34d399", "#a78bfa", "#f97316"];
  const base = colors[index % colors.length];
  return active ? base : base;
}

function mapSeverity(alertSeverity: AlertSeverity): IncidentView["severity"] {
  switch (alertSeverity) {
    case "HIGH":
      return "High";
    case "MED":
      return "Medium";
    case "LOW":
      return "Low";
    default:
      return "Medium";
  }
}

function mapStatus(status: Alert["status"]): IncidentView["status"] {
  if (status === "Confirmed") return "Resolved";
  if (status === "Dismissed") return "Resolved";
  return "Investigating";
}

function mapAlertToIncident(alert: Alert): IncidentView {
  return {
    id: alert.id,
    time: alert.timestamp,
    category: alert.type,
    severity: mapSeverity(alert.severity),
    location: "Camera feed",
    summary: alert.description || "Incident detected by AI.",
    status: mapStatus(alert.status),
    videoId: alert.videoId,
    chunkFilename: alert.chunkFilename,
  };
}
