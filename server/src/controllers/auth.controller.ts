import { Request, Response } from 'express'
import * as authService from '../services/auth.service'
import { asyncHandler } from '../lib/asyncHandler'

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.signup(req.body.email, req.body.password)
  res.status(201).json(result)
})

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body.email, req.body.password)
  res.json(result)
})

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getMe(req.user!.userId)
  res.json(user)
})

export const onboarding = asyncHandler(async (req: Request, res: Response) => {
  await authService.completeOnboarding(req.user!.userId)
  res.json({ success: true })
})
