/**
 * Analytics API - event history summary and breakdown by event type.
 * @module lib/api/analytics
 */

import { apiFetch } from "@/lib/api/client";

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

/** Fetch analytics summary and event breakdown. Supports optional date range. */
export async function fetchAnalytics(
  params?: { from?: string; to?: string; videoId?: string }
): Promise<AnalyticsData> {
  const search = new URLSearchParams();
  if (params?.from) search.set("from_date", params.from);
  if (params?.to) search.set("to_date", params.to);
  if (params?.videoId) search.set("video_id", params.videoId);
  const suffix = search.toString();
  return apiFetch<AnalyticsData>(`/api/analytics${suffix ? `?${suffix}` : ""}`);
}
