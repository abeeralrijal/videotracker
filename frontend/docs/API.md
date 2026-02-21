# API Layer

## Overview

The API layer (`lib/api/`) abstracts data access. Currently uses **mock data**; swap implementations for real `apiFetch()` calls when the backend is ready.

## Client

### `apiFetch<T>(path, options?): Promise<T>`

Base HTTP client. Uses `NEXT_PUBLIC_API_URL` as prefix. Handles JSON, throws on non-2xx responses.

```typescript
const data = await apiFetch<User>('/users/me');
```

## Modules

### Alerts (`lib/api/alerts.ts`)

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `fetchAlerts` | `sessionId?` | `Alert[]` | Get all alerts for session |
| `confirmAlert` | `alertId`, `sessionId?` | `Alert` | Mark alert as confirmed |
| `dismissAlert` | `alertId`, `sessionId?` | `Alert` | Mark alert as dismissed |
| `submitAlertReview` | `alertId`, `review`, `sessionId?` | `Alert` | Submit operator review |

**Alert shape:** `{ id, type, timestamp, confidence, status, description, severity }`  
**Review input:** `{ wasCorrect, severity, notes }`

### Footage (`lib/api/footage.ts`)

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `searchFootage` | `query`, `sessionId?` | `SearchResult[]` | Search footage by natural language |

**SearchResult shape:** `{ id, label, timestamp, confidence }`

### Analytics (`lib/api/analytics.ts`)

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `fetchAnalytics` | `params?` | `AnalyticsData` | Get summary and event stats |

**AnalyticsData:** `{ summary, eventStats }`  
**Summary:** `{ totalEvents, confirmed, dismissed, aiAccuracy, avgConfidence }`  
**EventStats:** `{ eventType, count, confirmed, accuracy }[]`

### Monitoring (`lib/api/monitoring.ts`)

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `fetchProcessingStatus` | `sessionId?` | `ProcessingStatus` | Get processing progress |
| `fetchVideoSession` | `sessionId?` | `VideoSession` | Get video duration, current time, URL |

**ProcessingStatus:** `{ progress, chunksAnalyzed, totalChunks }`  
**VideoSession:** `{ duration, currentTime?, videoUrl? }`

## Backend Integration

Replace mock implementations with calls like:

```typescript
// lib/api/alerts.ts
import { apiFetch } from './client';

export async function fetchAlerts(sessionId?: string): Promise<Alert[]> {
  return apiFetch<Alert[]>(`/sessions/${sessionId}/alerts`);
}

export async function confirmAlert(alertId: string, sessionId?: string): Promise<Alert> {
  return apiFetch<Alert>(`/alerts/${alertId}/confirm`, { method: 'POST' });
}
```

Ensure the backend returns the same TypeScript shapes defined in `lib/types.ts` and `lib/api/analytics.ts`.
