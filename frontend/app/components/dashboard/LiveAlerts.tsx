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

  const filteredAlerts = alerts.filter((alert) => {
    if (severityFilter !== "All" && alert.severity !== severityFilter) {
      return false;
    }
    if (statusFilter !== "All" && alert.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const activeFilterCount =
    (severityFilter !== "All" ? 1 : 0) + (statusFilter !== "All" ? 1 : 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertBellIcon className="h-5 w-5 text-red-500" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-700">
            Live Alerts
          </h3>
        </div>
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-1.5 rounded-md border border-zinc-300 bg-zinc-50/80 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
          >
            Filter
            {activeFilterCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-zinc-300 px-1 text-[10px] font-semibold text-zinc-700">
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
            <div className="absolute right-0 top-full z-10 mt-1.5 min-w-48 rounded-lg border border-zinc-200 bg-white py-2 shadow-lg">
              <div className="border-b border-zinc-100 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
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
                        className="h-3.5 w-3.5 accent-zinc-900"
                      />
                      <span className="text-xs text-zinc-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
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
                        className="h-3.5 w-3.5 accent-zinc-900"
                      />
                      <span className="text-xs text-zinc-700">{opt}</span>
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
      {filteredAlerts.length === 0 && alerts.length > 0 && (
        <p className="py-6 text-center text-sm text-zinc-500">
          No alerts match the current filters
        </p>
      )}
    </div>
  );
}
