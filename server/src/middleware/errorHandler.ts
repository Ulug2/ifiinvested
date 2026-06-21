import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

export interface AppError extends Error {
  statusCode?: number
  code?: string
}

function isPrismaError(err: unknown): err is { code: string } {
  return typeof err === 'object' && err !== null && 'code' in err && typeof (err as { code: unknown }).code === 'string'
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Validation error', details: err.flatten().fieldErrors })
    return
  }

  if (isPrismaError(err) && err.code === 'P2002') {
    res.status(409).json({ error: 'Already exists' })
    return
  }

  const statusCode = err.statusCode ?? 500
  const message = statusCode < 500 ? err.message : 'Internal server error'
  res.status(statusCode).json({ error: message })
}

export function createError(message: string, statusCode: number): AppError {
  const err: AppError = new Error(message)
  err.statusCode = statusCode
  return err
}
