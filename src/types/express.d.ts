/**
 * Augment Express Request for request ID tracing.
 */
declare global {
  namespace Express {
    interface Request {
      /** Request ID for tracing (from X-Request-Id header or generated). */
      requestId?: string
    }
  }
}

export {}
