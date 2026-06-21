# Prompt 07 — Finn State Engine + UI

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
Dashboard and Investments screens exist (Prompts 05–06). Now build Finn — the ghost/cloud mascot. Backend state engine + frontend animated character. Finn is the emotional heart of the app.

## Backend

### Finn Service (`/server/src/services/finn.service.ts`)

#### State Determination Logic
```ts
function determineFinnState(userId: string, context: FinnContext): FinnState
```

```ts
interface FinnContext {
  streakCount: number
  recentSpendingVsAverage: number  // ratio: 1.3 = 30% above average this week
  latestMilestone: Milestone | null
  hoursSinceLastActive: number
  pendingBalance: number
}
```

Rules (priority order — first match wins):
1. If `latestMilestone` achieved in last 24h → `EXCITED`
2. If `streakCount >= 3` and `hoursSinceLastActive < 24` → `HAPPY`
3. If `recentSpendingVsAverage > 1.25` (spending 25%+ above weekly avg) → `JUDGING`
4. If `streakCount === 0` or `hoursSinceLastActive >= 48` → `MOTIVATIONAL`
5. Default → `NEUTRAL`

#### Message Library
Typed message map — 3–5 messages per state/event, randomly selected:
```ts
const FINN_MESSAGES: Record<FinnTrigger, string[]> = {
  ROUND_UP_GENERATED: [
    "You just turned ${amount} into your future self's money. Good move.",
    "That ${amount} round-up? Compound interest just noticed you.",
    "Small number, big habit. ${amount} added.",
  ],
  STREAK_ACTIVE: [
    "{n} days in a row. This is how wealth habits are built.",
    "Day {n}. Most people quit by day 3. You didn't.",
    "Streak alive. Your future self is watching.",
  ],
  OVERSPENDING: [
    "This week's spending is higher than usual. Want a reset challenge?",
    "Your wallet's been busy. Nothing wrong with noticing.",
    "Slightly above average this week. Awareness is step one.",
  ],
  MILESTONE_HIT: [
    "You just hit ${amount} invested. That's your first real wealth step.",
    "${amount} in. Most people never start. You did.",
    "New milestone: ${amount}. Finn is proud. (Finn doesn't say that often.)",
  ],
  COMEBACK: [
    "You're back. Finn missed the action.",
    "Long time no streak. Let's fix that.",
    "Welcome back. The market waited. Finn did too.",
  ],
  IDLE: [
    "Still here. Your round-ups aren't going anywhere.",
    "Just checking in. Your money's still growing (slowly).",
  ],
}
```

`interpolateMessage(template: string, vars: Record<string, string>): string` — replaces `{key}` and `${key}` placeholders.

#### `getFinnState(userId: string): Promise<FinnResponse>`
```ts
interface FinnResponse {
  state: FinnState
  message: string
  trigger: FinnTrigger
}
```
1. Fetch user (streak, lastActiveAt, xp)
2. Fetch recent round-ups (last 7 days spending vs prior 7 days)
3. Fetch latest unread milestone (achieved in last 24h)
4. Build `FinnContext`, call `determineFinnState`
5. Pick random message from `FINN_MESSAGES[trigger]`, interpolate
6. Persist to `FinnEvent` table
7. Return `FinnResponse`

#### `markMilestoneRead(userId: string, milestoneId: string): Promise<void>`
Mark a milestone as "seen" so Finn doesn't keep re-triggering EXCITED state.
Add `seenAt DateTime?` to `Milestone` model → new migration.

### Routes
```
GET  /api/finn/state          → requireAuth → finnController.getState
POST /api/finn/milestone/read → requireAuth → body: { milestoneId } → finnController.markRead
```

---

## Frontend

### Finn Character (`/client/src/features/finn/components/FinnCharacter.tsx`)

Finn is a CSS-animated ghost/blob — no external animation library, no images.

#### Base Shape (pure CSS)
```css
.finn {
  width: 64px;
  height: 72px;
  position: relative;
}

.finn-body {
  width: 64px;
  height: 52px;
  border-radius: 50% 50% 40% 40%;
  background: linear-gradient(160deg, var(--finn-color-top), var(--finn-color-bottom));
  position: relative;
  filter: drop-shadow(0 0 12px var(--finn-glow));
}

/* Wavy bottom (ghost tail) */
.finn-tail {
  display: flex;
  position: absolute;
  bottom: -12px;
  left: 0; right: 0;
}
.finn-bump { width: 16px; height: 16px; border-radius: 50%; background: same as body; }
```

#### State → Visual Mapping
```ts
const FINN_VISUALS = {
  HAPPY:        { colorTop: '#00FF87', colorBottom: '#00CC6A', glow: '#00FF87', eyeShape: 'happy' },
  NEUTRAL:      { colorTop: '#4A90D9', colorBottom: '#2C5F8A', glow: '#4A90D9', eyeShape: 'neutral' },
  JUDGING:      { colorTop: '#FF8C42', colorBottom: '#E06020', glow: '#FF8C42', eyeShape: 'judging' },
  EXCITED:      { colorTop: '#FFD166', colorBottom: '#E6A800', glow: '#FFD166', eyeShape: 'excited' },
  MOTIVATIONAL: { colorTop: '#00D4FF', colorBottom: '#0099CC', glow: '#00D4FF', eyeShape: 'neutral' },
}
```

#### Eyes (SVG inside body div)
5 eye shapes as inline SVG `<path>` variants:
- `happy`: curved upward arcs (^_^)
- `neutral`: simple circles
- `judging`: slanted/squinting lines
- `excited`: large wide open circles with highlight dot
- `motivational`: determined forward-looking circles

Eyes transition between shapes with CSS `opacity` crossfade when state changes.

#### Animations
All pure CSS `@keyframes`:
- `idle`: gentle float up/down 6px, 3s ease-in-out infinite
- `happy`: bouncy: scale(1) → scale(1.08) → scale(1), 0.5s ease, loops
- `excited`: rapid bounce + slight spin wobble, 0.4s, 3 loops then settles to idle
- `judging`: slow side-to-side tilt ±5deg, 2s, loops
- `motivational`: pulse glow, 1.5s infinite

State transitions: animate out (scale down, opacity 0), swap state, animate in (scale up, opacity 1) — 200ms.

#### Body symbols (optional but high impact)
When `HAPPY` or `EXCITED`: small `$` or `↑` symbol floats up from Finn's body and fades out.
Implementation: absolutely positioned `<span>` elements, CSS `@keyframes` float-up + fade, spawned via React state timeout.

### Finn Widget (floating bottom-right of dashboard)

`/client/src/features/finn/components/FinnWidget.tsx`
- Position: `position: fixed; bottom: calc(60px + var(--space-4)); right: var(--space-4); z-index: var(--z-finn)`
- Renders `<FinnCharacter state={finnState} />` (64px version)
- Tap opens `<FinnModal>`

### Finn Modal (`/client/src/features/finn/components/FinnModal.tsx`)
- Bottom sheet: slides up from bottom, overlay behind
- Contains: larger Finn character (96px) + message bubble + close button
- Message bubble: `Card` variant `"elevated"`, appears with typewriter effect (character-by-character, 30ms per char)
- State label: small badge showing current mood (e.g., "Feeling excited")

### Finn Tab Page (`/client/src/pages/Finn.tsx`)
Full page when "Finn" tab selected in bottom nav:
- Large Finn character (128px) centered at top
- Current state displayed with mood badge
- Current message in speech bubble below
- "Recent reactions" — last 5 `FinnEvent` records from DB as timeline
- Each event: state badge + message + relative timestamp

### `useFinn` Hook (`/client/src/hooks/useFinn.ts`)
```ts
export function useFinn() {
  const query = useQuery({
    queryKey: ['finn-state'],
    queryFn: () => api.get('/finn/state').then(r => r.data),
    staleTime: 60_000,  // 1 minute
  })
  return { state: query.data?.state, message: query.data?.message, isLoading: query.isLoading }
}
```

---

## Acceptance Criteria
- `GET /api/finn/state` returns correct state based on user's actual data
- State logic correctly identifies EXCITED for recent milestone, JUDGING for overspending
- Message interpolation fills in `{amount}`, `{n}` correctly
- FinnCharacter renders in all 5 states with correct colors
- State transitions animate (scale + opacity)
- `idle` float animation runs continuously
- `excited` state plays burst animation then settles
- Finn widget visible on Dashboard, opens modal on tap
- Finn page shows full character + recent event history
- Both dark and light mode work (CSS variables adjust the glow appropriately in light mode)
- Zero TypeScript errors
