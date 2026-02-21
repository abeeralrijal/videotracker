"use client";

import { useState, useCallback, useEffect } from "react";
import { fetchProcessingStatus } from "@/lib/api";

/** Options for useProcessingStatus hook */
interface UseProcessingStatusOptions {
  sessionId?: string;
  enabled?: boolean;
  pollInterval?: number;
}

/** Fetches processing status. Polls at pollInterval when enabled. */
export function useProcessingStatus(options: UseProcessingStatusOptions = {}) {
  const {
    sessionId,
    enabled = true,
    pollInterval = 5000,
  } = options;
  const [status, setStatus] = useState({
    progress: 0,
    chunksAnalyzed: 0,
    totalChunks: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!enabled) return;
    setError(null);
    try {
      const result = await fetchProcessingStatus(sessionId);
      setStatus(result);
    } catch (e) {
      setError(
        e instanceof Error ? e : new Error("Failed to load processing status")
      );
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, enabled]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!enabled || !pollInterval) return;
    const id = setInterval(load, pollInterval);
    return () => clearInterval(id);
  }, [load, enabled, pollInterval]);

  return {
    progress: status.progress,
    chunksAnalyzed: status.chunksAnalyzed,
    totalChunks: status.totalChunks,
    isLoading,
    error,
    refetch: load,
  };
}
