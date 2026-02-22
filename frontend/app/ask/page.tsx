"use client";

/**
 * Ask mode: upload video, then use Q&A only (no live alerts).
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/app/components/layout/AppShell";
import { VideoPlayer } from "@/app/components/dashboard/VideoPlayer";
import { ProcessingStatus } from "@/app/components/dashboard/ProcessingStatus";
import { FootageQuery } from "@/app/components/dashboard/FootageQuery";
import { SearchResults } from "@/app/components/dashboard/SearchResults";
import { VideoUpload } from "@/app/components/landing/VideoUpload";
import {
  useFootageSearch,
  useProcessingStatus,
  useVideoSession,
  useAuthGuard,
} from "@/hooks";
import type { SearchResult } from "@/lib/types";
import { startMonitoring, uploadVideo } from "@/lib/api";
import { getLastSessionId, isAuthed, setLastSessionId } from "@/lib/session";

export default function AskPage() {
  useAuthGuard();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = useMemo(
    () => searchParams.get("videoId") ?? undefined,
    [searchParams]
  );
  const hasSession = Boolean(sessionId);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      setLastSessionId(sessionId);
      return;
    }
    const last = getLastSessionId();
    if (last && isAuthed()) {
      router.replace(`/ask?videoId=${last}`);
    }
  }, [sessionId, router]);

  const handleStartAsk = async () => {
    if (!file) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const upload = await uploadVideo(file);
      await startMonitoring(upload.video_id);
      router.push(`/ask?videoId=${upload.video_id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start Q&A");
    } finally {
      setIsSubmitting(false);
    }
  };

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
    initialQuery: "",
    searchOnMount: false,
    mode: "ask",
  });

  const { progress, chunksAnalyzed, totalChunks, failedChunks } = useProcessingStatus({
    sessionId,
    enabled: hasSession,
    pollInterval: 2000,
  });

  const { duration, currentTime, setCurrentTime, videoUrl } = useVideoSession({
    sessionId,
    enabled: hasSession,
  });

  const handleExit = useCallback(() => {
    router.push("/");
  }, [router]);

  const handlePlayClipFromResult = useCallback(
    (result: SearchResult) => {
      const [min, sec] = result.timestamp.split(":").map(Number);
      setCurrentTime((min || 0) * 60 + (sec || 0));
    },
    [setCurrentTime]
  );

  if (!hasSession) {
    return (
      <AppShell
        title="Ask the Footage"
        subtitle="Q&A Mode"
        status={
          <span className="badge border-amber-400/40 bg-amber-400/10 text-amber-200">
            Upload
          </span>
        }
      >
        <div className="mx-auto max-w-3xl py-8">
          <div className="mb-10 text-center">
          <div className="badge mb-4 border-amber-400/40 bg-amber-400/10 text-amber-200">
            Security Q&A
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-100">
            Ask the Footage
          </h1>
          <p className="mt-3 text-base text-slate-300">
            Upload footage and ask questions about what happened in the scene.
          </p>
          </div>

          <div className="panel-outline p-8">
            <div className="mb-8">
              <VideoUpload file={file} onFileChange={setFile} />
            </div>

            <button
              type="button"
              onClick={handleStartAsk}
              disabled={!file || isSubmitting}
              className="btn-primary flex w-full items-center justify-center gap-2"
            >
              <span className="text-lg">💬</span>
              <span>{isSubmitting ? "Starting..." : "Start Q&A"}</span>
            </button>
            {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
          </div>

          <p className="mt-6 text-center text-sm text-slate-400">
            Need live alerts instead?{" "}
            <Link href="/monitor" className="font-medium text-amber-300 hover:underline">
              Go to Monitoring
            </Link>
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Ask the Footage"
      subtitle="Q&A Mode"
      status={
        <span className="badge border-amber-400/40 bg-amber-400/10 text-amber-200">
          Ask Mode
        </span>
      }
      actions={
        <button
          type="button"
          onClick={handleExit}
          className="btn-ghost flex items-center gap-1.5 px-3 py-1.5 text-sm"
        >
          <span className="text-slate-400">■</span>
          Exit
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
      </div>
    </AppShell>
  );
}
