const AUTH_KEY = "sentinelai:authed";
const AUTH_EXPIRES_KEY = "sentinelai:authed_expires";
const LAST_VIDEO_KEY = "sentinelai:lastVideoId";
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;
const ASK_CACHE_PREFIX = "sentinelai:ask:";

export function isAuthed(): boolean {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem(AUTH_KEY);
  if (!token) return false;
  const expiry = localStorage.getItem(AUTH_EXPIRES_KEY);
  if (!expiry) return true;
  const expiryMs = Number(expiry);
  if (!Number.isFinite(expiryMs)) return true;
  if (Date.now() > expiryMs) {
    clearAuthed();
    return false;
  }
  return true;
}

export function setAuthed(value: string, ttlMs: number = DEFAULT_TTL_MS) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_KEY, value || "true");
  localStorage.setItem(AUTH_EXPIRES_KEY, String(Date.now() + ttlMs));
}

export function clearAuthed() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(AUTH_EXPIRES_KEY);
}

export function clearAskCache() {
  if (typeof window === "undefined") return;
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key && key.startsWith(ASK_CACHE_PREFIX)) {
      keys.push(key);
    }
  }
  keys.forEach((key) => localStorage.removeItem(key));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  clearAuthed();
  localStorage.removeItem(LAST_VIDEO_KEY);
  clearAskCache();
}

export function getLastSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LAST_VIDEO_KEY);
}

export function setLastSessionId(value: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LAST_VIDEO_KEY, value);
}
