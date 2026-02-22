"use client";

import { useState, useRef, useEffect } from "react";
import { AlertBellIcon } from "../icons";
import { AlertItem } from "./AlertItem";
import type { Alert } from "@/lib/types";

/** Props for LiveAlerts */
interface LiveAlertsProps {
  alerts: Alert[];
  onPlayClip: (alert: Alert) => void;
  onConfirm: (alert: Alert) => void;
  onDismiss: (alert: Alert) => void;
  onReview: (alert: Alert) => void;
}

const SEVERITY_OPTIONS = ["All", "HIGH", "MED", "LOW"] as const;
const STATUS_OPTIONS = ["All", "Pending", "Confirmed", "Dismissed"] as const;
const SEVERITY_RANK: Record<string, number> = {
  HIGH: 3,
  MED: 2,
  LOW: 1,
};

const PRIORITY_KEYWORDS = [
  "medical",
  "emergency",
  "injury",
  "weapon",
  "fire",
  "smoke",
  "collision",
  "crash",
  "hit",
];

const HUMAN_KEYWORDS = [
  "child",
  "kid",
  "infant",
  "toddler",
  "person",
  "pedestrian",
  "human",
  "man",
  "woman",
  "people",
  "student",
  "elderly",
  "injured",
  "unconscious",
];

function priorityScore(alert: Alert): number {
  const text = `${alert.type} ${alert.description}`.toLowerCase();
  if (HUMAN_KEYWORDS.some((keyword) => text.includes(keyword))) {
    return 3;
  }
  if (PRIORITY_KEYWORDS.some((keyword) => text.includes(keyword))) {
    return 2;
  }
  if (text.includes("unsafe") || text.includes("fight")) {
    return 1;
  }
  return 0;
}

/** Live alerts list with filter dropdown (severity, status). */
export function LiveAlerts({
  alerts,
  onPlayClip,
  onConfirm,
  onDismiss,
  onReview,
}: LiveAlertsProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredAlerts = alerts
    .filter((alert) => {
    if (severityFilter !== "All" && alert.severity !== severityFilter) {
      return false;
    }
    if (statusFilter !== "All" && alert.status !== statusFilter) {
      return false;
    }
    return true;
  })
    .sort((a, b) => {
      const priorityDiff = priorityScore(b) - priorityScore(a);
      if (priorityDiff !== 0) return priorityDiff;
      const severityDiff =
        (SEVERITY_RANK[b.severity] || 0) - (SEVERITY_RANK[a.severity] || 0);
      if (severityDiff !== 0) return severityDiff;
      const confDiff = (b.confidence || 0) - (a.confidence || 0);
      if (confDiff !== 0) return confDiff;
      return b.timestamp.localeCompare(a.timestamp);
    });

  const activeFilterCount =
    (severityFilter !== "All" ? 1 : 0) + (statusFilter !== "All" ? 1 : 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertBellIcon className="h-5 w-5 text-amber-300" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Live Incidents
          </h3>
        </div>
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setFilterOpen(!filterOpen)}
            className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs"
          >
            Filter
            {activeFilterCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-700 px-1 text-[10px] font-semibold text-slate-100">
                {activeFilterCount}
              </span>
            )}
            <svg
              className={`h-4 w-4 transition-transform ${filterOpen ? "rotate-180" : ""}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {filterOpen && (
            <div className="absolute right-0 top-full z-10 mt-1.5 min-w-48 rounded-lg border border-slate-800/70 bg-slate-950/95 py-2 shadow-xl">
              <div className="border-b border-slate-800/70 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Severity
                </p>
                <div className="mt-1.5 space-y-1.5">
                  {SEVERITY_OPTIONS.map((opt) => (
                    <label
                      key={opt}
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <input
                        type="radio"
                        name="severity"
                        checked={severityFilter === opt}
                        onChange={() => setSeverityFilter(opt)}
                        className="h-3.5 w-3.5 accent-amber-400"
                      />
                      <span className="text-xs text-slate-200">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Status
                </p>
                <div className="mt-1.5 space-y-1.5">
                  {STATUS_OPTIONS.map((opt) => (
                    <label
                      key={opt}
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <input
                        type="radio"
                        name="status"
                        checked={statusFilter === opt}
                        onChange={() => setStatusFilter(opt)}
                        className="h-3.5 w-3.5 accent-amber-400"
                      />
                      <span className="text-xs text-slate-200">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ul className="space-y-4">
        {filteredAlerts.map((alert) => (
          <li key={alert.id}>
            <AlertItem
              alert={alert}
              onPlayClip={onPlayClip}
              onConfirm={onConfirm}
              onDismiss={onDismiss}
              onReview={onReview}
            />
          </li>
        ))}
      </ul>
      {alerts.length === 0 && (
        <div className="panel-inset px-4 py-6 text-center text-sm text-slate-400">
          No alerts yet. Monitoring will populate this feed as clips are analyzed.
        </div>
      )}
      {filteredAlerts.length === 0 && alerts.length > 0 && (
        <p className="py-6 text-center text-sm text-slate-500">
          No alerts match the current filters
        </p>
      )}
    </div>
  );
}
