/**
 * API layer - data access for SentinelAI.
 * Currently mock implementations. Replace with apiFetch() when backend is ready.
 * @module lib/api
 */

export { apiFetch } from "./client";
export type { ApiError } from "./client";

export {
  fetchAlerts,
  confirmAlert,
  dismissAlert,
  submitAlertReview,
} from "./alerts";
export type { AlertReviewInput } from "./alerts";

export { searchFootage } from "./footage";

export { fetchAnalytics } from "./analytics";
export type { AnalyticsData, AnalyticsSummary, EventTypeStats } from "./analytics";

export {
  fetchProcessingStatus,
  fetchVideoSession,
} from "./monitoring";
export type { ProcessingStatus, VideoSession } from "./monitoring";

export { uploadVideo, startMonitoring } from "./upload";
export type { UploadResponse } from "./upload";
