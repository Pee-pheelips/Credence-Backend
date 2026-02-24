import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import { requestId } from './requestId.js'
import { errorHandler } from './errorHandler.js'
import {
  ValidationError,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
  AppError,
} from '../errors/index.js'

/** Small app that uses the same middleware for testing error responses. */
function createTestApp() {
  const app = express()
  app.use(requestId)
  app.use(express.json())

  app.get('/ok', (_req, res) => res.json({ ok: true }))

  app.get('/400', (_req, _res, next) => {
    next(new ValidationError('Invalid input', { field: 'email' }))
  })

  app.get('/401', (_req, _res, next) => {
    next(new UnauthorizedError('Missing or invalid token'))
  })

  app.get('/403', (_req, _res, next) => {
    next(new ForbiddenError('Insufficient permissions'))
  })

  app.get('/404', (_req, _res, next) => {
    next(new NotFoundError('Resource not found'))
  })

  app.get('/500-unknown', (_req, _res, next) => {
    next(new Error('Internal implementation detail'))
  })

  app.get('/500-app', (_req, _res, next) => {
    next(new AppError('Server misconfiguration', { statusCode: 500 }))
  })

  app.use(errorHandler)
  return app
}

describe('errorHandler middleware', () => {
  let consoleError: typeof console.error
  let consoleWarn: typeof console.warn

  beforeEach(() => {
    consoleError = console.error
    consoleWarn = console.warn
    console.error = vi.fn()
    console.warn = vi.fn()
  })

  afterEach(() => {
    console.error = consoleError
    console.warn = consoleWarn
  })

  describe('consistent JSON shape', () => {
    it('returns code, message, and optional details and requestId', async () => {
      const app = createTestApp()
      const res = await request(app).get('/400').set('X-Request-Id', 'req-1')
      expect(res.status).toBe(400)
      expect(res.body).toMatchObject({
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: { field: 'email' },
        requestId: 'req-1',
      })
    })
  })

  describe('HTTP status mapping', () => {
    it('returns 400 for ValidationError', async () => {
      const app = createTestApp()
      const res = await request(app).get('/400')
      expect(res.status).toBe(400)
      expect(res.body.code).toBe('VALIDATION_ERROR')
    })

    it('returns 401 for UnauthorizedError', async () => {
      const app = createTestApp()
      const res = await request(app).get('/401')
      expect(res.status).toBe(401)
      expect(res.body.code).toBe('UNAUTHORIZED')
    })

    it('returns 403 for ForbiddenError', async () => {
      const app = createTestApp()
      const res = await request(app).get('/403')
      expect(res.status).toBe(403)
      expect(res.body.code).toBe('FORBIDDEN')
    })

    it('returns 404 for NotFoundError', async () => {
      const app = createTestApp()
      const res = await request(app).get('/404')
      expect(res.status).toBe(404)
      expect(res.body.code).toBe('NOT_FOUND')
    })

    it('returns 500 for unknown Error and does not expose message or stack', async () => {
      const app = createTestApp()
      const res = await request(app).get('/500-unknown')
      expect(res.status).toBe(500)
      expect(res.body.code).toBe('INTERNAL_ERROR')
      expect(res.body.message).toBe('An unexpected error occurred.')
      expect(res.body.stack).toBeUndefined()
      expect(res.body.message).not.toContain('Internal implementation detail')
    })

    it('returns 500 for AppError with statusCode 500', async () => {
      const app = createTestApp()
      const res = await request(app).get('/500-app')
      expect(res.status).toBe(500)
      expect(res.body.code).toBe('INTERNAL_ERROR')
      expect(res.body.message).toBe('Server misconfiguration')
    })
  })

  describe('request ID for tracing', () => {
    it('echoes X-Request-Id when provided', async () => {
      const app = createTestApp()
      const res = await request(app).get('/404').set('X-Request-Id', 'trace-123')
      expect(res.body.requestId).toBe('trace-123')
    })

    it('includes a generated requestId when header is missing', async () => {
      const app = createTestApp()
      const res = await request(app).get('/404')
      expect(res.body.requestId).toBeDefined()
      expect(typeof res.body.requestId).toBe('string')
      expect(res.body.requestId.length).toBeGreaterThan(0)
    })
  })

  describe('logging', () => {
    it('logs 4xx as warn and 5xx as error', async () => {
      const app = createTestApp()
      await request(app).get('/400')
      expect(console.warn).toHaveBeenCalled()
      expect(console.error).not.toHaveBeenCalled()
    })

    it('logs 5xx with console.error', async () => {
      const app = createTestApp()
      await request(app).get('/500-unknown')
      expect(console.error).toHaveBeenCalled()
    })
  })
})
