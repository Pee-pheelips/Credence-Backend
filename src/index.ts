import express from 'express'
import { requestId } from './middleware/requestId.js'
import { errorHandler } from './middleware/errorHandler.js'
import { NotFoundError } from './errors/index.js'
import { createHealthRouter } from './routes/health.js'
import { createDefaultProbes } from './services/health/probes.js'
import bulkRouter from './routes/bulk.js'

const app = express()
const PORT = process.env.PORT ?? 3000

app.use(requestId)
app.use(express.json())

const healthProbes = createDefaultProbes()
app.use('/api/health', createHealthRouter(healthProbes))

app.get('/api/trust/:address', (req, res) => {
  const { address } = req.params
  // Placeholder: in production, fetch from DB / reputation engine
  res.json({
    address,
    score: 0,
    bondedAmount: '0',
    bondStart: null,
    attestationCount: 0,
  })
})

app.get('/api/bond/:address', (req, res) => {
  const { address } = req.params
  res.json({
    address,
    bondedAmount: '0',
    bondStart: null,
    bondDuration: null,
    active: false,
  })
})

// Bulk verification endpoint (Enterprise)
app.use('/api/bulk', bulkRouter)

/** Catch-all: no route matched → 404. */
app.use((_req, _res, next) => {
  next(new NotFoundError('Not found'))
})

app.use(errorHandler)

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Credence API listening on http://localhost:${PORT}`)
  })
}

export { app }
export default app
