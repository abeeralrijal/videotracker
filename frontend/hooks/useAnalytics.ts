"use client";

import { useState, useCallback, useEffect } from "react";
import { fetchAnalytics } from "@/lib/api";
import type { AnalyticsData } from "@/lib/api";

/** Options for useAnalytics hook */
interface UseAnalyticsOptions {
  enabled?: boolean;
  from?: string;
  to?: string;
}

/** Fetches analytics summary and event type breakdown. */
export function useAnalytics(options: UseAnalyticsOptions = {}) {
  const { enabled = true, from, to } = options;
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchAnalytics({ from, to });
      setData(result);
    } catch (e) {
      setError(
        e instanceof Error ? e : new Error("Failed to load analytics")
      );
    } finally {
      setIsLoading(false);
    }
  }, [enabled, from, to]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    summary: data?.summary ?? null,
    eventStats: data?.eventStats ?? [],
    isLoading,
    error,
    refetch: load,
  };
}
