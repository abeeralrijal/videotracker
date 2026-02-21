/**
 * Analytics API - event history summary and breakdown by event type.
 * Currently uses mock data. Replace with apiFetch() when backend is ready.
 * @module lib/api/analytics
 */

/** Per-event-type statistics */
export interface EventTypeStats {
  eventType: string;
  count: number;
  confirmed: number;
  accuracy: number;
}

/** Overall analytics summary metrics */
export interface AnalyticsSummary {
  totalEvents: number;
  confirmed: number;
  dismissed: number;
  aiAccuracy: number;
  avgConfidence: number;
}

/** Full analytics response (summary + event breakdown) */
export interface AnalyticsData {
  summary: AnalyticsSummary;
  eventStats: EventTypeStats[];
}

const MOCK_ANALYTICS: AnalyticsData = {
  summary: {
    totalEvents: 24,
    confirmed: 8,
    dismissed: 12,
    aiAccuracy: 67,
    avgConfidence: 72,
  },
  eventStats: [
    { eventType: "Fight", count: 5, confirmed: 3, accuracy: 60 },
    { eventType: "Suspicious", count: 8, confirmed: 2, accuracy: 25 },
    { eventType: "Accident", count: 3, confirmed: 3, accuracy: 100 },
    { eventType: "Loitering", count: 8, confirmed: 0, accuracy: 0 },
  ],
};

/** Fetch analytics summary and event breakdown. Supports optional date range. */
export async function fetchAnalytics(
  _params?: { from?: string; to?: string }
): Promise<AnalyticsData> {
  // TODO: const params = new URLSearchParams(params).toString();
  // return apiFetch<AnalyticsData>(`/analytics?${params}`);
  return { ...MOCK_ANALYTICS };
}
