import { type Request, type Response } from 'express'
import { asyncHandler } from '../lib/asyncHandler'
import { getPortfolioSummary, getFutureProjection } from '../services/investment.service'

export const portfolio = asyncHandler(async (req: Request, res: Response) => {
  const data = await getPortfolioSummary(req.user!.userId)
  res.json(data)
})

export const projection = asyncHandler(async (req: Request, res: Response) => {
  const data = await getFutureProjection(req.user!.userId)
  res.json(data)
})
