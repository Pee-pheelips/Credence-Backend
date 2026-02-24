# Centralized Error Handling

The API uses a single error-handling pipeline: custom error classes, request ID middleware, and an error handler that returns a consistent JSON shape and maps errors to HTTP status codes.

## Response format

All error responses use this JSON shape:

```json
{
  "code": "NOT_FOUND",
  "message": "Not found",
  "details": {},
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

| Field       | Type   | Description |
|------------|--------|-------------|
| `code`     | string | Machine-readable error code (e.g. `VALIDATION_ERROR`, `UNAUTHORIZED`) |
| `message`  | string | Human-readable message, safe to show in UI |
| `details`  | object | Optional; e.g. validation field errors |
| `requestId`| string | Request ID for tracing (from `X-Request-Id` header or generated) |

## Error classes and HTTP status

| Class               | HTTP status | Code              |
|---------------------|------------|-------------------|
| `ValidationError`   | 400        | `VALIDATION_ERROR`|
| `UnauthorizedError` | 401        | `UNAUTHORIZED`    |
| `ForbiddenError`    | 403        | `FORBIDDEN`       |
| `NotFoundError`     | 404        | `NOT_FOUND`       |
| `ConflictError`     | 409        | `CONFLICT`        |
| `UnprocessableError`| 422        | `UNPROCESSABLE`   |
| (unknown errors)    | 500        | `INTERNAL_ERROR`  |

## Usage in routes

Throw or pass to `next()` from route handlers or downstream middleware:

```ts
import { NotFoundError, ValidationError } from './errors/index.js'

// 404
if (!resource) next(new NotFoundError('Trust record not found'))

// 400 with details
if (!isValid(body)) next(new ValidationError('Invalid payload', { fields: [...] }))
```

## Request ID

The `requestId` middleware runs first. It sets `req.requestId` from the `X-Request-Id` header when present, otherwise generates a UUID. Clients can send `X-Request-Id` to correlate logs and error responses.

## Logging and security

- **4xx** (known app errors): logged at `warn` with `requestId`, `code`, `message`.
- **5xx** (and unknown errors): logged at `error` with full message and stack.
- Responses **never** include stack traces or internal error messages; 500 responses use a generic message.

## Files

- `src/errors/index.ts` – Error classes and `isAppError` type guard
- `src/middleware/requestId.ts` – Request ID middleware
- `src/middleware/errorHandler.ts` – Central error handler middleware
