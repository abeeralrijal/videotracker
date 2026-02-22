"use client";

/**
 * Main monitoring dashboard: video player, footage search, live alerts, processing status.
 * Uses hooks for data (useAlerts, useFootageSearch, useProcessingStatus, useVideoSession).
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/app/components/layout/AppShell";
import { VideoPlayer } from "@/app/components/dashboard/VideoPlayer";
import { ProcessingStatus } from "@/app/components/dashboard/ProcessingStatus";
import { FootageQuery } from "@/app/components/dashboard/FootageQuery";
import { SearchResults } from "@/app/components/dashboard/SearchResults";
import { LiveAlerts } from "@/app/components/dashboard/LiveAlerts";
import { AlertReviewModal } from "@/app/components/dashboard/AlertReviewModal";
import {
  useAlerts,
  useFootageSearch,
  useProcessingStatus,
  useVideoSession,
  useAuthGuard,
} from "@/hooks";
import type { Alert, SearchResult } from "@/lib/types";
import { getLastSessionId, setLastSessionId } from "@/lib/session";

export default function DashboardPage() {
  useAuthGuard();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [reviewingAlert, setReviewingAlert] = useState<Alert | null>(null);

  const sessionId = useMemo(() => searchParams.get("videoId") ?? undefined, [searchParams]);
  const hasSession = Boolean(sessionId);

  useEffect(() => {
    if (sessionId) {
      setLastSessionId(sessionId);
      return;
    }
    const last = getLastSessionId();
    if (last) {
      router.replace(`/dashboard?videoId=${last}`);
    }
  }, [sessionId, router]);

  const {
    alerts,
    confirm: confirmAlert,
    dismiss: dismissAlert,
    submitReview,
  } = useAlerts({ sessionId });

  const {
    query,
    setQuery,
    results: searchResults,
    answer: searchAnswer,
    isLoading: searchLoading,
    error: searchError,
    search,
  } = useFootageSearch({
    sessionId,
    initialQuery: "Any fights today?",
    searchOnMount: hasSession,
    mode: "monitor",
  });

  const {
    progress,
    chunksAnalyzed,
    totalChunks,
    failedChunks,
  } = useProcessingStatus({ sessionId, enabled: hasSession, pollInterval: 2000 });

  const {
    duration,
    currentTime,
    setCurrentTime,
    videoUrl,
  } = useVideoSession({ sessionId, enabled: hasSession });

  const handleStop = useCallback(() => {
    router.push("/");
  }, [router]);

  const handlePlayClipFromResult = useCallback((result: SearchResult) => {
    const [min, sec] = result.timestamp.split(":").map(Number);
    setCurrentTime((min || 0) * 60 + (sec || 0));
  }, [setCurrentTime]);

  const handlePlayClipFromAlert = useCallback(
    (alert: Alert) => {
      const [min, sec] = alert.timestamp.split(":").map(Number);
      setCurrentTime((min || 0) * 60 + (sec || 0));
    },
    [setCurrentTime]
  );

  const handleReviewAlert = useCallback((alert: Alert) => {
    setReviewingAlert(alert);
  }, []);

  const handleCloseReviewModal = useCallback(() => {
    setReviewingAlert(null);
  }, []);

  const handleSubmitReview = useCallback(
    (alert: Alert, review: { wasCorrect: boolean; severity: string; notes: string }) => {
      submitReview(alert, review);
      setReviewingAlert(null);
    },
    [submitReview]
  );

  return (
    <AppShell
      title="Monitoring"
      subtitle="Live Triage"
      status={
        <span className="flex items-center gap-2 text-sm font-medium text-emerald-300">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          MONITORING
        </span>
      }
      actions={
        <button
          type="button"
          onClick={handleStop}
          className="btn-ghost flex items-center gap-1.5 px-3 py-1.5 text-sm"
        >
          <span className="text-slate-400">■</span>
          Stop
        </button>
      }
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="panel space-y-6 p-6">
            <VideoPlayer
              src={videoUrl}
              currentTime={currentTime}
              duration={duration}
              onSeek={setCurrentTime}
            />
            <ProcessingStatus
              progress={progress}
              chunksAnalyzed={chunksAnalyzed}
              totalChunks={totalChunks}
              failedChunks={failedChunks}
            />
          </div>

          <div className="panel space-y-6 p-6">
            <FootageQuery
              query={query}
              onQueryChange={setQuery}
              onSearch={search}
            />
            <SearchResults
              results={searchResults}
              answer={searchAnswer}
              isLoading={searchLoading}
              error={searchError ? searchError.message : null}
              onPlayClip={handlePlayClipFromResult}
            />
          </div>
        </div>

        <div className="panel mt-8 p-6">
          <LiveAlerts
            alerts={alerts}
            onPlayClip={handlePlayClipFromAlert}
            onConfirm={confirmAlert}
            onDismiss={dismissAlert}
            onReview={handleReviewAlert}
          />
        </div>
      </div>

      {reviewingAlert && (
        <AlertReviewModal
          alert={reviewingAlert}
          onClose={handleCloseReviewModal}
          onSubmit={handleSubmitReview}
        />
      )}
    </AppShell>
  );
}
