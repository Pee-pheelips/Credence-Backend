/**
 * Integration tests for the Express app: 404 handling and error response shape.
 */
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from './index.js'

describe('app error responses', () => {
  it('returns 404 with consistent shape for unknown route', async () => {
    const res = await request(app)
      .get('/api/nonexistent')
      .set('X-Request-Id', 'test-req-id')
    expect(res.status).toBe(404)
    expect(res.body).toMatchObject({
      code: 'NOT_FOUND',
      message: 'Not found',
      requestId: 'test-req-id',
    })
    expect(res.body).toHaveProperty('code')
    expect(res.body).toHaveProperty('message')
    expect(res.body).toHaveProperty('requestId')
  })

  it('returns 200 for known routes', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok', service: 'credence-backend' })
  })

  it('includes requestId in 404 response when not provided in header', async () => {
    const res = await request(app).get('/api/unknown')
    expect(res.status).toBe(404)
    expect(res.body.requestId).toBeDefined()
    expect(typeof res.body.requestId).toBe('string')
  })
})
