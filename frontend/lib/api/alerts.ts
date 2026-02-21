import type { Alert } from "@/lib/types";

/**
 * Alerts API - fetch, confirm, dismiss, and review AI-detected alerts.
 * Currently uses mock data. Replace with apiFetch() when backend is ready.
 * @module lib/api/alerts
 */

const MOCK_ALERTS: Alert[] = [
  {
    id: "1",
    type: "Fight detected",
    timestamp: "0:42",
    confidence: 82,
    status: "Pending",
    description: "Two individuals in physical altercation near entrance",
    severity: "HIGH",
  },
  {
    id: "2",
    type: "Suspicious loitering",
    timestamp: "1:15",
    confidence: 65,
    status: "Pending",
    description: "Person lingering near restricted area",
    severity: "MED",
  },
  {
    id: "3",
    type: "Unattended bag",
    timestamp: "1:48",
    confidence: 45,
    status: "Pending",
    description: "Bag left unattended for extended period",
    severity: "LOW",
  },
];

/** Fetch all alerts for a monitoring session */
export async function fetchAlerts(_sessionId?: string): Promise<Alert[]> {
  // TODO: return apiFetch<Alert[]>(`/sessions/${sessionId}/alerts`);
  return [...MOCK_ALERTS];
}

/** Mark an alert as confirmed by the operator */
export async function confirmAlert(
  alertId: string,
  _sessionId?: string
): Promise<Alert> {
  // TODO: return apiFetch<Alert>(`/alerts/${alertId}/confirm`, { method: 'POST' });
  const alert = MOCK_ALERTS.find((a) => a.id === alertId);
  if (!alert) throw new Error("Alert not found");
  return { ...alert, status: "Confirmed" };
}

/** Mark an alert as dismissed (false alarm) */
export async function dismissAlert(
  alertId: string,
  _sessionId?: string
): Promise<Alert> {
  // TODO: return apiFetch<Alert>(`/alerts/${alertId}/dismiss`, { method: 'POST' });
  const alert = MOCK_ALERTS.find((a) => a.id === alertId);
  if (!alert) throw new Error("Alert not found");
  return { ...alert, status: "Dismissed" };
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
  // TODO: return apiFetch<Alert>(`/alerts/${alertId}/review`, {
  //   method: 'POST',
  //   body: JSON.stringify(review),
  // });
  const alert = MOCK_ALERTS.find((a) => a.id === alertId);
  if (!alert) throw new Error("Alert not found");
  return { ...alert, status: "Confirmed" };
}
