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

## API (current)

| Method | Path                    | Description            |
|--------|-------------------------|------------------------|
| GET    | `/api/health`           | Health check           |
| GET    | `/api/trust/:address`   | Trust score            |
| GET    | `/api/bond/:address`    | Bond status (stub)     |

Full request/response documentation, cURL examples, and import instructions:
**[docs/api.md](docs/api.md)**

### OpenAPI spec

```
docs/openapi.yaml
```

Render with `npx @redocly/cli preview-docs docs/openapi.yaml` or paste into [editor.swagger.io](https://editor.swagger.io).

### Postman / Insomnia collection

```
docs/credence.postman_collection.json
```

Import via **File → Import** in Postman or Insomnia. See [docs/api.md](docs/api.md#importing-the-postman-collection) for step-by-step instructions and Newman CLI usage.

## Tech

- Node.js
- TypeScript
- Express

Extend with PostgreSQL, Redis, and Horizon event ingestion when implementing the full architecture.
