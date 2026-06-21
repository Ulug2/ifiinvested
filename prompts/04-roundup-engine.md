# Prompt 04 — Round-Up Engine & API

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

## Context
Schema and seed data exist (Prompt 03). Now build the complete round-up business logic layer and expose the API endpoints the dashboard will consume.

## Round-Up Service (`/server/src/services/roundup.service.ts`)

### `calculateRoundUp(amount: number): number`
Pure function — no DB.
```
roundUp = parseFloat((Math.ceil(amount) - amount).toFixed(2))
```
Edge cases:
- Exact whole dollar (e.g. $5.00): round-up = $0.00 (skip — do not create RoundUp record)
- Already at 2 decimals that ceil to same: handled by `toFixed(2)`

### `getPendingBalance(userId: string): Promise<number>`
Sum all `RoundUp` records for user where `status = PENDING`. Return total rounded to 2 decimals.

### `commitPendingRoundUps(userId: string): Promise<VirtualInvestment | null>`
Logic:
1. Get pending balance
2. If balance < 5.00 → return null (nothing to commit)
3. Fetch all PENDING round-ups for user
4. Mark them all `COMMITTED` in a Prisma transaction
5. Create `VirtualInvestment` record: `amount = balance`, `simulatedValue = balance` (current value = cost basis at time of investment)
6. Award XP: call `gamification.service.addXP(userId, 10)` for each round-up committed
7. Return the new `VirtualInvestment`

### `getTransactionsWithRoundUps(userId: string, limit = 20): Promise<TransactionWithRoundUp[]>`
Fetch most recent transactions with their associated round-up joined. Include:
- `id`, `amount`, `merchant`, `category`, `date`, `includedInRoundUp`
- Nested `roundUp`: `{ amount, status }`
Order by `date DESC`. Support optional `cursor` for pagination.

### `getRoundUpSummary(userId: string): Promise<RoundUpSummary>`
Returns:
```ts
interface RoundUpSummary {
  pendingBalance: number
  totalCommitted: number       // sum of all COMMITTED round-ups
  totalTransactions: number    // count of transactions with round-ups
  nextCommitAt: number         // pendingBalance to reach $5 (i.e., 5 - pendingBalance)
  commitProgress: number       // 0–100 percent toward $5
}
```

## Investment Service (`/server/src/services/investment.service.ts`)

### `getPortfolioSummary(userId: string): Promise<PortfolioSummary>`
```ts
interface PortfolioSummary {
  totalInvested: number        // sum of all VirtualInvestment.amount
  currentValue: number         // sum of VirtualInvestment.simulatedValue (updated on fetch)
  allTimeGain: number          // currentValue - totalInvested
  allTimeGainPct: number       // as percentage
  investments: VirtualInvestment[]
}
```
When fetching, recalculate `simulatedValue` for each investment:
```ts
const daysHeld = (Date.now() - investment.committedAt.getTime()) / 86400000
const simulatedValue = investment.amount * Math.pow(1 + 0.07 / 365, daysHeld)
```
Update `simulatedValue` in DB on each fetch (batch update in transaction).

### `getFutureProjection(userId: string): Promise<ProjectionPoint[]>`
Given current `totalInvested`, project forward at 7% annual growth:
```ts
interface ProjectionPoint {
  label: string   // "Today", "1 month", "3 months", "1 year", "5 years", "10 years"
  value: number
  daysFromNow: number
}
```
Points: 0, 30, 90, 365, 1825, 3650 days.
Assume consistent monthly investment of average monthly round-up amount for projections beyond today.

## Routes (`/server/src/routes/`)

### `/api/transactions` (protected)
```
GET /api/transactions?limit=20&cursor=<id>
  → transactionController.list
  → returns { transactions: TransactionWithRoundUp[], nextCursor: string | null }
```

### `/api/roundups` (protected)
```
GET  /api/roundups/summary
  → roundupController.summary → RoundUpSummary

POST /api/roundups/commit
  → roundupController.commit → VirtualInvestment | { committed: false }
```

### `/api/investments` (protected)
```
GET /api/investments/portfolio
  → investmentController.portfolio → PortfolioSummary

GET /api/investments/projection
  → investmentController.projection → ProjectionPoint[]
```

## Frontend Data Layer (`/client/src/features/`)

### React Query hooks
Create these hooks (no UI yet — just data layer):

`/client/src/features/dashboard/hooks/useTransactions.ts`
```ts
export function useTransactions(limit = 20) {
  return useInfiniteQuery(...)  // infinite scroll support
}
```

`/client/src/features/dashboard/hooks/useRoundUpSummary.ts`
```ts
export function useRoundUpSummary() {
  return useQuery({ queryKey: ['roundup-summary'], queryFn: ... })
}
```

`/client/src/features/investments/hooks/usePortfolio.ts`
`/client/src/features/investments/hooks/useProjection.ts`

All hooks: 30s stale time, refetch on window focus.

## Acceptance Criteria
- `calculateRoundUp(5.25)` → `0.75`, `calculateRoundUp(5.00)` → `0.00`
- `GET /api/roundups/summary` returns correct numbers matching seed data
- `POST /api/roundups/commit` when pending ≥ $5: creates VirtualInvestment, marks round-ups COMMITTED, returns investment
- `POST /api/roundups/commit` when pending < $5: returns `{ committed: false, pendingBalance: X }`
- `GET /api/investments/projection` returns 6 data points in ascending order
- `simulatedValue` recalculates correctly based on days held
- All responses are typed — no `any` in controllers or services
