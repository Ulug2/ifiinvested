import { type Request, type Response } from 'express'
import { asyncHandler } from '../lib/asyncHandler'
import { getTransactionsWithRoundUps } from '../services/roundup.service'

export const list = asyncHandler(async (req: Request, res: Response) => {
  const rawLimit = parseInt(String(req.query.limit ?? '20'), 10)
  const limit = Number.isNaN(rawLimit) ? 20 : Math.max(1, Math.min(rawLimit, 100))
  const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : undefined

  const result = await getTransactionsWithRoundUps(req.user!.userId, limit, cursor)
  res.json(result)
})
