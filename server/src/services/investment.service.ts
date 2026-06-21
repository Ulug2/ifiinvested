import { prisma } from '../lib/prisma'

export interface PortfolioSummary {
  totalInvested: number
  currentValue: number
  allTimeGain: number
  allTimeGainPct: number
  investments: Array<{
    id: string
    userId: string
    amount: number
    committedAt: string
    simulatedValue: number
  }>
}

export interface ProjectionPoint {
  label: string
  value: number
  daysFromNow: number
}

const ANNUAL_RATE = 0.07
const MONTHLY_RATE = ANNUAL_RATE / 12

const PROJECTION_POINTS = [
  { label: 'Today',    days: 0    },
  { label: '1 month',  days: 30   },
  { label: '3 months', days: 90   },
  { label: '1 year',   days: 365  },
  { label: '5 years',  days: 1825 },
  { label: '10 years', days: 3650 },
] as const

export async function getPortfolioSummary(userId: string): Promise<PortfolioSummary> {
  const investments = await prisma.virtualInvestment.findMany({
    where: { userId },
    orderBy: { committedAt: 'asc' },
  })

  if (investments.length === 0) {
    return { totalInvested: 0, currentValue: 0, allTimeGain: 0, allTimeGainPct: 0, investments: [] }
  }

  const now = Date.now()
  const updated = investments.map((inv) => {
    const daysHeld = (now - inv.committedAt.getTime()) / 86400000
    const simulatedValue = parseFloat((inv.amount * Math.pow(1 + ANNUAL_RATE / 365, daysHeld)).toFixed(4))
    return { ...inv, simulatedValue }
  })

  // Batch-recalculate simulatedValue in DB atomically
  await prisma.$transaction(
    updated.map((inv) =>
      prisma.virtualInvestment.update({
        where: { id: inv.id },
        data: { simulatedValue: inv.simulatedValue },
      })
    )
  )

  const totalInvested = parseFloat(updated.reduce((s, i) => s + i.amount, 0).toFixed(2))
  const currentValue  = parseFloat(updated.reduce((s, i) => s + i.simulatedValue, 0).toFixed(2))
  const allTimeGain   = parseFloat((currentValue - totalInvested).toFixed(2))
  const allTimeGainPct =
    totalInvested === 0 ? 0 : parseFloat(((allTimeGain / totalInvested) * 100).toFixed(2))

  return {
    totalInvested,
    currentValue,
    allTimeGain,
    allTimeGainPct,
    investments: updated.map((inv) => ({
      id: inv.id,
      userId: inv.userId,
      amount: inv.amount,
      committedAt: inv.committedAt.toISOString(),
      simulatedValue: inv.simulatedValue,
    })),
  }
}

export async function getFutureProjection(userId: string): Promise<ProjectionPoint[]> {
  const investments = await prisma.virtualInvestment.findMany({
    where: { userId },
    select: { amount: true, committedAt: true },
    orderBy: { committedAt: 'asc' },
  })

  const totalInvested = investments.reduce((s, i) => s + i.amount, 0)

  // Estimate average monthly round-up contribution from history
  let monthlyContribution = 0
  if (investments.length > 0) {
    const oldestMs = investments[0].committedAt.getTime()
    const monthsActive = Math.max(1, (Date.now() - oldestMs) / (30 * 86400000))
    monthlyContribution = totalInvested / monthsActive
  }

  return PROJECTION_POINTS.map(({ label, days }) => {
    if (days === 0) {
      return { label, value: parseFloat(totalInvested.toFixed(2)), daysFromNow: 0 }
    }

    const years  = days / 365
    const months = days / 30

    // Future value: lump sum growth + regular monthly contributions
    const lumpSumFV = totalInvested * Math.pow(1 + ANNUAL_RATE, years)
    const contributionFV =
      monthlyContribution > 0
        ? monthlyContribution * ((Math.pow(1 + MONTHLY_RATE, months) - 1) / MONTHLY_RATE)
        : 0

    return {
      label,
      value: parseFloat((lumpSumFV + contributionFV).toFixed(2)),
      daysFromNow: days,
    }
  })
}
