# Prompt 09 — Onboarding Flow

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
Full app is functional (Prompts 00–08). Now build the onboarding — the most critical retention moment. New users land here after signup. Goal: emotional hook in the first 30 seconds. No friction, no bank linking, just Finn + wonder.

## Route
`/onboarding` — protected route (must be logged in). After completing onboarding, redirect to `/dashboard`. Store `onboardingCompleted: boolean` on User model.

## Schema Update
Add to `User` model:
```prisma
onboardingDone Boolean @default(false)
```
Run `npx prisma migrate dev --name add_onboarding_flag`.

Also update auth service: `GET /api/auth/me` to return `onboardingDone`. In `App.tsx` route guard: if `user.onboardingDone === false` and path is not `/onboarding`, redirect to `/onboarding`.

---

## Onboarding Page (`/client/src/pages/Onboarding.tsx`)

### Layout
Full-screen, no nav bar, no header. Dark background always (dark-mode-only screen for maximum visual impact — no light mode variant here). Page controls its own background: `background: var(--color-bg-primary)`.

Progress indicator at top: 4 dots, active dot = `--color-accent-green`, inactive = `--color-bg-elevated`. `position: absolute; top: var(--space-6); left: 50%; transform: translateX(-50%)`.

"Skip →" text button top-right: `--color-text-muted`, jumps directly to Step 4 (account confirmation).

### Step Navigation
State: `currentStep: 1 | 2 | 3 | 4`
Transition between steps: slide-left CSS transition (300ms ease). Use `overflow: hidden` wrapper, inner div with `display: flex`, `transform: translateX(-N * 100%)`.

---

## Step 1 — Meet Finn

### Layout: centered, full height, flex column, `justify-content: center; align-items: center; gap: var(--space-6)`

```
  [large Finn character — 120px — EXCITED state]
  
  "Hey, I'm Finn."
  
  "I'm your financial companion.
   I watch your spending, round it up,
   and turn it into your future."
  
  [ Let's go → ]
```

- Finn character: use `FinnCharacter` from Prompt 07, `state="EXCITED"`, 120px
- Finn plays `excited` animation then settles to `idle` float after 2s
- "Hey, I'm Finn." — `--font-size-3xl`, `--font-weight-black`, `--color-accent-green`
- Body text — `--font-size-md`, `--color-text-secondary`, `line-height: var(--line-height-relaxed)`, centered, max-width 280px
- "Let's go →" — `Button` primary, full width max 280px

---

## Step 2 — Future Wealth Preview

### Layout: flex column, centered, `justify-content: center; align-items: center; gap: var(--space-5)`

```
  "What if your coffee
   bought your future too?"
  
  ☕  $6.75 Starbucks
      → +$0.25 round-up
  
  [ animated arrow ↓ ]
  
  💰 In 10 years: $1,240
  
  "Small amounts. Real compounding."
  
  [ Show me how → ]
```

Animation sequence (auto-plays on step enter):
1. Coffee emoji + transaction amount appears (fade in, 300ms)
2. Arrow animates downward (draw animation, 400ms)
3. Dollar amount counts up from $0 → $1,240 (800ms, ease-out)
4. Glow pulse on the final amount

- Use fake/demo data only — don't fetch real user data here
- The $1,240 figure is hardcoded (based on $0.25/day × 10yr × 7%)
- Transaction row: styled like activity feed item but centered, glow border

---

## Step 3 — Demo Round-Up

### Layout: flex column, centered, `gap: var(--space-5)`

```
  "Here's how it works"
  
  [interactive demo card]
  
  You spend:        $6.75
  Round-up:        +$0.25 ✨
  ─────────────────────────
  Goes to Finn:    +$0.25
  
  [progress bar: 5% toward $5 commit]
  "Keep rounding up → invest at $5"
  
  [ I get it → ]
```

Demo card is interactive:
- Tap "+" button to simulate another transaction: add a new transaction row, update the total, animate the progress bar forward
- Pre-load 3 demo transactions the user can "trigger" with taps
- After all 3 triggered, progress bar fills to ~65% and a mini Finn appears: "Almost there! 2 more coffees to invest."
- The `[ I get it → ]` button is always visible (don't gate on interaction)

Demo data (hardcoded, not real API):
```
Starbucks $6.75  → $0.25
Chipotle $11.30  → $0.70
Uber $14.50      → $0.50
```

---

## Step 4 — You're Ready

```
  [Finn — HAPPY state, 96px]
  
  "You're all set."
  
  Your account is ready.
  Round-ups are calculated from
  your demo transactions.
  
  [ XP badge: +50 XP for signing up ]
  
  [ Start building → ]
```

- Award 50 XP on completing onboarding: call `POST /api/gamification/daily` (handles XP)
- Also call `PATCH /api/auth/onboarding` to set `onboardingDone = true`
- XP badge: animated gold badge appears (scale in), shows "+50 XP"
- "Start building →" → `router.push('/dashboard')`

---

## API Additions

`PATCH /api/auth/onboarding` (protected):
```ts
// Mark onboarding complete
await prisma.user.update({ where: { id: userId }, data: { onboardingDone: true } })
return { success: true }
```

---

## Returning User Guard
In `App.tsx`:
```ts
if (user && !user.onboardingDone && location.pathname !== '/onboarding') {
  return <Navigate to="/onboarding" />
}
if (user && user.onboardingDone && location.pathname === '/onboarding') {
  return <Navigate to="/dashboard" />
}
```

---

## Acceptance Criteria
- New signup always lands on `/onboarding` step 1
- Step transitions are smooth (no flash, no layout shift)
- Finn character visible and animated on step 1 and 4
- Step 2 animation plays automatically on enter (count-up, arrow draw)
- Step 3 demo interactions work: tapping adds rows + updates progress bar
- Completing step 4 sets `onboardingDone = true` in DB
- After completing: redirected to `/dashboard`, never shown onboarding again
- Skip button jumps to step 4 directly
- Progress dots update correctly per step
- Mobile 375px: all text readable, no overflow, no scroll needed per step (fits in viewport)
- Zero TypeScript errors
