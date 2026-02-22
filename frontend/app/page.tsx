"use client";

/**
 * Landing page: choose between Monitoring (alerts + Q&A) or Ask (Q&A only).
 */

import { useRouter } from "next/navigation";
import { Header } from "@/app/components/Header";
import { LandingHero } from "@/app/components/landing/LandingHero";
import { AnalyticsPreview } from "@/app/components/landing/AnalyticsPreview";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen text-slate-100">
      <Header />

      <main className="mx-auto max-w-5xl px-6 py-16">
        <LandingHero />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <div className="panel p-8">
            <div className="badge mb-4 border-emerald-400/40 bg-emerald-400/10 text-emerald-200">
              Monitor Mode
            </div>
            <h2 className="text-2xl font-semibold text-slate-100">
              Live Monitoring & Triage
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              Upload a video and surface the most critical incidents first.
              Review clips, confirm alerts, and ask follow-up questions.
            </p>
            <button
              type="button"
              onClick={() => router.push("/monitor")}
              className="btn-primary mt-6 w-full"
            >
              Start Monitoring
            </button>
          </div>

          <div className="panel p-8">
            <div className="badge mb-4 border-amber-400/40 bg-amber-400/10 text-amber-200">
              Ask Mode
            </div>
            <h2 className="text-2xl font-semibold text-slate-100">
              Ask the Footage
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              Skip alerts and focus on Q&A. Ask specific questions about what
              happened in the scene, with clip-level responses.
            </p>
            <button
              type="button"
              onClick={() => router.push("/ask")}
              className="btn-secondary mt-6 w-full"
            >
              Open Q&A View
            </button>
          </div>

          <div className="panel p-8">
            <div className="badge mb-4 border-cyan-400/40 bg-cyan-400/10 text-cyan-200">
              Analytics
            </div>
            <h2 className="text-2xl font-semibold text-slate-100">
              Intelligence Dashboard
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              Track incident trends, hotspots, and response performance with
              real-time analytics.
            </p>
            <button
              type="button"
              onClick={() => router.push("/analytics-insights")}
              className="btn-secondary mt-6 w-full"
            >
              View Analytics
            </button>
          </div>
        </div>

        <AnalyticsPreview />
      </main>
    </div>
  );
}
