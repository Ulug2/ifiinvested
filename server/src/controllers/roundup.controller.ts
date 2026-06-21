import { type Request, type Response } from 'express'
import { asyncHandler } from '../lib/asyncHandler'
import { getRoundUpSummary, commitPendingRoundUps, getPendingBalance } from '../services/roundup.service'

export const summary = asyncHandler(async (req: Request, res: Response) => {
  const data = await getRoundUpSummary(req.user!.userId)
  res.json(data)
})

export const commit = asyncHandler(async (req: Request, res: Response) => {
  const investment = await commitPendingRoundUps(req.user!.userId)
  if (!investment) {
    const pendingBalance = await getPendingBalance(req.user!.userId)
    res.json({ committed: false, pendingBalance })
    return
  }
  res.json({
    committed: true,
    investment: {
      ...investment,
      committedAt: investment.committedAt.toISOString(),
    },
  })
})
