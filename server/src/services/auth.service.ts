import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { createError } from '../middleware/errorHandler'

interface TokenPayload {
  sub: string
  email: string
}

interface AuthResult {
  token: string
  user: {
    id: string
    email: string
    xp: number
    level: number
    streakCount: number
  }
}

function signToken(userId: string, email: string): string {
  const secret = process.env.JWT_SECRET!
  const expiresIn = process.env.JWT_EXPIRES_IN ?? '7d'
  return jwt.sign({ sub: userId, email } satisfies TokenPayload, secret, { expiresIn } as jwt.SignOptions)
}

export async function signup(email: string, password: string): Promise<AuthResult> {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw createError('Email already in use', 409)

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { email, passwordHash },
    select: { id: true, email: true, xp: true, level: true, streakCount: true },
  })

  return { token: signToken(user.id, user.email), user }
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, passwordHash: true, xp: true, level: true, streakCount: true },
  })
  if (!user) throw createError('Invalid credentials', 401)

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) throw createError('Invalid credentials', 401)

  const { passwordHash: _, ...safeUser } = user
  return { token: signToken(safeUser.id, safeUser.email), user: safeUser }
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, xp: true, level: true, streakCount: true, lastActiveAt: true, createdAt: true },
  })
  if (!user) throw createError('User not found', 404)
  return user
}
