import type { Request, Response, NextFunction } from 'express'
import { isAppError } from '../errors/index.js'

/**
 * Standard error response body returned by the API for all error responses.
 * @property code - Machine-readable error code (e.g. NOT_FOUND, VALIDATION_ERROR)
 * @property message - Human-readable message, safe to display
 * @property details - Optional structured data (e.g. validation field errors)
 * @property requestId - Request ID for tracing (when available)
 */
export interface ErrorResponse {
  code: string
  message: string
  details?: unknown
  requestId?: string
}

const GENERIC_MESSAGE = 'An unexpected error occurred.'

/**
 * Centralized error-handling middleware. Must be registered after all routes.
 *
 * - Known errors (AppError subclasses): use their statusCode, code, message, and details.
 * - Unknown errors: return 500, INTERNAL_ERROR, and a safe message (no stack or internals).
 * - Logs the full error server-side; response never exposes stack or internal details.
 * - Includes requestId in the response when available for tracing.
 *
 * @param err - Error thrown in route or downstream middleware
 * @param req - Express request (used for requestId and logging context)
 * @param res - Express response
 * @param _next - Next function (unused; required by Express for error middleware)
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = req.requestId

  if (isAppError(err)) {
    const status = err.statusCode
    const body: ErrorResponse = {
      code: err.code,
      message: err.message,
      ...(err.details !== undefined && { details: err.details }),
      ...(requestId && { requestId }),
    }
    // Log at a level appropriate to status (4xx = warn, 5xx = error)
    if (status >= 500) {
      console.error('[errorHandler]', { requestId, code: err.code, message: err.message, stack: err.stack })
    } else {
      console.warn('[errorHandler]', { requestId, code: err.code, message: err.message })
    }
    res.status(status).json(body)
    return
  }

  // Unknown error: log fully, respond with safe message only
  console.error('[errorHandler] unexpected error', {
    requestId,
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  })
  const body: ErrorResponse = {
    code: 'INTERNAL_ERROR',
    message: GENERIC_MESSAGE,
    ...(requestId && { requestId }),
  }
  res.status(500).json(body)
}
