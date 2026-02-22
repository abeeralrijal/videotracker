import { apiFetch } from "@/lib/api/client";
import type { Alert } from "@/lib/types";
import { eventToAlert } from "@/lib/api/transform";

/**
 * Alerts API - fetch, confirm, dismiss, and review AI-detected alerts.
 * Currently uses mock data. Replace with apiFetch() when backend is ready.
 * @module lib/api/alerts
 */

/** Fetch all alerts for a monitoring session */
export async function fetchAlerts(_sessionId?: string): Promise<Alert[]> {
  const params = new URLSearchParams();
  if (_sessionId) params.set("video_id", _sessionId);
  const path = params.toString() ? `/api/events?${params}` : "/api/events";
  const data = await apiFetch<any[]>(path);
  return data.map(eventToAlert);
}

/** Mark an alert as confirmed by the operator */
export async function confirmAlert(
  alertId: string,
  _sessionId?: string
): Promise<Alert> {
  const data = await apiFetch<any>(`/api/events/${alertId}/review`, {
    method: "POST",
    body: JSON.stringify({
      status: "confirmed",
    }),
  });
  return eventToAlert({ ...data, id: alertId, status: "confirmed" });
}

/** Mark an alert as dismissed (false alarm) */
export async function dismissAlert(
  alertId: string,
  _sessionId?: string
): Promise<Alert> {
  const data = await apiFetch<any>(`/api/events/${alertId}/review`, {
    method: "POST",
    body: JSON.stringify({
      status: "dismissed",
    }),
  });
  return eventToAlert({ ...data, id: alertId, status: "dismissed" });
}

/** Input for submitting an alert review */
export type AlertReviewInput = {
  wasCorrect: boolean;
  severity: string;
  notes: string;
};

/** Submit operator review (was AI correct, severity, notes) */
export async function submitAlertReview(
  alertId: string,
  review: AlertReviewInput,
  _sessionId?: string
): Promise<Alert> {
  const data = await apiFetch<any>(`/api/events/${alertId}/review`, {
    method: "POST",
    body: JSON.stringify({
      status: review.wasCorrect ? "confirmed" : "dismissed",
      severity: review.severity.toLowerCase(),
      reviewer_notes: review.notes,
    }),
  });
  return eventToAlert({ ...data, id: alertId });
}
