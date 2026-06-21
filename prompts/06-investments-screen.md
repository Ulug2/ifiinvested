# Prompt 06 — Investments Screen (Wealth Garden)

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
Dashboard is complete (Prompt 05). Now build the `/investments` page — the "Wealth Garden" — a visual portfolio screen. The metaphor is growth, not tables. Mobile-first, dark/light mode, all design tokens.

## Page: `/investments` (`/client/src/pages/Investments.tsx`)

Same layout container as dashboard: max-width 480px, centered, `padding: var(--space-4)`, bottom nav same.

---

## Section 1 — Portfolio Hero

`Card` with `variant="glass"`, `glow="green"`

```
  Total Portfolio Value
  $48.07                ↑ +$0.82 (+1.7%)

  [ Invested: $47.25 ]    [ Gain: +$0.82 ]
```

- "Total Portfolio Value" label: `--font-size-sm`, `--color-text-secondary`
- Main number: `--font-size-4xl`, `--font-weight-black`, `--color-text-primary`
- Delta: `+$0.82 (+1.7%)` in `--color-accent-green` with small `↑` arrow — animated count-up on mount
- Two sub-stats below: `<Stat>` components side by side

**Count-up animation**: On mount, animate the main value from 0 → current over 1200ms using a custom `useCountUp(target, duration)` hook. Easing: ease-out cubic.

---

## Section 2 — Growth Chart (Projection Visualization)

Visual timeline path — NOT a traditional chart library. Built with SVG or pure CSS.

### Design: Glowing Path
```
  ──●────────────────────────────────────────────●
  Today                                      10 years
  $48     ↗   $600     ↗   $3,200     ↗   $18,000
```

Implementation as a responsive SVG:
- Width: 100% of card, height: 140px
- Draw a smooth cubic bezier path from left (today) to right (10yr)
- Path stroke: `--color-accent-green`, `strokeWidth: 2`
- Glow effect: duplicate path with `filter: blur(4px)`, `opacity: 0.4`, `stroke: --color-accent-green`
- Dots at each projection point (today, 1yr, 5yr, 10yr) — filled circle `r=4`
- Labels below each dot: value in `--font-size-xs`, `--color-text-secondary`
- Today dot: white filled, larger `r=6`
- SVG path animates on mount: `stroke-dashoffset` animation from full length → 0 over 1500ms

Below chart: "Simulated at 7% annual return. For illustrative purposes only. Not financial advice." `--font-size-xs`, `--color-text-muted`, centered.

---

## Section 3 — Wealth Garden (Visual Portfolio)

Header: "Your Wealth Garden" `--font-size-md`, `--font-weight-bold`
Subtext: "Each investment is a seed you planted." `--color-text-secondary`, `--font-size-sm`

### Plant Grid
```
  🌱  🌿  🌿  🌳  🌱
  🌿  🌳  🌱  🌿  🌿
  +2 more seeds growing...
```

Implementation (`/client/src/features/investments/components/WealthGarden.tsx`):
- `display: grid; grid-template-columns: repeat(5, 1fr); gap: var(--space-3)`
- Each `VirtualInvestment` = one plant cell
- Plant stage based on `simulatedValue`:
  - `< $1`: 🌱 Seed (gray, tiny)
  - `$1–$2.49`: 🌱 Sprout (green-dim, small)
  - `$2.50–$4.99`: 🌿 Sapling (green, medium)
  - `$5+`: 🌳 Tree (bright green, full size, glow)
- Each plant: circular button, tooltip on hover/tap showing `$X invested → $Y now (+Z%)`
- Tooltip: `position: absolute`, `Card` variant `"elevated"`, appears above on tap (mobile-friendly)
- Plants appear with staggered scale animation: `scale(0) → scale(1)` with 50ms delay each
- "+" overflow badge if > 15 investments: shows count of additional

### Below Garden
```
  Total seeds: 12 investments
  Average gain per seed: +$0.07
```
`--color-text-secondary`, `--font-size-sm`

---

## Section 4 — Investment History List

Header: "Investment History" + filter toggle (All | This Month | Last Month)

Each row (not a `<table>` — use flex):
```
  ●  Round-up invested          Jan 15, 2025
     $5.00 → now $5.07  (+1.4%)             ↗
```
- Left: green dot indicator
- Center: "Round-up invested" + date
- Right: amount + gain percentage in `--color-accent-green`
- Separator: `1px solid var(--color-border)` between rows (not full card per row — space-efficient)

---

## Section 5 — "What If" Insight Card

`Card` with `variant="elevated"`, `glow="cyan"`

```
  💡 If you keep this up...
  
  Investing $12/month for 10 years =
  $20,860 at retirement age
```

- Calculate average monthly round-up from seed data
- Show projection to 10 years at 7%
- Bold the final number in `--color-accent-cyan`
- Small "Based on your average $X/month round-ups" subtext

---

## Acceptance Criteria
- Portfolio hero shows correct total value with count-up animation
- SVG growth path animates on page enter
- Wealth Garden renders plant emojis based on investment value tiers
- Plant tooltip shows on tap (not hover-only — mobile)
- Investment history list grouped/filtered correctly
- "What If" card calculates from real user data
- Both dark and light mode look polished
- No horizontal scroll on 375px
- Zero TypeScript errors
