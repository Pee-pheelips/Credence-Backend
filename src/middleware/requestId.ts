import type { Request, Response, NextFunction } from 'express'
import { randomUUID } from 'node:crypto'

const HEADER_REQUEST_ID = 'x-request-id'

/**
 * Middleware that sets `req.requestId` for tracing.
 * Uses the incoming `X-Request-Id` header if present and non-empty;
 * otherwise generates a new UUID.
 *
 * @param req - Express request
 * @param _res - Express response (unused)
 * @param next - Next middleware
 */
export function requestId(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const incoming = req.get(HEADER_REQUEST_ID)
  req.requestId =
    typeof incoming === 'string' && incoming.trim() !== ''
      ? incoming.trim()
      : randomUUID()
  next()
}
