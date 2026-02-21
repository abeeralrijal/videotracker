/**
 * Monitoring session API - processing status and video playback info.
 * Currently uses mock data. Replace with apiFetch() when backend is ready.
 * @module lib/api/monitoring
 */

/** Video processing progress */
export interface ProcessingStatus {
  progress: number;
  chunksAnalyzed: number;
  totalChunks: number;
}

/** Active video session metadata */
export interface VideoSession {
  duration: number;
  currentTime?: number;
  videoUrl?: string;
}

/** Fetch current processing progress (chunks analyzed) */
export async function fetchProcessingStatus(
  _sessionId?: string
): Promise<ProcessingStatus> {
  // TODO: return apiFetch<ProcessingStatus>(`/sessions/${sessionId}/processing`);
  return {
    progress: 80,
    chunksAnalyzed: 8,
    totalChunks: 10,
  };
}

/** Fetch video session (duration, current time, stream URL) */
export async function fetchVideoSession(
  _sessionId?: string
): Promise<VideoSession> {
  // TODO: return apiFetch<VideoSession>(`/sessions/${sessionId}`);
  return {
    duration: 150,
    currentTime: 42,
  };
}
