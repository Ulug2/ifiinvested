import { RoundUpStatus } from '@prisma/client'
import { prisma } from '../lib/prisma'

interface MerchantDef {
  merchant: string
  category: string
  amountRange: [number, number]
}

const MERCHANTS: MerchantDef[] = [
  { merchant: 'Starbucks',       category: 'Coffee',        amountRange: [4.50,  7.50]  },
  { merchant: 'Chipotle',        category: 'Food',          amountRange: [9.00,  14.00] },
  { merchant: 'Uber',            category: 'Transport',     amountRange: [8.00,  22.00] },
  { merchant: 'Spotify',         category: 'Subscriptions', amountRange: [9.99,  9.99]  },
  { merchant: 'Amazon',          category: 'Shopping',      amountRange: [12.00, 65.00] },
  { merchant: "McDonald's",      category: 'Food',          amountRange: [5.00,  12.00] },
  { merchant: 'Apple App Store', category: 'Subscriptions', amountRange: [0.99,  4.99]  },
  { merchant: 'Netflix',         category: 'Subscriptions', amountRange: [15.49, 15.49] },
  { merchant: "Trader Joe's",    category: 'Groceries',     amountRange: [18.00, 55.00] },
  { merchant: 'Shell',           category: 'Gas',           amountRange: [28.00, 52.00] },
  { merchant: 'Lyft',            category: 'Transport',     amountRange: [6.00,  18.00] },
  { merchant: 'Target',          category: 'Shopping',      amountRange: [15.00, 80.00] },
  { merchant: 'DoorDash',        category: 'Food',          amountRange: [12.00, 32.00] },
  { merchant: 'Walgreens',       category: 'Health',        amountRange: [4.00,  22.00] },
  { merchant: 'Gym membership',  category: 'Health',        amountRange: [24.99, 24.99] },
]

function randomAmount(min: number, max: number): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2))
}

function calcRoundUp(amount: number): number {
  return parseFloat((Math.ceil(amount) - amount).toFixed(2))
}

function pickMerchant(): MerchantDef {
  return MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)]
}

interface SeedSummary {
  transactions: number
  roundUps: number
  committed: number
  investments: number
}

export async function seedTransactions(userId: string): Promise<SeedSummary> {
  // Idempotent: clear existing seed data for this user
  await prisma.$transaction([
    prisma.virtualInvestment.deleteMany({ where: { userId } }),
    prisma.roundUp.deleteMany({ where: { userId } }),
    prisma.transaction.deleteMany({ where: { userId } }),
    prisma.milestone.deleteMany({ where: { userId } }),
  ])

  // Build 45 transactions spread over past 30 days
  const now = Date.now()
  const txInputs: Array<{
    userId: string
    amount: number
    merchant: string
    category: string
    date: Date
    includedInRoundUp: boolean
  }> = []

  for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
    const isWeekend = new Date(now - daysAgo * 86400000).getDay() % 6 === 0
    const count = isWeekend ? 1 : Math.random() < 0.5 ? 2 : 3

    for (let i = 0; i < count; i++) {
      const { merchant, category, amountRange } = pickMerchant()
      const amount = randomAmount(amountRange[0], amountRange[1])
      const hourOffset = Math.floor(Math.random() * 57600) // random time during waking hours
      txInputs.push({
        userId,
        amount,
        merchant,
        category,
        date: new Date(now - daysAgo * 86400000 + hourOffset * 1000),
        includedInRoundUp: true,
      })
    }
  }

  // Trim or pad to exactly 45
  const finalTxs = txInputs.slice(0, 45)

  // Batch-create transactions
  await prisma.transaction.createMany({ data: finalTxs })

  // Fetch back with IDs
  const created = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: 'asc' },
  })

  // Build round-ups — skip zero amounts (exact dollar amounts)
  const roundUpInputs = created
    .map((tx) => ({ txId: tx.id, amount: calcRoundUp(tx.amount), daysAgo: Math.floor((now - tx.date.getTime()) / 86400000) }))
    .filter((r) => r.amount > 0)

  // Batch-create PENDING round-ups first
  await prisma.roundUp.createMany({
    data: roundUpInputs.map((r) => ({
      userId,
      transactionId: r.txId,
      amount: r.amount,
      status: RoundUpStatus.PENDING,
    })),
  })

  // Group round-ups into $5 commit batches (chronologically)
  let accumulator = 0
  const toCommit: string[] = []
  const investments: Array<{ amount: number; daysAgo: number }> = []

  for (const r of roundUpInputs) {
    accumulator = parseFloat((accumulator + r.amount).toFixed(2))
    toCommit.push(r.txId)

    if (accumulator >= 5) {
      investments.push({ amount: accumulator, daysAgo: r.daysAgo })
      accumulator = 0
      // Mark this batch committed
      await prisma.roundUp.updateMany({
        where: { transactionId: { in: toCommit }, userId },
        data: { status: 'COMMITTED' },
      })
      toCommit.length = 0
    }
  }

  // Create VirtualInvestment records with simulated growth
  if (investments.length > 0) {
    await prisma.virtualInvestment.createMany({
      data: investments.map((inv) => {
        const committedAt = new Date(now - inv.daysAgo * 86400000)
        const daysHeld = inv.daysAgo
        const simulatedValue = parseFloat(
          (inv.amount * Math.pow(1 + 0.07 / 365, daysHeld)).toFixed(4)
        )
        return { userId, amount: inv.amount, committedAt, simulatedValue }
      }),
    })
  }

  return {
    transactions: created.length,
    roundUps: roundUpInputs.length,
    committed: investments.length,
    investments: investments.length,
  }
}
