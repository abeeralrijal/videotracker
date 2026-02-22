import type { Alert, AlertSeverity, SearchResult } from "@/lib/types";

type BackendEvent = {
  id?: string;
  _id?: string;
  video_id?: string;
  chunk_filename?: string;
  event_type?: string;
  event_description?: string;
  confidence?: number;
  status?: string;
  severity?: string | null;
  timestamp_start?: number;
};

function toTitleCase(value: string): string {
  return value
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : ""))
    .join(" ");
}

export function formatTimestamp(seconds: number | undefined): string {
  const total = Math.max(0, Math.floor(seconds ?? 0));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function mapSeverity(value?: string | null, confidence?: number): AlertSeverity {
  if (!value) {
    const conf = typeof confidence === "number" ? confidence : 0;
    if (conf >= 0.8) return "HIGH";
    if (conf >= 0.5) return "MED";
    return "LOW";
  }
  const normalized = value.toLowerCase();
  if (normalized === "critical" || normalized === "high") return "HIGH";
  if (normalized === "medium" || normalized === "med") return "MED";
  return "LOW";
}

export function mapStatus(value?: string | null): "Pending" | "Confirmed" | "Dismissed" {
  switch ((value || "").toLowerCase()) {
    case "confirmed":
      return "Confirmed";
    case "dismissed":
      return "Dismissed";
    default:
      return "Pending";
  }
}

export function eventToAlert(event: BackendEvent): Alert {
  const confidence = typeof event.confidence === "number" ? event.confidence : 0;
  return {
    id: event.id || event._id || "",
    type: toTitleCase(event.event_type || "Event"),
    timestamp: formatTimestamp(event.timestamp_start),
    confidence: Math.round(confidence * 100),
    status: mapStatus(event.status),
    description: event.event_description || "",
    severity: mapSeverity(event.severity, confidence),
    videoId: event.video_id,
    chunkFilename: event.chunk_filename,
  };
}

export function eventToSearchResult(event: BackendEvent): SearchResult {
  const confidence = typeof event.confidence === "number" ? event.confidence : 0;
  return {
    id: event.id || event._id || "",
    label: toTitleCase(event.event_type || "Result"),
    timestamp: formatTimestamp(event.timestamp_start),
    confidence: Math.round(confidence * 100),
    snippet: event.event_description || "",
  };
}
