import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { asyncHandler } from '../lib/asyncHandler'
import { seedTransactions } from '../services/seed.service'

const router = Router()

// Only registered in non-production — see app.ts
router.post(
  '/seed',
  requireAuth,
  asyncHandler(async (req, res) => {
    const summary = await seedTransactions(req.user!.userId)
    res.json({ seeded: true, summary })
  })
)

export default router
