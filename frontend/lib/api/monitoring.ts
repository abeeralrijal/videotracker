/**
 * Monitoring session API - processing status and video playback info.
 * Backend integration for processing status and video info.
 * @module lib/api/monitoring
 */

import { apiFetch, API_BASE_URL } from "@/lib/api/client";

/** Video processing progress */
export interface ProcessingStatus {
  progress: number;
  chunksAnalyzed: number;
  totalChunks: number;
  failedChunks?: number;
}

/** Active video session metadata */
export interface VideoSession {
  duration: number;
  currentTime?: number;
  videoUrl?: string;
}

/** Fetch current processing progress (chunks analyzed) */
export async function fetchProcessingStatus(
  sessionId?: string
): Promise<ProcessingStatus> {
  if (!sessionId) {
    return { progress: 0, chunksAnalyzed: 0, totalChunks: 0 };
  }
  return apiFetch<ProcessingStatus>(`/api/videos/${sessionId}/processing`);
}

/** Fetch video session (duration, current time, stream URL) */
export async function fetchVideoSession(
  sessionId?: string
): Promise<VideoSession> {
  if (!sessionId) {
    return { duration: 0 };
  }
  const data = await apiFetch<{ source_url?: string; duration_seconds?: number }>(
    `/api/videos/${sessionId}`
  );
  return {
    duration: Math.round(data.duration_seconds ?? 0),
    currentTime: 0,
    videoUrl: data.source_url
      ? `${API_BASE_URL}${data.source_url}`
      : undefined,
  };
}
