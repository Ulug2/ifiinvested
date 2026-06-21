import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { createError } from '../middleware/errorHandler'
import { seedTransactions } from './seed.service'

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
    onboardingDone: boolean
  }
}

function signToken(userId: string, email: string): string {
  const secret = process.env.JWT_SECRET!
  const expiresIn = process.env.JWT_EXPIRES_IN ?? '7d'
  return jwt.sign({ sub: userId, email } satisfies TokenPayload, secret, { expiresIn } as jwt.SignOptions)
}

const USER_SELECT = {
  id: true,
  email: true,
  xp: true,
  level: true,
  streakCount: true,
  onboardingDone: true,
} as const

export async function signup(email: string, password: string): Promise<AuthResult> {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw createError('Email already in use', 409)

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { email, passwordHash },
    select: USER_SELECT,
  })

  // Fire-and-forget seed — don't block signup response
  seedTransactions(user.id).catch(() => null)

  return { token: signToken(user.id, user.email), user }
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { ...USER_SELECT, passwordHash: true },
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
    select: { ...USER_SELECT, lastActiveAt: true, createdAt: true },
  })
  if (!user) throw createError('User not found', 404)
  return user
}

export async function completeOnboarding(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { onboardingDone: true },
  })
}
