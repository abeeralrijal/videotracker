"use client";

/**
 * Login page. UI only - wire to auth API when backend is ready.
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/app/components/Header";
import { setAuthed } from "@/lib/session";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    // Placeholder - wire to auth API later
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }
    setAuthed(email);
    const next = searchParams.get("next");
    router.push(next || "/");
  };

  return (
    <div className="min-h-screen text-slate-100">
      <Header />

      <main className="mx-auto flex min-h-[calc(100vh-80px)] max-w-md flex-col items-center justify-center px-6">
        <div className="w-full space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              Sign in to SentinelAI
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Enter your credentials to access your account
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="panel-outline p-8"
          >
            {error && (
              <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="input-field"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="input-field"
                />
              </div>
              <button
                type="submit"
                className="btn-primary flex w-full items-center justify-center"
              >
                Sign In
              </button>
            </div>
            <p className="mt-6 text-center text-sm text-slate-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-amber-300 underline-offset-2 hover:underline"
              >
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
