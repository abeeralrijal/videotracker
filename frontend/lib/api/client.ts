/**
 * API client for backend communication.
 * Set NEXT_PUBLIC_API_URL in .env when connecting to a real backend.
 * @module lib/api/client
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/** Shape of API error responses */
export type ApiError = {
  message: string;
  status?: number;
  code?: string;
};

/**
 * Fetch JSON from API. Prefixes path with API_BASE_URL.
 * Throws on non-2xx responses with ApiError shape.
 * @param path - API path (e.g. /sessions/123/alerts)
 * @param options - fetch options (method, body, headers)
 */
export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const isFormData =
    typeof FormData !== "undefined" && options?.body instanceof FormData;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error: ApiError = {
      message: response.statusText,
      status: response.status,
    };
    try {
      const body = await response.json();
      throw { ...error, ...body };
    } catch (e) {
      if ("message" in (e as object)) throw e;
      throw error;
    }
  }

  return response.json();
}
