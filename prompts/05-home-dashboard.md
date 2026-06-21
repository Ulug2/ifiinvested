# Prompt 05 — Home Dashboard

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
Auth, schema, round-up engine, and all API hooks exist (Prompts 00–04). Now build the main Dashboard page — the heart of the app. Design: mobile-first (375px base), dark/light mode, all tokens from Prompt 01.

## Page: `/dashboard` (`/client/src/pages/Dashboard.tsx`)

Top-level layout: single scrollable column, max-width 480px centered, `padding: var(--space-4)`, `gap: var(--space-4)` between sections.

---

## Section 1 — Header Bar (sticky, `position: sticky; top: 0; z-index: var(--z-above)`)

```
[  Vaulta logo (text)   ]  [ theme toggle ]  [ user avatar initial ]
```
- Logo: "Vaulta" in `--font-weight-black`, `--color-accent-green`, `--font-size-lg`
- Theme toggle: sun/moon icon button (no library — inline SVG), calls `toggleTheme()`
- Avatar: circle with user's email initial, `background: var(--color-bg-elevated)`
- Background: `var(--color-bg-primary)` with `backdrop-filter: blur(8px)` — semi-glass feel when scrolling

---

## Section 2 — Identity Card (XP + Level + Streak)

`Card` with `variant="elevated"`, `glow="green"`

```
  Level 7 Investor                          🔥 6 days
  ████████████░░░░  XP bar  680 / 1000 XP
```

Components:
- `<LevelBadge level={level} />` — "Level {n} Investor", `--font-size-xl`, `--font-weight-bold`
- `<StreakBadge count={streakCount} />` — fire emoji + count + "day streak", `--color-warning`
- `<ProgressBar value={xpPercent} color="green" animated label="{xp} / {nextLevelXP} XP" />`
- XP to next level: `nextLevelXP = level * 100 + 100` (simple formula)
- On mount: animate XP bar fill from 0 → current value over 600ms

---

## Section 3 — Future Wealth Timeline (HERO — most visual impact)

`Card` with `variant="glass"`, `glow="cyan"`

Header: "Your Future Wealth" `--font-size-md` `--color-text-secondary`

Timeline row (horizontal scroll if needed, but should fit in 375px):
```
  Today        1 month      1 year       5 years
  $12.40   →   $98.50   →   $1,240   →   $8,900
  (solid)  (fading)     (fading)     (fading glow)
```

Implementation:
- Data from `useProjection()` hook (4 of the 6 points: today, 1mo, 1yr, 5yr)
- Each point: stacked `label` (small, muted) + `value` (large, bold)
- Connecting line between points: `border-top: 2px dashed var(--color-border-accent)`
- "Today" value: exact current balance in `--color-text-primary`
- Future values: progressively lighter opacity (`0.9 → 0.7 → 0.5`) + `--color-accent-cyan`
- Final point gets `--shadow-glow-cyan`
- Below: small disclaimer text "*Projected at 7% annual return. Not financial advice."` — `--font-size-xs`, `--color-text-muted`

---

## Section 4 — Round-Up Progress

`Card` with `variant="default"`

```
  Pending Round-Ups            $3.42 of $5.00
  ████████████░░░░░░░  68%
  
  Next commit when you reach $5.00 — $1.58 away
```

Components:
- Title + current/target amounts
- `<ProgressBar value={commitProgress} color="green" animated />`
- Subtext: `"${nextCommitAt.toFixed(2)} away from your next investment"`
- When ≥ $5: replace subtext with pulsing green "Ready to invest! →" button that calls `POST /api/roundups/commit` and shows success state

---

## Section 5 — Activity Feed (narrative style, NOT a table)

Header: "Recent Activity" + small "See all →" link

Feed items — each is a `Card` variant `"default"` with left accent border:

```
  [icon]  Starbucks · Coffee                     today
          $6.75 spent  →  +$0.25 invested ✨
```

```
  [icon]  🎯 Round-up committed!                 2 days ago
          $5.00 invested in your future
```

```
  [icon]  🏆 Level up! You're now Level 8        3 days ago
```

Implementation (`/client/src/features/dashboard/components/ActivityFeed.tsx`):
- Merge transactions + gamification events into a single sorted timeline
- Transaction items: merchant icon (category emoji map), narrative copy, relative timestamp
- Milestone/level items: trophy/star icon, celebration copy
- Category → emoji map: `{ Coffee: '☕', Food: '🍔', Transport: '🚗', Shopping: '🛍️', Subscriptions: '📱', Groceries: '🛒', Gas: '⛽', Health: '💊' }`
- Relative time: "just now", "2h ago", "yesterday", "3 days ago" (no library — implement yourself)
- Show 10 most recent items on dashboard, infinite scroll on `/activity` page
- Round-up amount in `--color-accent-green`

---

## Section 6 — Quick Stats Row

3 mini stat cards in a row (`display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-2)`)

| Total Invested | All-Time Gain | Transactions |
|---|---|---|
| $47.25 | +$0.82 (+1.7%) | 45 |

Use `<Stat>` component from design system.

---

## Bottom Navigation (fixed, `position: fixed; bottom: 0`)

```
[ 🏠 Home ]  [ 📈 Invest ]  [ 👻 Finn ]
```
- 3 tabs: Home (active), Investments, Finn
- Active: `--color-accent-green` icon + label
- Inactive: `--color-text-muted`
- Background: `var(--color-bg-secondary)` with top border `var(--color-border)`
- Height: 60px, safe-area-inset-bottom for iOS
- Page content has `padding-bottom: calc(60px + var(--space-4))` to not be clipped

---

## Animation Requirements
- XP bar: CSS `@keyframes fillBar` on mount
- Round-up progress bar: same
- Activity feed items: `opacity: 0 → 1` stagger (50ms delay per item, CSS only)
- No heavy animation libraries — CSS transitions + keyframes only

---

## Acceptance Criteria
- Dashboard loads and shows real data from seed (not placeholders)
- XP bar animates on load
- Future wealth timeline shows correct projected values
- Round-up progress bar shows correct pending balance
- Activity feed shows ≥10 items with narrative copy
- "Invest Now" button (when ≥ $5) calls commit API and updates UI
- Bottom nav works (tabs navigate to correct pages)
- Mobile 375px: no horizontal scroll, all content readable
- Dark and light mode both polished
- Zero TypeScript errors
