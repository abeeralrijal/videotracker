"use client";

/**
 * Monitoring setup: upload video + start live monitoring.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/app/components/layout/AppShell";
import { VideoUpload } from "@/app/components/landing/VideoUpload";
import { startMonitoring, uploadVideo } from "@/lib/api";
import { useAuthGuard } from "@/hooks";
import { getLastSessionId, isAuthed } from "@/lib/session";

export default function MonitorSetupPage() {
  useAuthGuard();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const last = getLastSessionId();
    if (last && isAuthed()) {
      router.replace(`/dashboard?videoId=${last}`);
    }
  }, [router]);

  const handleStartMonitoring = async () => {
    if (!file) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const upload = await uploadVideo(file);
      await startMonitoring(upload.video_id);
      router.push(`/dashboard?videoId=${upload.video_id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start monitoring");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canStart = file !== null;

  return (
    <AppShell
      title="Monitoring Setup"
      subtitle="Upload"
      status={
        <span className="badge border-emerald-400/40 bg-emerald-400/10 text-emerald-200">
          Setup
        </span>
      }
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
            <div className="badge mb-4 border-emerald-400/40 bg-emerald-400/10 text-emerald-200">
              Security Ops
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-100">
              Live Monitoring Setup
            </h1>
            <p className="mt-3 text-base text-slate-300">
              Upload footage to begin incident detection and live triage.
            </p>
        </div>

        <div className="panel-outline p-8">
          <div className="mb-8">
            <VideoUpload file={file} onFileChange={setFile} />
          </div>

          <button
            type="button"
            onClick={handleStartMonitoring}
            disabled={!canStart || isSubmitting}
            className="btn-primary flex w-full items-center justify-center gap-2"
          >
            <span className="text-lg">🚀</span>
            <span>{isSubmitting ? "Starting..." : "Start Monitoring"}</span>
          </button>
          {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
        </div>

        <p className="mt-6 text-center text-sm text-slate-400">
          Prefer Q&A only?{" "}
          <Link href="/ask" className="font-medium text-amber-300 hover:underline">
            Go to Ask Mode
          </Link>
        </p>
      </div>
    </AppShell>
  );
}
