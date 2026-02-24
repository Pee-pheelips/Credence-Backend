/**
 * Centralized error types and HTTP status mapping for the Credence API.
 * All API errors should use these classes so the error handler can return
 * consistent JSON and appropriate status codes.
 */

/** HTTP status code for this error type */
const STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  INTERNAL: 500,
} as const

/**
 * Base application error. All custom API errors extend this.
 * The error handler uses `statusCode`, `code`, and `details` to build the response.
 */
export class AppError extends Error {
  /** Machine-readable error code (e.g. NOT_FOUND, VALIDATION_ERROR) */
  readonly code: string
  /** HTTP status code to return */
  readonly statusCode: number
  /** Optional structured details (e.g. validation field errors) */
  readonly details?: unknown

  constructor(
    message: string,
    options: {
      code?: string
      statusCode?: number
      details?: unknown
    } = {}
  ) {
    super(message)
    this.name = 'AppError'
    this.code = options.code ?? 'INTERNAL_ERROR'
    this.statusCode = options.statusCode ?? STATUS.INTERNAL
    this.details = options.details
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

/**
 * Validation error (e.g. invalid body or query). Maps to HTTP 400.
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, {
      code: 'VALIDATION_ERROR',
      statusCode: STATUS.BAD_REQUEST,
      details,
    })
    this.name = 'ValidationError'
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}

/**
 * Unauthorized (missing or invalid auth). Maps to HTTP 401.
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', details?: unknown) {
    super(message, {
      code: 'UNAUTHORIZED',
      statusCode: STATUS.UNAUTHORIZED,
      details,
    })
    this.name = 'UnauthorizedError'
    Object.setPrototypeOf(this, UnauthorizedError.prototype)
  }
}

/**
 * Forbidden (valid auth but insufficient permissions). Maps to HTTP 403.
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', details?: unknown) {
    super(message, {
      code: 'FORBIDDEN',
      statusCode: STATUS.FORBIDDEN,
      details,
    })
    this.name = 'ForbiddenError'
    Object.setPrototypeOf(this, ForbiddenError.prototype)
  }
}

/**
 * Resource not found. Maps to HTTP 404.
 */
export class NotFoundError extends AppError {
  constructor(message = 'Not found', details?: unknown) {
    super(message, {
      code: 'NOT_FOUND',
      statusCode: STATUS.NOT_FOUND,
      details,
    })
    this.name = 'NotFoundError'
    Object.setPrototypeOf(this, NotFoundError.prototype)
  }
}

/**
 * Conflict (e.g. duplicate resource). Maps to HTTP 409.
 */
export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, {
      code: 'CONFLICT',
      statusCode: STATUS.CONFLICT,
      details,
    })
    this.name = 'ConflictError'
    Object.setPrototypeOf(this, ConflictError.prototype)
  }
}

/**
 * Unprocessable entity (e.g. business rule violation). Maps to HTTP 422.
 */
export class UnprocessableError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, {
      code: 'UNPROCESSABLE',
      statusCode: STATUS.UNPROCESSABLE,
      details,
    })
    this.name = 'UnprocessableError'
    Object.setPrototypeOf(this, UnprocessableError.prototype)
  }
}

/**
 * Type guard: true if value is an AppError (or subclass).
 */
export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError
}
