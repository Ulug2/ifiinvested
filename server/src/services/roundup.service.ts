import { RoundUpStatus } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { addXP } from './gamification.service'

export interface TransactionWithRoundUp {
  id: string
  amount: number
  merchant: string
  category: string
  date: Date
  includedInRoundUp: boolean
  roundUp: { amount: number; status: RoundUpStatus } | null
}

export interface TransactionPage {
  transactions: TransactionWithRoundUp[]
  nextCursor: string | null
}

export interface RoundUpSummary {
  pendingBalance: number
  totalCommitted: number
  totalTransactions: number
  nextCommitAt: number
  commitProgress: number
}

export function calculateRoundUp(amount: number): number {
  return parseFloat((Math.ceil(amount) - amount).toFixed(2))
}

export async function getPendingBalance(userId: string): Promise<number> {
  const agg = await prisma.roundUp.aggregate({
    where: { userId, status: RoundUpStatus.PENDING },
    _sum: { amount: true },
  })
  return parseFloat((agg._sum.amount ?? 0).toFixed(2))
}

export async function commitPendingRoundUps(userId: string) {
  const balance = await getPendingBalance(userId)
  if (balance < 5) return null

  const pending = await prisma.roundUp.findMany({
    where: { userId, status: RoundUpStatus.PENDING },
    select: { id: true },
  })

  const investment = await prisma.$transaction(async (tx) => {
    const inv = await tx.virtualInvestment.create({
      data: { userId, amount: balance, simulatedValue: balance },
    })
    await tx.roundUp.updateMany({
      where: { id: { in: pending.map((r) => r.id) } },
      data: { status: RoundUpStatus.COMMITTED },
    })
    return inv
  })

  // Fire-and-forget XP award — 10 XP per committed round-up
  addXP(userId, pending.length * 10).catch(() => null)

  return investment
}

export async function getTransactionsWithRoundUps(
  userId: string,
  limit = 20,
  cursor?: string
): Promise<TransactionPage> {
  const items = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id: true,
      amount: true,
      merchant: true,
      category: true,
      date: true,
      includedInRoundUp: true,
      roundUp: { select: { amount: true, status: true } },
    },
  })

  const hasMore = items.length > limit
  if (hasMore) items.pop()

  return {
    transactions: items,
    nextCursor: hasMore ? items[items.length - 1].id : null,
  }
}

export async function getRoundUpSummary(userId: string): Promise<RoundUpSummary> {
  const [pendingAgg, committedAgg, txCount] = await prisma.$transaction([
    prisma.roundUp.aggregate({
      where: { userId, status: RoundUpStatus.PENDING },
      _sum: { amount: true },
    }),
    prisma.roundUp.aggregate({
      where: { userId, status: RoundUpStatus.COMMITTED },
      _sum: { amount: true },
    }),
    prisma.roundUp.count({ where: { userId } }),
  ])

  const pendingBalance = parseFloat((pendingAgg._sum.amount ?? 0).toFixed(2))
  const totalCommitted = parseFloat((committedAgg._sum.amount ?? 0).toFixed(2))

  return {
    pendingBalance,
    totalCommitted,
    totalTransactions: txCount,
    nextCommitAt: parseFloat(Math.max(0, 5 - pendingBalance).toFixed(2)),
    commitProgress: Math.min(100, Math.round((pendingBalance / 5) * 100)),
  }
}
