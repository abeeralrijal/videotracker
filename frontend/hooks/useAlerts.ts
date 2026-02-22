"use client";

import { useState, useCallback, useEffect } from "react";
import {
  fetchAlerts,
  confirmAlert,
  dismissAlert,
  submitAlertReview,
  type AlertReviewInput,
} from "@/lib/api";
import { API_BASE_URL } from "@/lib/api/client";
import { eventToAlert } from "@/lib/api/transform";
import type { Alert } from "@/lib/types";

/** Options for useAlerts hook */
interface UseAlertsOptions {
  sessionId?: string;
  enabled?: boolean;
}

/**
 * Fetches alerts and provides confirm, dismiss, and submitReview handlers.
 * Updates local state optimistically after each mutation.
 */
export function useAlerts(options: UseAlertsOptions = {}) {
  const { sessionId, enabled = true } = options;
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const buildFingerprint = useCallback((alert: Alert) => {
    return `${alert.type}|${alert.timestamp}|${alert.description}`.toLowerCase();
  }, []);

  const dedupeAlerts = useCallback((items: Alert[]) => {
    const seen = new Set<string>();
    return items.filter((item) => {
      const key = buildFingerprint(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [buildFingerprint]);

  const loadAlerts = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAlerts(sessionId);
      setAlerts(dedupeAlerts(data));
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to load alerts"));
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, enabled]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  useEffect(() => {
    if (!enabled || !sessionId) return;
    const url = `${API_BASE_URL}/api/events/stream`;
    const source = new EventSource(url);

    source.addEventListener("alert", (event) => {
      try {
        const raw = JSON.parse((event as MessageEvent).data);
        if (sessionId && raw.video_id && raw.video_id !== sessionId) {
          return;
        }
        const alert = eventToAlert(raw);
        setAlerts((prev) => {
          const exists = prev.find((a) => a.id === alert.id);
          if (exists) return prev;
          const next = [alert, ...prev];
          return dedupeAlerts(next);
        });
      } catch {
        // ignore malformed events
      }
    });

    return () => {
      source.close();
    };
  }, [enabled, sessionId]);

  const handleConfirm = useCallback(
    async (alert: Alert) => {
      try {
        const updated = await confirmAlert(alert.id, sessionId);
        setAlerts((prev) => prev.filter((a) => a.id !== alert.id));
      } catch (e) {
        setError(e instanceof Error ? e : new Error("Failed to confirm alert"));
      }
    },
    [sessionId]
  );

  const handleDismiss = useCallback(
    async (alert: Alert) => {
      try {
        const updated = await dismissAlert(alert.id, sessionId);
        setAlerts((prev) => prev.filter((a) => a.id !== alert.id));
      } catch (e) {
        setError(e instanceof Error ? e : new Error("Failed to dismiss alert"));
      }
    },
    [sessionId]
  );

  const handleSubmitReview = useCallback(
    async (alert: Alert, review: AlertReviewInput) => {
      try {
        const updated = await submitAlertReview(alert.id, review, sessionId);
        setAlerts((prev) => prev.filter((a) => a.id !== alert.id));
      } catch (e) {
        setError(
          e instanceof Error ? e : new Error("Failed to submit review")
        );
      }
    },
    [sessionId]
  );

  return {
    alerts,
    isLoading,
    error,
    refetch: loadAlerts,
    confirm: handleConfirm,
    dismiss: handleDismiss,
    submitReview: handleSubmitReview,
  };
}
