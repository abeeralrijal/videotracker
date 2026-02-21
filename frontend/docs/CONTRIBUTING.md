# Contributing

## Code Style

- **TypeScript** – Strict mode, explicit types for public APIs
- **Formatting** – Use project ESLint config; run `npm run lint`
- **Naming** – PascalCase for components, camelCase for functions/variables, UPPER_SNAKE for constants

## Conventions

### Components

- Prefer functional components with hooks
- Keep components focused; extract reusable logic into hooks
- Use `"use client"` only when needed (interactivity, hooks, event handlers)

### API Layer

- All API functions in `lib/api/` return Promises
- Use `apiFetch()` for HTTP when backend is connected
- Add JSDoc for public functions and complex logic

### File Organization

- One component per file (except small, tightly related ones)
- Co-locate component-specific styles (Tailwind in className)
- Export from `hooks/index.ts` and `lib/api/index.ts` for clean imports

### Comments

- **JSDoc** – For exported functions, hooks, and components
- **Inline** – For non-obvious logic or business rules
- **TODO** – Use `// TODO:` with brief description for future work

### Branching

- `main` – Production-ready
- `develop` – Integration branch (optional)
- Feature branches – `feature/alert-websocket`, `fix/filter-dropdown`

### Commits

Prefer conventional commit messages:

```
feat: add WebSocket for real-time alerts
fix: filter dropdown close on outside click
docs: update API integration guide
refactor: extract useAlerts hook
```
