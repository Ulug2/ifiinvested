import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import { errorHandler } from './middleware/errorHandler'
import indexRouter from './routes/index'
import authRouter from './routes/auth'
import transactionsRouter from './routes/transactions'
import roundupsRouter from './routes/roundups'
import investmentsRouter from './routes/investments'
import gamificationRouter from './routes/gamification'
import finnRouter from './routes/finn'
import { requireAuth } from './middleware/auth'
import devRouter from './routes/dev'

export function createApp() {
  const app = express()

  app.use(helmet())
  app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
  app.use(compression())
  app.use(express.json())
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
    })
  )

  app.use('/api', indexRouter)
  app.use('/api/auth', authRouter)
  app.use('/api/transactions', requireAuth, transactionsRouter)
  app.use('/api/roundups', requireAuth, roundupsRouter)
  app.use('/api/investments', requireAuth, investmentsRouter)
  app.use('/api/gamification', requireAuth, gamificationRouter)
  app.use('/api/finn', requireAuth, finnRouter)

  // Dev-only routes — never exposed in production
  if (process.env.NODE_ENV !== 'production') {
    app.use('/api/dev', devRouter)
  }

  app.use(errorHandler)

  return app
}
