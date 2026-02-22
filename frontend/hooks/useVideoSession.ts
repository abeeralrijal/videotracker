"use client";

import { useState, useCallback, useEffect } from "react";
import { fetchVideoSession } from "@/lib/api";

/** Options for useVideoSession hook */
interface UseVideoSessionOptions {
  sessionId?: string;
  enabled?: boolean;
}

/** Fetches video session (duration, current time, URL). setCurrentTime for seeking. */
export function useVideoSession(options: UseVideoSessionOptions = {}) {
  const { sessionId, enabled = true } = options;
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!enabled) return;
    setError(null);
    try {
      const result = await fetchVideoSession(sessionId);
      setDuration(result.duration);
      if (result.currentTime != null) setCurrentTime(result.currentTime);
      if (result.videoUrl) setVideoUrl(result.videoUrl);
    } catch (e) {
      setError(
        e instanceof Error ? e : new Error("Failed to load video session")
      );
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, enabled]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    duration,
    currentTime,
    setCurrentTime,
    videoUrl,
    isLoading,
    error,
    refetch: load,
  };
}
