export type RoundUpStatus = 'PENDING' | 'COMMITTED'
export type MilestoneType = 'INVESTED_AMOUNT' | 'STREAK_DAYS'
export type FinnState = 'HAPPY' | 'NEUTRAL' | 'JUDGING' | 'EXCITED' | 'MOTIVATIONAL'
export type FinnTrigger =
  | 'ROUND_UP_GENERATED'
  | 'STREAK_ACTIVE'
  | 'OVERSPENDING'
  | 'MILESTONE_HIT'
  | 'COMEBACK'
  | 'IDLE'

export interface User {
  id: string
  email: string
  xp: number
  level: number
  streakCount: number
  lastActiveAt: string
  onboardingDone: boolean
  createdAt: string
}

export interface Transaction {
  id: string
  userId: string
  amount: number
  merchant: string
  category: string
  date: string
  includedInRoundUp: boolean
  roundUp?: RoundUp
}

export interface RoundUp {
  id: string
  transactionId: string
  amount: number
  status: RoundUpStatus
}

export interface VirtualInvestment {
  id: string
  userId: string
  amount: number
  committedAt: string
  simulatedValue: number
}

export interface Milestone {
  id: string
  userId: string
  type: MilestoneType
  threshold: number
  achievedAt: string
  seenAt?: string | null
}

export interface FinnEvent {
  id: string
  userId: string
  state: FinnState
  message: string
  triggeredAt: string
}

export interface GamificationSnapshot {
  xp: number
  level: number
  xpToNextLevel: number
  xpProgress: number
  streakCount: number
  streakDanger: boolean
  milestones: Milestone[]
  recentMilestone: Milestone | null
}

export interface RoundUpSummary {
  pendingBalance: number
  totalCommitted: number
  totalTransactions: number
  nextCommitAt: number
  commitProgress: number
}

export interface PortfolioSummary {
  totalInvested: number
  currentValue: number
  allTimeGain: number
  allTimeGainPct: number
  investments: VirtualInvestment[]
}

export interface ProjectionPoint {
  label: string
  value: number
  daysFromNow: number
}

export interface FinnResponse {
  state: FinnState
  message: string
  trigger: FinnTrigger
}
