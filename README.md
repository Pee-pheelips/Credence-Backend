# Credence Backend

API and services for the Credence economic trust protocol. Provides health checks, trust score and bond status endpoints (to be wired to Horizon and a reputation engine).

## About

This service is part of [Credence](../README.md). It will support:

- Public query API (trust score, bond status, attestations)
- Horizon listener for bond/slash events (future)
- Reputation engine (off-chain score from bond data) (future)

## Prerequisites

- Node.js 18+
- npm or pnpm

## Setup

```bash
npm install
```

## Run locally

**Development (watch mode):**

```bash
npm run dev
```

**Production:**

```bash
npm run build
npm start
```

API runs at [http://localhost:3000](http://localhost:3000). The frontend proxies `/api` to this URL.

## Scripts

| Command         | Description              |
|-----------------|--------------------------|
| `npm run dev`   | Start with tsx watch     |
| `npm run build` | Compile TypeScript       |
| `npm start`     | Run compiled `dist/`     |
| `npm run lint`  | Run ESLint               |
| `npm test`      | Run tests (Vitest)       |
| `npm run test:watch` | Run tests in watch mode |

## API (current)

| Method | Path               | Description        |
|--------|--------------------|--------------------|
| GET    | `/api/health`      | Health check       |
| GET    | `/api/trust/:address` | Trust score (stub) |
| GET    | `/api/bond/:address`   | Bond status (stub) |

## Error handling

Errors are handled centrally and return a consistent JSON shape:

- **`code`** – Machine-readable code (e.g. `NOT_FOUND`, `VALIDATION_ERROR`)
- **`message`** – Human-readable message
- **`details`** – Optional structured data (e.g. validation field errors)
- **`requestId`** – Request ID for tracing (from `X-Request-Id` or generated)

Known error types map to HTTP status codes (e.g. `NotFoundError` → 404, `ValidationError` → 400). Unknown errors return 500 with a generic message; internals are logged server-side only. See [docs/ERROR_HANDLING.md](docs/ERROR_HANDLING.md) for details.

## Tech

- Node.js
- TypeScript
- Express

Extend with PostgreSQL, Redis, and Horizon event ingestion when implementing the full architecture.
