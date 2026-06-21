# Prompt 03 — Database Schema & Seed Data

---

## ⚙️ Code Quality Requirements

All generated code must strictly follow:

* Scalable architecture
* Clean and maintainable structure
* High performance (fast execution, optimized rendering)
* Space-efficient implementation
* Professional-grade engineering standards
* No unnecessary complexity or overengineering

You should always prioritize production-quality patterns over quick hacks.

---

## 🔒 Security Requirements

Security is non-negotiable. All code must:

* Validate and sanitize every input at system boundaries — never trust client data
* Use parameterized queries only — no raw SQL string concatenation (Prisma handles this)
* Never expose internal errors, stack traces, or sensitive data in API responses
* Enforce authentication on every protected endpoint — no exceptions
* Store secrets in environment variables only — never hardcode or log them
* Apply rate limiting on all public-facing endpoints
* Follow OWASP Top 10 guidelines — prevent SQLi, XSS, CSRF, broken auth, and insecure direct object references
* Use HTTPS-only headers (HSTS, CSP, X-Frame-Options) in production
* Hash all passwords with bcrypt (cost ≥ 12) — never store plaintext
* Sanitize any data rendered to the DOM to prevent XSS

---

## Context
Auth is complete (Prompt 02). The `User` model exists. Now complete the full Prisma schema, run migrations, and build the mock transaction seeder that powers all demo data in v1.

## Prisma Schema (complete `/server/prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  xp           Int      @default(0)
  level        Int      @default(1)
  streakCount  Int      @default(0)
  lastActiveAt DateTime @default(now())
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  transactions       Transaction[]
  roundUps           RoundUp[]
  virtualInvestments VirtualInvestment[]
  milestones         Milestone[]
  finnEvents         FinnEvent[]
}

model Transaction {
  id                String   @id @default(cuid())
  userId            String
  amount            Float
  merchant          String
  category          String
  date              DateTime
  includedInRoundUp Boolean  @default(true)
  createdAt         DateTime @default(now())

  user    User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  roundUp RoundUp?

  @@index([userId, date])
}

model RoundUp {
  id            String         @id @default(cuid())
  userId        String
  transactionId String         @unique
  amount        Float
  status        RoundUpStatus  @default(PENDING)
  createdAt     DateTime       @default(now())

  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  transaction Transaction @relation(fields: [transactionId], references: [id], onDelete: Cascade)

  @@index([userId, status])
}

enum RoundUpStatus {
  PENDING
  COMMITTED
}

model VirtualInvestment {
  id             String   @id @default(cuid())
  userId         String
  amount         Float
  committedAt    DateTime @default(now())
  simulatedValue Float

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model Milestone {
  id          String        @id @default(cuid())
  userId      String
  type        MilestoneType
  threshold   Float
  achievedAt  DateTime      @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, type, threshold])
  @@index([userId])
}

enum MilestoneType {
  INVESTED_AMOUNT
  STREAK_DAYS
}

model FinnEvent {
  id          String     @id @default(cuid())
  userId      String
  state       FinnState
  message     String
  triggeredAt DateTime   @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, triggeredAt])
}

enum FinnState {
  HAPPY
  NEUTRAL
  JUDGING
  EXCITED
  MOTIVATIONAL
}
```

Run: `npx prisma migrate dev --name complete_schema`
Run: `npx prisma generate`

## Seed Service (`/server/src/services/seed.service.ts`)

### Mock Merchants & Categories
Define a typed array of 30+ realistic transactions that feel natural for a 20-year-old:
```ts
const MOCK_MERCHANTS = [
  { merchant: 'Starbucks', category: 'Coffee', amountRange: [4.5, 7.5] },
  { merchant: 'Chipotle', category: 'Food', amountRange: [9.0, 14.0] },
  { merchant: 'Uber', category: 'Transport', amountRange: [8.0, 22.0] },
  { merchant: 'Spotify', category: 'Subscriptions', amountRange: [9.99, 9.99] },
  { merchant: 'Amazon', category: 'Shopping', amountRange: [12.0, 65.0] },
  { merchant: 'McDonald\'s', category: 'Food', amountRange: [5.0, 12.0] },
  { merchant: 'Apple App Store', category: 'Subscriptions', amountRange: [0.99, 4.99] },
  { merchant: 'Netflix', category: 'Subscriptions', amountRange: [15.49, 15.49] },
  { merchant: 'Trader Joe\'s', category: 'Groceries', amountRange: [18.0, 55.0] },
  { merchant: 'Shell', category: 'Gas', amountRange: [28.0, 52.0] },
  { merchant: 'Lyft', category: 'Transport', amountRange: [6.0, 18.0] },
  { merchant: 'Target', category: 'Shopping', amountRange: [15.0, 80.0] },
  { merchant: 'DoorDash', category: 'Food', amountRange: [12.0, 32.0] },
  { merchant: 'Walgreens', category: 'Health', amountRange: [4.0, 22.0] },
  { merchant: 'Gym membership', category: 'Health', amountRange: [24.99, 24.99] },
] as const
```

### `seedTransactions(userId: string): Promise<void>`
Logic:
1. Delete existing transactions + round-ups for this user (idempotent re-seed)
2. Generate 45 transactions spread over the past 30 days
   - Distribute realistically: 2–3 per weekday, 1 on weekends
   - Pick random merchant from list, random amount in range with 2 decimal places
   - `includedInRoundUp`: true for all card purchases (all in this mock set)
3. For each transaction: calculate round-up = `Math.ceil(amount) - amount`, rounded to 2 decimals
4. Batch-create transactions then batch-create round-ups
5. Find round-ups summing to ≥$5 → mark those as `COMMITTED`, create `VirtualInvestment` records
   - Simulate growth: `simulatedValue = amount * (1 + 0.07 * daysAgo / 365)`
6. Log summary: `Seeded X transactions, Y round-ups (Z committed)`

### Seed Endpoint
```
POST /api/dev/seed   → calls seedTransactions(req.user.userId) → only in NODE_ENV !== 'production'
```
Protected by `requireAuth`. Returns `{ seeded: true, summary }`.

### On Signup (auto-seed)
In `auth.service.ts` `signup()` method: after creating user, call `seedTransactions(user.id)` so every new user immediately has data.

## Shared Types Update (`/shared/types/index.ts`)
Ensure all enums and interfaces match schema exactly:
```ts
export type RoundUpStatus = 'PENDING' | 'COMMITTED'
export type MilestoneType = 'INVESTED_AMOUNT' | 'STREAK_DAYS'
export type FinnState = 'HAPPY' | 'NEUTRAL' | 'JUDGING' | 'EXCITED' | 'MOTIVATIONAL'

export interface Transaction {
  id: string
  userId: string
  amount: number
  merchant: string
  category: string
  date: string  // ISO string
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
  amount: number
  committedAt: string
  simulatedValue: number
}

export interface Milestone {
  id: string
  type: MilestoneType
  threshold: number
  achievedAt: string
}
```

## Acceptance Criteria
- `npx prisma migrate dev` runs clean with no errors
- `POST /api/dev/seed` (authenticated) creates 45 transactions and correct round-ups for that user
- New signup automatically seeds transactions
- Re-seeding is idempotent (delete + recreate)
- `VirtualInvestment` records exist for all round-up batches that reached $5
- All TypeScript types in `/shared` match the Prisma schema exactly
