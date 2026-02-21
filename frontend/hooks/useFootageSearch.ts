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
}

/**
 * Natural language search over footage. Runs search on mount when initialQuery is set.
 */
export function useFootageSearch(options: UseFootageSearchOptions = {}) {
  const { sessionId, initialQuery = "", searchOnMount = true } = options;
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const search = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await searchFootage(query, sessionId);
      setResults(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Search failed"));
    } finally {
      setIsLoading(false);
    }
  }, [query, sessionId]);

  useEffect(() => {
    if (searchOnMount && initialQuery) search();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    search,
  };
}
