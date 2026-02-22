"use client";

import { useState, useCallback, useEffect } from "react";
import { searchFootage } from "@/lib/api";
import type { SearchResult } from "@/lib/types";

/** Options for useFootageSearch hook */
interface UseFootageSearchOptions {
  sessionId?: string;
  initialQuery?: string;
  /** Run search on mount when initialQuery is set (for pre-populated demo) */
  searchOnMount?: boolean;
  mode?: "monitor" | "ask";
}

/**
 * Natural language search over footage. Runs search on mount when initialQuery is set.
 */
export function useFootageSearch(options: UseFootageSearchOptions = {}) {
  const {
    sessionId,
    initialQuery = "",
    searchOnMount = true,
    mode = "monitor",
  } = options;
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [answer, setAnswer] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const cacheKey = sessionId ? `sentinelai:ask:${sessionId}` : null;

  const search = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await searchFootage(query, sessionId, mode);
      setResults(data.results);
      setAnswer(data.answer);
      if (mode === "ask" && cacheKey) {
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            query,
            answer: data.answer,
            results: data.results,
          })
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Search failed"));
    } finally {
      setIsLoading(false);
    }
  }, [query, sessionId, mode, cacheKey]);

  useEffect(() => {
    if (searchOnMount && initialQuery) search();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (mode !== "ask" || !cacheKey || !sessionId) return;
    try {
      const raw = localStorage.getItem(cacheKey);
      if (!raw) return;
      const cached = JSON.parse(raw) as {
        query?: string;
        answer?: string;
        results?: SearchResult[];
      };
      if (cached.query) setQuery(cached.query);
      if (cached.answer) setAnswer(cached.answer);
      if (cached.results) setResults(cached.results);
    } catch {
      // ignore cache errors
    }
  }, [mode, cacheKey, sessionId]);

  return {
    query,
    setQuery,
    results,
    answer,
    isLoading,
    error,
    search,
  };
}
