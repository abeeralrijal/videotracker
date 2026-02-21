"use client";

/**
 * Landing page: use case selection, video upload, Start Monitoring.
 * Navigates to /dashboard when user uploads video and clicks Start.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/app/components/Header";
import { LandingHero } from "@/app/components/landing/LandingHero";
import { UseCaseSelect } from "@/app/components/landing/UseCaseSelect";
import { VideoUpload } from "@/app/components/landing/VideoUpload";
import type { UseCaseValue } from "@/lib/constants";

export default function Home() {
	const router = useRouter();
	const [useCase, setUseCase] = useState<UseCaseValue>("campus-safety");
	const [file, setFile] = useState<File | null>(null);

	const handleStartMonitoring = () => {
		router.push("/dashboard");
	};

	const canStart = file !== null;

	return (
		<div className="min-h-screen bg-white font-sans">
			<Header />

			<main className="mx-auto max-w-2xl px-6 py-16">
				<LandingHero />

				<div className="rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50/50 p-8">
					<div className="mb-6">
						<UseCaseSelect value={useCase} onChange={setUseCase} />
					</div>

					<div className="mb-8">
						<VideoUpload file={file} onFileChange={setFile} />
					</div>

					<button
						type="button"
						onClick={handleStartMonitoring}
						disabled={!canStart}
						className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-6 py-3.5 font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<span>🚀</span>
						<span>Start Monitoring</span>
					</button>
				</div>
			</main>
		</div>
	);
}
