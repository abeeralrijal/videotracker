# Architecture

## Overview

SentinelAI follows a layered architecture with clear separation between UI, data access, and API communication.

```
┌─────────────────────────────────────────────────────────────┐
│                        Pages (app/*)                         │
│  Landing │ Login │ Signup │ Dashboard │ Analytics             │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                    Components (app/components/)              │
│  Presentational UI │ Form handling │ User interactions      │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                      Hooks (hooks/)                          │
│  useAlerts │ useFootageSearch │ useAnalytics │ useVideoSession │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                    API Layer (lib/api/)                      │
│  Mock data (current) → Real fetch when backend is ready      │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Dashboard Page

1. **Mount** – Hooks fetch initial data (alerts, search results, processing status, video session)
2. **User actions** – Confirm/dismiss alerts, search footage, seek video
3. **Hooks** – Call API layer, update local state, re-render components

### Analytics Page

1. **Mount** – `useAnalytics()` fetches summary and event stats
2. **Display** – Summary cards and table render from hook data

### Landing → Dashboard

1. User uploads video, clicks "Start Monitoring"
2. Client navigates to `/dashboard` (session creation can be added later)
3. Dashboard loads with mock data (or API data when backend exists)

## Folder Structure

```
app/
├── page.tsx                 # Landing: upload, use case, start monitoring
├── login/page.tsx           # Login form
├── signup/page.tsx          # Sign up form
├── dashboard/page.tsx       # Main dashboard: video, search, alerts
├── analytics/page.tsx       # Event history, summary stats
├── layout.tsx               # Root layout, fonts, metadata
├── globals.css              # Tailwind, CSS variables
└── components/
    ├── Header.tsx            # Shared header (logo, Sign In/Up)
    ├── icons.tsx            # Reusable SVG icons
    ├── landing/              # UseCaseSelect, VideoUpload, LandingHero
    └── dashboard/            # All dashboard UI components

hooks/                       # Data & state management
├── useAlerts.ts             # Alerts CRUD, confirm, dismiss, review
├── useFootageSearch.ts      # Search query & results
├── useAnalytics.ts          # Analytics summary & event stats
├── useProcessingStatus.ts   # Processing progress (polling)
├── useVideoSession.ts       # Video duration, current time
└── index.ts

lib/
├── api/                     # API client & service implementations
│   ├── client.ts            # apiFetch(), base URL config
│   ├── alerts.ts            # Alerts CRUD
│   ├── footage.ts           # Footage search
│   ├── analytics.ts         # Analytics data
│   ├── monitoring.ts        # Processing status, video session
│   └── index.ts
├── constants.ts             # USE_CASES, etc.
└── types.ts                 # Alert, SearchResult, etc.
```

## Routing

| Route | Purpose |
|-------|---------|
| `/` | Landing page, video upload |
| `/login` | User login |
| `/signup` | User registration |
| `/dashboard` | Monitoring dashboard |
| `/analytics` | Event history & analytics |

## State Management

- **Local state** – `useState` for UI state (modals, filters, form values)
- **Server state** – Hooks manage fetch, loading, error
- **No global store** – Each page uses its own hooks; context can be added later for auth/session

## Backend Integration Path

1. Add `NEXT_PUBLIC_API_URL` to environment
2. Implement real API calls in `lib/api/*.ts` using `apiFetch()`
3. Add session ID from URL (e.g. `/dashboard/[sessionId]`) or monitoring start response
4. Pass `sessionId` to hooks; API functions already accept it
