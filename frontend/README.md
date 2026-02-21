# SentinelAI Frontend

AI-Powered Video Intelligence platform for detecting, verifying, and reviewing security events in video footage.

## Overview

SentinelAI helps operators monitor video feeds, search footage with natural language queries, review AI-detected alerts, and analyze event history. The frontend is built with **Next.js 16**, **React 19**, **TypeScript**, and **Tailwind CSS**.

## Features

| Feature | Description | Route |
|---------|-------------|-------|
| **Landing / Upload** | Select use case, upload video, start monitoring | `/` |
| **Dashboard** | Video player, footage search, live alerts, processing status | `/dashboard` |
| **Alert Review Modal** | Review AI detections with video clip, severity, notes | (modal) |
| **Event History** | Analytics summary and breakdown by event type | `/analytics` |
| **Authentication** | Login and sign up (UI only, no backend yet) | `/login`, `/signup` |

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Landing page
│   ├── login/              # Login page
│   ├── signup/             # Sign up page
│   ├── dashboard/          # Main monitoring dashboard
│   ├── analytics/          # Event history & analytics
│   ├── components/         # Page-specific components
│   │   ├── Header.tsx      # Shared header
│   │   ├── icons.tsx       # SVG icon components
│   │   ├── landing/        # Landing page components
│   │   └── dashboard/     # Dashboard components
│   └── layout.tsx
├── hooks/                  # Data fetching & state hooks
├── lib/                    # Shared utilities & API layer
│   ├── api/                # API client & mock implementations
│   ├── constants.ts        # App constants
│   └── types.ts            # TypeScript types
├── docs/                   # Detailed documentation
└── .env.example            # Environment variables template
```

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for a detailed architecture overview.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm start
```

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | Only when backend is connected |

## Data Flow & Backend Integration

The app uses a **service layer** (`lib/api/`) with **hooks** (`hooks/`) for data access. Currently, all data is mocked. To connect a real backend:

1. Set `NEXT_PUBLIC_API_URL` in `.env.local`
2. Replace mock implementations in `lib/api/*.ts` with `apiFetch()` calls
3. No changes needed in components or hooks

See [docs/API.md](./docs/API.md) for API contract details.

## Key Concepts

### Use Cases

- **Campus Safety** – Schools, universities
- **Traffic Monitor** – Roads, intersections

### Alert Severity

- `HIGH` – Immediate attention (red)
- `MED` – Medium priority (amber)
- `LOW` – Low priority (green)

### Alert Status

- `Pending` – Awaiting operator review
- `Confirmed` – Verified by operator
- `Dismissed` – Rejected / false alarm

## Documentation

- [Architecture](./docs/ARCHITECTURE.md) – System design, data flow, folder structure
- [API Layer](./docs/API.md) – API modules, backend integration guide
- [Components](./docs/COMPONENTS.md) – Component catalog and usage
- [Contributing](./docs/CONTRIBUTING.md) – Code style, conventions, workflows

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS 4
- **Language:** TypeScript 5
