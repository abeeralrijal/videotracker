# Components

## Shared Components

### `Header`

Landing page header with logo and auth links.

- **Usage:** `<Header />`
- **Location:** `app/components/Header.tsx`
- **Links:** Logo → `/`, Sign Up → `/signup`, Sign In → `/login`

### `icons.tsx`

Reusable SVG icons.

| Icon | Usage |
|------|-------|
| `ShieldIcon` | Logo/brand |
| `ChevronDownIcon` | Dropdowns |
| `UploadIcon` | File upload |
| `SearchIcon` | Search UI |
| `PlayIcon` | Video playback |
| `AlertBellIcon` | Live alerts |
| `BarChartIcon` | Analytics |

---

## Landing Components (`app/components/landing/`)

### `LandingHero`

Hero section with title and tagline.

### `UseCaseSelect`

Dropdown for use case (Campus Safety, Traffic Monitor). Controlled by `value` and `onChange`.

### `VideoUpload`

Drag-and-drop video upload. Props: `file`, `onFileChange`. Accepts MP4, AVI, MOV.

---

## Dashboard Components (`app/components/dashboard/`)

### `DashboardHeader`

Header with logo, use case selector, monitoring status, Stop button, Event History link.

**Props:** `useCase`, `onUseCaseChange`, `onStop`

### `VideoPlayer`

Video display with progress bar and time.

**Props:** `src?`, `currentTime`, `duration`, `onSeek?`

### `ProcessingStatus`

Shows processing progress and chunks analyzed.

**Props:** `progress`, `chunksAnalyzed`, `totalChunks`

### `FootageQuery`

Search input and button for natural language footage queries.

**Props:** `query`, `onQueryChange`, `onSearch`

### `SearchResults`

List of search results with Play Clip buttons.

**Props:** `results`, `onPlayClip`

### `LiveAlerts`

Alerts list with filter dropdown (severity, status).

**Props:** `alerts`, `onPlayClip`, `onConfirm`, `onDismiss`, `onReview`

### `AlertItem`

Single alert card with actions (Play Clip, Review, Confirm, Dismiss).

**Props:** `alert`, `onPlayClip`, `onConfirm`, `onDismiss`, `onReview`

### `AlertReviewModal`

Modal for reviewing an alert: video clip, AI explanation, Was AI correct?, Severity, Notes, Submit.

**Props:** `alert`, `onClose`, `onSubmit`
