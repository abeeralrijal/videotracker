"use client";

import { useState, useCallback, useEffect } from "react";
import {
  fetchAlerts,
  confirmAlert,
  dismissAlert,
  submitAlertReview,
  type AlertReviewInput,
} from "@/lib/api";
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

  const loadAlerts = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAlerts(sessionId);
      setAlerts(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to load alerts"));
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, enabled]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const handleConfirm = useCallback(
    async (alert: Alert) => {
      try {
        const updated = await confirmAlert(alert.id, sessionId);
        setAlerts((prev) =>
          prev.map((a) => (a.id === alert.id ? updated : a))
        );
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
        setAlerts((prev) =>
          prev.map((a) => (a.id === alert.id ? updated : a))
        );
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
        setAlerts((prev) =>
          prev.map((a) => (a.id === alert.id ? updated : a))
        );
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
