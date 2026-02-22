"use client";

import { PlayIcon } from "../icons";
import type { SearchResult } from "@/lib/types";

/** Props for SearchResults */
interface SearchResultsProps {
  results: SearchResult[];
  answer?: string;
  isLoading?: boolean;
  error?: string | null;
  onPlayClip: (result: SearchResult) => void;
}

/** List of search results with Play Clip action. Renders nothing when empty. */
export function SearchResults({
  results,
  answer,
  isLoading,
  error,
  onPlayClip,
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="space-y-2 text-sm text-slate-400">
        <p>Searching footage...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2 text-sm text-red-300">
        <p>{error}</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="panel-inset space-y-2 px-4 py-3 text-sm text-slate-400">
        <p>{answer || "No matching events found yet."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {answer && (
        <p className="text-sm text-slate-300">
          {answer}
        </p>
      )}
      <h3 className="text-sm font-medium text-slate-200">Search Results:</h3>
      <ul className="space-y-3">
        {results.map((result) => (
          <li
            key={result.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-slate-800/70 bg-slate-950/50 p-3"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-amber-200">
                ⚠
              </span>
              <div>
                <p className="text-sm font-medium text-slate-100">
                  {result.label}
                </p>
                <p className="text-xs text-slate-500">
                  @ {result.timestamp}
                  {result.confidence > 0 ? ` – ${result.confidence}% conf` : ""}
                </p>
                {result.snippet && (
                  <p className="mt-1 text-xs text-slate-400">
                    {result.snippet}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onPlayClip(result)}
              className="btn-secondary flex items-center gap-1.5 px-2.5 py-1.5 text-xs"
            >
              <PlayIcon className="h-3.5 w-3.5" />
              Play Clip
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
