import type { SearchResult } from "@/lib/types";

/**
 * Footage search API - natural language search over video content.
 * Currently uses mock data. Replace with apiFetch() when backend is ready.
 * @module lib/api/footage
 */

const MOCK_SEARCH_RESULTS: SearchResult[] = [
  {
    id: "1",
    label: "Possible fight",
    timestamp: "0:42",
    confidence: 82,
  },
];

/** Search footage by natural language query (e.g. "Any fights today?") */
export async function searchFootage(
  _query: string,
  _sessionId?: string
): Promise<SearchResult[]> {
  // TODO: return apiFetch<SearchResult[]>(`/sessions/${sessionId}/search`, {
  //   method: 'POST',
  //   body: JSON.stringify({ query }),
  // });
  return [...MOCK_SEARCH_RESULTS];
}
