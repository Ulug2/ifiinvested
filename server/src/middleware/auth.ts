import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { createError } from './errorHandler'

export interface AuthPayload {
  userId: string
  email: string
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return next(createError('Unauthorized', 401))

  const token = header.slice(7)
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET not configured')

  try {
    const decoded = jwt.verify(token, secret) as { sub: string; email: string }
    req.user = { userId: decoded.sub, email: decoded.email }
    next()
  } catch {
    next(createError('Unauthorized', 401))
  }
}
