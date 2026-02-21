"use client";

/**
 * Main monitoring dashboard: video player, footage search, live alerts, processing status.
 * Uses hooks for data (useAlerts, useFootageSearch, useProcessingStatus, useVideoSession).
 */

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/app/components/dashboard/DashboardHeader";
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
} from "@/hooks";
import type { UseCaseValue } from "@/lib/constants";
import type { Alert, SearchResult } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [useCase, setUseCase] = useState<UseCaseValue>("campus-safety");
  const [reviewingAlert, setReviewingAlert] = useState<Alert | null>(null);

  // TODO: Get sessionId from URL or monitoring start (e.g. /dashboard/[sessionId])
  const sessionId = undefined;

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
    search,
  } = useFootageSearch({
    sessionId,
    initialQuery: "Any fights today?",
  });

  const {
    progress,
    chunksAnalyzed,
    totalChunks,
  } = useProcessingStatus({ sessionId });

  const {
    duration,
    currentTime,
    setCurrentTime,
    videoUrl,
  } = useVideoSession({ sessionId });

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
    <div className="min-h-screen bg-zinc-50 font-sans">
      <DashboardHeader
        useCase={useCase}
        onUseCaseChange={setUseCase}
        onStop={handleStop}
      />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6 rounded-xl border-2 border-dashed border-zinc-300 bg-white p-6">
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
            />
          </div>

          <div className="space-y-6 rounded-xl border-2 border-dashed border-zinc-300 bg-white p-6">
            <FootageQuery
              query={query}
              onQueryChange={setQuery}
              onSearch={search}
            />
            <SearchResults
              results={searchResults}
              onPlayClip={handlePlayClipFromResult}
            />
          </div>
        </div>

        <div className="mt-8 rounded-xl border-2 border-dashed border-zinc-300 bg-white p-6">
          <LiveAlerts
            alerts={alerts}
            onPlayClip={handlePlayClipFromAlert}
            onConfirm={confirmAlert}
            onDismiss={dismissAlert}
            onReview={handleReviewAlert}
          />
        </div>
      </main>

      {reviewingAlert && (
        <AlertReviewModal
          alert={reviewingAlert}
          onClose={handleCloseReviewModal}
          onSubmit={handleSubmitReview}
        />
      )}
    </div>
  );
}
