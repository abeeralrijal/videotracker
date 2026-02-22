import { apiFetch } from "@/lib/api/client";
import type { SearchResult } from "@/lib/types";
import { eventToSearchResult } from "@/lib/api/transform";

/**
 * Footage search API - natural language search over video content.
 * Currently uses mock data. Replace with apiFetch() when backend is ready.
 * @module lib/api/footage
 */

export type FootageSearchResponse = {
  answer: string;
  results: SearchResult[];
};

/** Search footage by natural language query (e.g. "Any fights today?") */
export async function searchFootage(
  query: string,
  sessionId?: string,
  mode: "monitor" | "ask" = "monitor"
): Promise<FootageSearchResponse> {
  const data = await apiFetch<{ answer: string; results: any[] }>("/api/search", {
    method: "POST",
    body: JSON.stringify({
      query,
      video_id: sessionId ?? undefined,
      mode,
    }),
  });
  return {
    answer: data.answer ?? "",
    results: (data.results ?? []).map(eventToSearchResult),
  };
}
