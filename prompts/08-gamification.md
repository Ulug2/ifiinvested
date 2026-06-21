# Prompt 08 — Gamification System (XP, Streaks, Milestones)

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
Finn is built (Prompt 07). Now wire up the full gamification engine — XP accrual, level-up logic, streak tracking, and milestone detection. These are the core habit hooks.

## Backend

### Gamification Service (`/server/src/services/gamification.service.ts`)

#### XP Rules (from brainstorm §5)
```ts
const XP_REWARDS = {
  DAILY_OPEN: 5,
  ROUND_UP_GENERATED: 10,
  STREAK_DAY: 15,
  MILESTONE_HIT: 50,
} as const
```

#### `addXP(userId: string, amount: number): Promise<LevelUpResult>`
```ts
interface LevelUpResult {
  xpBefore: number
  xpAfter: number
  levelBefore: number
  levelAfter: number
  leveledUp: boolean
  newMilestones: Milestone[]  // any milestones triggered by this XP event
}
```
1. Fetch user's current `xp` and `level`
2. Add `amount` to `xp`
3. Recalculate level: `level = Math.floor(xp / 100) + 1` (every 100 XP = 1 level)
4. If level changed: emit level-up (triggers Finn EXCITED state)
5. Update user in DB (atomic)
6. Return `LevelUpResult`

Level XP thresholds: `levelThreshold(level) = level * 100` — simple, linear.

#### `recordDailyOpen(userId: string): Promise<{ xpGained: number, streakUpdated: boolean }>`
1. Check `lastActiveAt` — if same calendar day (UTC), no-op (return 0 XP, streak unchanged)
2. Check if `lastActiveAt` was yesterday (UTC) → streak continues: `streakCount++`, award `XP_REWARDS.STREAK_DAY + XP_REWARDS.DAILY_OPEN`
3. If `lastActiveAt` was 2+ days ago → streak broken: `streakCount = 1`, award only `XP_REWARDS.DAILY_OPEN`
4. If no `lastActiveAt` (first open) → `streakCount = 1`, award `XP_REWARDS.DAILY_OPEN`
5. Update `lastActiveAt = now()`, `streakCount`, add XP via `addXP()`
6. Check milestones after update

**Day boundary:** Use UTC midnight. Avoid timezone-sensitive bugs.

#### `checkMilestones(userId: string): Promise<Milestone[]>`
Check all milestone thresholds and create records for newly achieved ones:

Invested amount milestones: `[10, 50, 100, 250, 500]`
Streak milestones: `[3, 7, 14, 30]`

1. Fetch total `VirtualInvestment` sum for user
2. Fetch user's `streakCount`
3. For each unachieved threshold in each type: compare against current value
4. Batch-create newly hit milestones (using `@@unique` constraint — duplicate inserts ignored via `upsert`)
5. Return array of newly created milestones
6. For each new milestone: call `addXP(userId, XP_REWARDS.MILESTONE_HIT)` and trigger Finn EXCITED

#### `getGamificationSnapshot(userId: string): Promise<GamificationSnapshot>`
```ts
interface GamificationSnapshot {
  xp: number
  level: number
  xpToNextLevel: number
  xpProgress: number  // 0–100 percent to next level
  streakCount: number
  streakDanger: boolean  // true if lastActiveAt > 20h ago (streak at risk)
  milestones: Milestone[]
  recentMilestone: Milestone | null  // latest unread milestone
}
```
Single efficient DB query (one user fetch + milestones join).

### Routes
```
GET  /api/gamification/snapshot  → requireAuth → gamificationController.snapshot
POST /api/gamification/daily     → requireAuth → gamificationController.recordDailyOpen
```

**`POST /api/gamification/daily`** should be called automatically by the frontend on every app open/focus — but must be idempotent (calling twice in same day = no double XP).

---

## Frontend

### Daily Open Tracking (`/client/src/hooks/useDailyOpen.ts`)
```ts
export function useDailyOpen() {
  const mutation = useMutation({ mutationFn: () => api.post('/gamification/daily') })
  
  useEffect(() => {
    const lastCalled = localStorage.getItem('vaulta-daily-open')
    const today = new Date().toISOString().split('T')[0]
    if (lastCalled !== today) {
      mutation.mutate(undefined, {
        onSuccess: () => localStorage.setItem('vaulta-daily-open', today)
      })
    }
  }, [])
}
```
Call `useDailyOpen()` inside `DashboardPage`.

### Level-Up Celebration Overlay (`/client/src/features/gamification/components/LevelUpOverlay.tsx`)

Full-screen overlay that appears when `recordDailyOpen` or `addXP` returns `leveledUp: true`.

Design:
- Dark semi-transparent backdrop
- Center card: `Card` variant `"elevated"`, `glow="gold"`
- Gold animated ring expanding outward (CSS `@keyframes` scale + opacity)
- Text: "LEVEL UP!" in `--font-weight-black`, `--font-size-3xl`, `--color-gold` with glow
- Sub: "You're now a Level {n} Investor"
- Bottom: gold particle burst — 12 small circles, each animated outward in different directions via CSS
- Auto-dismiss after 3s or tap to dismiss

Trigger: stored in Zustand `gamificationStore`:
```ts
interface GamificationStore {
  pendingLevelUp: { newLevel: number } | null
  setPendingLevelUp(data: { newLevel: number } | null): void
}
```
Rendered in `App.tsx` above all routes.

### Milestone Celebration Toast (`/client/src/features/gamification/components/MilestoneCelebration.tsx`)

Smaller, non-blocking: slides in from bottom, above the nav bar.
- Duration: 4 seconds
- Design: `Card` variant `"elevated"`, `glow="gold"`, `border: 1px solid var(--color-gold)`
- Content: trophy icon + "🏆 Milestone: {threshold} invested!" + XP gained
- Queue-able: if multiple milestones hit, show them sequentially

### Streak Danger Indicator
On the dashboard `IdentityCard` (Section 2 from Prompt 05):
- If `streakDanger: true`: add a pulsing amber ring around the streak badge + "!" indicator
- Tooltip on tap: "Open the app daily to keep your streak!"

### Update `GamificationSnapshot` Query
Add `useGamificationSnapshot()` hook:
```ts
export function useGamificationSnapshot() {
  return useQuery({
    queryKey: ['gamification'],
    queryFn: () => api.get('/gamification/snapshot').then(r => r.data),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  })
}
```
Wire this into the dashboard `IdentityCard` and `ProgressBar` (replacing any placeholder data from Prompt 05).

### Milestones Page Section (add to Finn page or new `/milestones` subsection)

List of all milestones with:
- Achieved: golden trophy + milestone name + date achieved
- Not yet achieved: gray lock icon + amount/day threshold
- Progress bar toward next unachieved threshold in each category

---

## Acceptance Criteria
- `POST /api/gamification/daily` called twice same day: XP granted once, streak incremented once
- Streak resets if user skips a day (test by setting `lastActiveAt` to 3 days ago)
- `streakDanger: true` when `lastActiveAt > 20h` and streak > 0
- Level-up overlay appears exactly once when crossing a level boundary
- Milestone celebration toast appears when `$10`, `$50`, or `$100` invested threshold is crossed
- Finn state changes to EXCITED when milestone hit (tested via `/api/finn/state`)
- `getGamificationSnapshot()` returns correct `xpProgress` percentage
- XP bar on dashboard reflects live data from snapshot query
- Zero TypeScript errors
- No double XP on page re-render or React StrictMode double-invoke
