"use client";

import { PlayIcon } from "../icons";
import type { SearchResult } from "@/lib/types";

/** Props for SearchResults */
interface SearchResultsProps {
  results: SearchResult[];
  onPlayClip: (result: SearchResult) => void;
}

/** List of search results with Play Clip action. Renders nothing when empty. */
export function SearchResults({ results, onPlayClip }: SearchResultsProps) {
  if (results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-zinc-700">Search Results:</h3>
      <ul className="space-y-3">
        {results.map((result) => (
          <li
            key={result.id}
            className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 bg-white p-3"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                ⚠
              </span>
              <div>
                <p className="text-sm font-medium text-zinc-900">
                  {result.label}
                </p>
                <p className="text-xs text-zinc-500">
                  @ {result.timestamp} – {result.confidence}% conf
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onPlayClip(result)}
              className="flex items-center gap-1.5 rounded-md border border-zinc-300 px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
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
