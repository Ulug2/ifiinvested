# Vaulta — Product Document

> **Company:** Vaulta · **Mascot:** Finn  
> **Status:** Pre-MVP · Solo build · Target launch: 3–4 weeks  
> **Last updated:** June 2025

---

## Executive Summary

**Vaulta** is a habit-forming financial identity app for US beginners (18–24) that turns everyday spending into visible progress through simulated micro-investing, gamification, and **Finn** — an emotional companion mascot that guides the experience.

This is **not** an investing app at v1. It is a **habit-forming financial identity system** that makes users feel in control of money day-to-day. Real bank linking and brokerage integration come only after retention is proven.

**Tagline:** *Vaulta — meet Finn, your financial companion*

**One-line positioning:** Vaulta turns everyday spending into visible financial progress through habit-based micro-investing and emotional feedback loops — guided by Finn.

---

## 1. Product Identity

### Naming

| Role | Name | Notes |
|---|---|---|
| **Company / app** | **Vaulta** | Brand, legal entity (when formed), App Store listing |
| **Mascot** | **Finn** | Emotional companion, state engine, viral identity |
| IfIInvested | ❌ Rejected | Sounded like a simulation tool, not a behavior product |
| Echo | Deferred | May revisit for sub-features |

**Brand relationship:** Vaulta is the product users download and trust. Finn is the face of the experience — the character they bond with, share, and talk about.

### Brand Promise

Users should feel: *"I'm becoming better financially"* — not *"What's my balance?"*

### Competitive Frame

| We are NOT competing with | We ARE competing with |
|---|---|
| Robinhood, Acorns | TikTok attention, Duolingo-style habit apps |

**Differentiation from Acorns:** Acorns is invisible and passive. Vaulta is visible progress, identity ("Investor level"), emotional storytelling via Finn, and shareable outcomes.

---

## 2. Target User (v1)

| Dimension | Spec |
|---|---|
| **Age** | 18–24 primary (expand to 18–30 later) |
| **Geography** | US-only |
| **Experience** | Absolute beginners — no prior investing knowledge assumed |
| **Age gate** | 18+ only (even for simulated investing framing) |

### Core Pain (ranked)

1. *"I don't feel in control of money day-to-day."* ← **primary**
2. "I can't see progress fast enough"
3. "Finance apps feel boring and abstract"
4. "I don't build habits around saving/investing"

### Why US-only

- Plaid + Alpaca + ACH are US-optimized
- Simpler compliance for future phases
- Cleaner testing environment

---

## 3. Platform & MVP Scope

### Platform Decision

**Web MVP now → mobile later**

| Reason | Detail |
|---|---|
| Speed | Fastest iteration, no App Store friction |
| Debugging | Easier for fintech logic during solo build |
| Goals | Portfolio piece, investor demo, user validation |

Mobile (React Native / Expo) comes after web retention is validated.

### v1 Feature Matrix

#### MUST HAVE (v1 — ship in 3–4 weeks)

- [ ] User auth (email/password)
- [ ] Mock/seeded transactions (no real bank)
- [ ] Round-up engine (simulation)
- [ ] Virtual balance + simulated investment dashboard
- [ ] Gamification: XP, levels, streaks, milestones
- [ ] Finn mascot: scripted, state-based reactions
- [ ] Future wealth preview (7% annual projection)
- [ ] Dark-mode UI with consistent visual identity

#### NICE TO HAVE (v1.5)

- [ ] Social sharing cards (static images for TikTok/IG)
- [ ] Weekly recap generation

#### DO NOT BUILD YET

- Real Plaid integration
- Real investing (Alpaca / DriveWealth)
- LLM-powered Finn
- Push notifications
- In-app social feed
- Friends / leaderboards
- Mobile app
- Round-up multipliers
- Google / Apple Sign-In

### Resources

| Item | Value |
|---|---|
| Team | Solo builder |
| Hours/week | 15–25 |
| Budget | < $100/mo |
| Launch target | 3–4 weeks |

---

## 4. Core Money Mechanics (v1 — Simulation Only)

> **v1 rule:** No real money movement. Everything is virtual balance.

### Round-Up Rules

| Rule | v1 Spec |
|---|---|
| Round to | Nearest **$1** only |
| Multipliers | None |
| $5 / $10 round-up options | None |

**Example:** User spends $5.25 → round-up = $0.75

### Transaction Filtering

| Include | Exclude |
|---|---|
| Card purchases | Transfers |
| Debit transactions | Refunds |
| | Cash withdrawals |

### Investment Trigger

1. Round-ups accumulate in a **pending virtual balance**
2. When pending balance reaches **$5** → "commits" to simulated investment
3. Simulated purchase recorded against user's virtual portfolio

### Simulation Model

| Parameter | Value |
|---|---|
| Default instrument | VOO-like S&P 500 proxy |
| Annual return assumption | ~7% (for projections only) |
| Fractional shares | N/A in v1 |
| Disclaimers | Required — illustrative only, not financial advice |

### Real Money (Future — NOT v1)

When live investing ships later:

- Users need a **brokerage account** (custody via Alpaca / DriveWealth / Apex)
- Funding via **ACH** from linked checking
- App remains the **software/experience layer** — licensed partners hold money and execute trades

---

## 5. Gamification System

### XP Rules (v1)

| Action | XP |
|---|---|
| Daily app open | +5 |
| Round-up generated | +10 |
| Streak day (consecutive daily open) | +15 |
| Milestone hit | +50 |

### Levels

- Purely **cosmetic** in v1
- No feature unlocks yet
- Display: e.g. "Level 7 Investor" with XP bar

### Streak Definition

**Open app daily** — not tied to purchases (too restrictive early)

### Milestones (v1)

| Type | Threshold |
|---|---|
| Simulated invested | $10, $50, $100 |
| Streak | 3 days, 7 days |

### Celebration UX

- XP bar fill animation
- Gold highlight moments for milestones
- Finn state change on milestone (see §6)

---

## 6. Finn — Mascot System

### Identity

**Finn** = "System Cloud Entity" — a living financial companion, not a chatbot.

**Visual concept:**
- Semi-transparent ghost/blob made of pixels, data particles, glowing cloud fragments
- Big expressive OLED-style eyes with mood-based shapes
- Soft cloud/gel body, subtle glitchy edges, floating animation
- Dynamic symbols form on body: `$` (investing), `↑` (growth), `⚡` (streak), `🧠` (advice)

**One-line product definition:** *Vaulta is a gamified wealth-building app where your spending becomes a playable financial journey — guided by Finn.*

> Note: "AI companion" refers to the *character concept*. v1 uses scripted responses only.

### v1: Scripted Only (No LLM)

| Reason | Detail |
|---|---|
| Cost | LLM adds ongoing API expense |
| Safety | Unpredictable outputs in finance context |
| Focus | Emotion *timing* matters more than intelligence at MVP |

### State Engine (v1)

| State | Trigger |
|---|---|
| `happy` | Growth, streak active |
| `neutral` | No recent activity |
| `judging` | Overspending detected (week above average) |
| `excited` | Milestone hit |
| `motivational` | Streak start / comeback |

### Example Copy (tone reference)

| Event | Finn says |
|---|---|
| After round-up | "You just turned $0.75 into your future self's money. Good move." |
| Streak | "4 days in a row. This is how wealth habits are built." |
| Overspend | "This week's spending is higher than usual. Want a reset challenge?" |
| Milestone | "You just hit $50 invested. That's your first real wealth step." |

### Tone Rules

| ✅ Allowed | ❌ Not allowed |
|---|---|
| Playful | Shame-based language |
| Slightly roasty | Financial advice tone |
| Honest | Guilt-heavy messaging |
| Short (1–2 sentences) | Long lectures |

### UI Placement

1. **Home screen corner** — small animated character, mood-reactive
2. **Talk bubble moments** — only at key events (not always visible)
3. **Weekly recap** (v1.5) — Finn narrates progress as a story

### Animation (v1)

- **Lottie / simple JSON animations only**
- States needed: `idle`, `happy`, `neutral`, `judging`, `excited`, `motivational`
- No custom 3D or heavy animation in v1

### Virality Angle (future)

Users should describe it as: *"this little ghost tells me when I spend money"* — not *"it's a finance app"*

---

## 7. UX & Design Direction

### Design Philosophy

**Duolingo (habits) + Apple Health (progress) + TikTok (visual feedback)** — NOT a bank app.

Every screen answers: *"Am I becoming better financially?"*

### Visual Style

| Element | Spec |
|---|---|
| Background | Deep black / dark navy |
| Accents | Neon green / electric cyan |
| Milestones | Gold highlights |
| Typography | Bold, modern (Inter) — large numbers, minimal text |
| Motion | XP bar fills, glowing round-up animations, future value sliding forward |

### Avoid

- Charts everywhere as hero content
- Gray corporate fintech UI
- Spreadsheet-style transaction tables as main screen
- White bank-dashboard aesthetic

### Screen Map (v1)

| Screen | Purpose |
|---|---|
| **Onboarding** | Meet Finn → future wealth preview → demo round-up (see §8) |
| **Home** | Level/XP/streak (top) → future wealth timeline (hero) → activity feed (bottom) |
| **Investments** | "Wealth Garden" metaphor — visual growth, not portfolio tables |
| **Insights** (v1.5) | Swipe cards: "Starbucks $6.50 → $1,240 in 10 years" + share button |

### Home Layout

```
┌─────────────────────────────────┐
│  Level 7 Investor    🔥 6-day   │
│  ████████░░ XP bar              │
├─────────────────────────────────┤
│  Future You Timeline            │
│  Today → 1mo → 1yr → 5yr       │
│  $12.40 → $98 → $1,240 → $8,900│
│  (glowing path visualization)   │
├─────────────────────────────────┤
│  Activity Feed (not a table)    │
│  "Spent $5.25 → +$0.75 invested"│
│  "Unlocked Level 8 progress"    │
│                    [Finn 👻]    │
└─────────────────────────────────┘
```

### Design Execution (v1)

Ship **ugly-first but consistent** — no Figma-heavy process initially. Prioritize emotional hooks and motion over pixel perfection.

---

## 8. Onboarding Flow (Critical for Retention)

**Goal:** Hook emotionally in the first 30 seconds. No Plaid. No friction.

| Step | What happens |
|---|---|
| 1 | **Meet Finn** — character intro, personality hook |
| 2 | **Future wealth preview** — "See your future wealth if you keep spending like this" |
| 3 | **Demo round-up** — show a sample transaction → round-up animation |
| 4 | **Sign up** — email/password to save progress |

Skip bank connection entirely in v1.

---

## 9. Technical Architecture

### Stack (Confirmed)

| Layer | Choice |
|---|---|
| Frontend | React (Vite) |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | Email/password (JWT) — Google later |

### Hosting

| Service | Provider |
|---|---|
| Web frontend | Vercel |
| Backend API | Railway or Fly.io |
| Database | Supabase or Neon |

### System Layers (Current + Future)

```
┌─────────────────────────────────────┐
│  Layer 1: Vaulta (your app)         │
│  UI, round-up engine, gamification, │
│  Finn state engine, dashboards      │
├─────────────────────────────────────┤
│  Layer 2: Brokerage (FUTURE)        │
│  Alpaca / DriveWealth / Apex        │
│  Custody, trades, compliance        │
├─────────────────────────────────────┤
│  Layer 3: Bank linking (FUTURE)     │
│  Plaid — secure bank connection     │
└─────────────────────────────────────┘
```

### API Surface (v1)

| Endpoint area | Operations |
|---|---|
| Auth | signup, login, JWT refresh |
| Transactions | list mock transactions, seed demo data |
| Round-ups | calculate per transaction, pending balance |
| Investments | virtual portfolio summary, growth over time |
| Gamification | XP, level, streak, milestones |
| Finn | current state, trigger reaction for event |

### Backend Structure

```
controllers/ → routes/ → services/
```

Clean separation. Services hold business logic (round-up calc, XP rules, Finn state machine).

### Database Schema (v1)

```
Users
  id, email, passwordHash, xp, level, streakCount, lastActiveAt, createdAt

Transactions
  id, userId, amount, merchant, category, date, includedInRoundUp

RoundUps
  id, userId, transactionId, amount, status (pending | committed)

VirtualInvestments
  id, userId, amount, committedAt, simulatedValue

Milestones
  id, userId, type, threshold, achievedAt

FinnEvents
  id, userId, state, message, triggeredAt
```

Round-ups can alternatively be computed from transactions at read time; store explicitly if audit trail is needed.

### Analytics (MVP Success Tracking)

| Metric | Why |
|---|---|
| Signups | Top of funnel |
| D1 / D7 retention | Core habit signal |
| % reaching dashboard | Onboarding quality |
| Avg session time | Engagement depth |
| Return rate after 24h | Early retention proxy |

**3-month targets:**

| Metric | Target |
|---|---|
| Users | 500–2,000 |
| D7 retention | 20–30% |
| 3+ session users | 30–40% |
| Shareable cards | Organic creation (v1.5) |
| Portfolio/demo | One strong showcase piece |

---

## 10. Build Roadmap

### Phase 1 — Foundation (Week 1)

- [ ] Project scaffold: React (Vite) + Express + Prisma + PostgreSQL
- [ ] Auth: signup, login, JWT
- [ ] User model with XP/level/streak fields
- [ ] Mock transaction seeder
- [ ] Round-up calculation service

### Phase 2 — Core Experience (Week 2)

- [ ] Dashboard: transactions + round-ups + virtual balance
- [ ] Pending → committed flow at $5 threshold
- [ ] Simulated portfolio with 7% growth projection
- [ ] Future wealth timeline component
- [ ] Activity feed (narrative style, not table)

### Phase 3 — Finn + Gamification (Week 3)

- [ ] Finn state engine (5 states)
- [ ] Scripted message library per state/event
- [ ] Lottie animations per state
- [ ] XP accrual + level display
- [ ] Streak tracking (daily open)
- [ ] Milestone detection + celebrations

### Phase 4 — Onboarding + Polish (Week 4)

- [ ] Onboarding flow (Finn intro → preview → demo → signup)
- [ ] Dark theme applied consistently
- [ ] Disclaimers on simulated data
- [ ] Analytics instrumentation
- [ ] Deploy to Vercel + Railway

### Phase 5 — v1.5 (Post-launch)

- [ ] Static share cards (weekly recap images)
- [ ] Insight swipe cards
- [ ] Anonymous percentile ("top 18% of builders")

### Phase 6 — Validation Gate (Before real money)

**Do not proceed until:**
- D7 retention ≥ 20%
- Users returning 3+ times ≥ 30%
- Qualitative signal: users describe Finn unprompted

### Phase 7 — Real Fintech (Much later)

1. Plaid sandbox → production (bank linking)
2. KYC via Persona / Stripe Identity
3. Alpaca / DriveWealth sandbox → live brokerage
4. ACH funding flow
5. Terms of service, privacy policy, compliance review
6. LLC formation

### Phase 8 — Mobile (After web validation)

- React Native (Expo) port
- Push notifications for streaks
- App Store / Play Store launch

---

## 11. Business & Legal

| Topic | v1 Decision |
|---|---|
| Monetization | None — prove retention first |
| Legal entity | No LLC required for MVP; form when traction appears |
| Compliance | Software layer only — partners handle custody when live |
| Licenses | None needed while no real money moves |
| Disclaimers | Simulated data is illustrative, not financial advice |
| KYC/AML | Not required until real investing |

### Future Monetization Options (not v1)

- Subscription ($X/month)
- AUM-based fee
- Freemium with premium gamification features

---

## 12. Risks & Mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| **Retention** — users try once, leave | 🔴 High | Onboarding hook, Finn emotional loops; notifications + social in v1.5+ |
| Attention competition (TikTok) | 🔴 High | Shareable cards, roasty Finn content, identity system |
| Finn feels like decoration | 🟡 Medium | State engine tied to real behavior events; rare meaningful interactions |
| Scope creep | 🟡 Medium | Strict v1 cut list (see §13) |
| Regulation (future) | 🟢 Low for v1 | No real money = no brokerage compliance yet |

### Biggest Honest Risk

People will try it, think it's cool, and stop. The solution is deeper habit loops (notifications, social pressure, challenges) — but only **after** core loop is validated.

---

## 13. Explicitly Out of Scope (v1)

- Plaid / real bank linking
- Alpaca / DriveWealth / real investing
- LLM-powered Finn
- Push notifications
- In-app social feed
- Friends / leaderboards
- Round-up multipliers
- Mobile app
- Google / Apple Sign-In
- Real money movement of any kind

---

## 14. What to Build Right Now

> **Focus mantra:** Finn state engine + mock transactions + XP system + future wealth preview + simple dashboard. Everything else is distraction.

### Minimum shippable core

1. User signs up and meets Finn
2. Sees mock spending with round-ups calculated
3. Watches virtual balance grow toward $5 commits
4. Earns XP, maintains streak, hits milestones
5. Finn reacts emotionally to their behavior
6. Sees projected future wealth on a timeline

If this loop is fun and repeatable, everything else can be layered on.

---

## Appendix A: Fintech Infrastructure Reference (Future Phases)

### Bank Linking — Plaid

1. User taps "Connect Bank"
2. Plaid popup → user logs into their bank
3. App receives transaction data + account token
4. App never sees bank password

### Brokerage Partners

| Provider | Role |
|---|---|
| Alpaca | Broker API, fractional shares |
| DriveWealth | Full brokerage infrastructure |
| Apex Clearing | Custody + settlement |

App responsibilities: UI, round-up engine, user experience.  
Partner responsibilities: money custody, trade execution, SEC/FINRA compliance.

### Money Flow (Live — Future)

```
Purchase ($5.25)
  → Round-up calculated ($0.75)
  → Pending virtual balance accumulates
  → At $5 threshold → ACH pull from checking
  → Broker receives funds → buys VOO fractional shares
  → User sees growth in portfolio
```

### Partner Onboarding Path

1. Apply via developer portal (Alpaca, DriveWealth, etc.)
2. Describe product: micro-investing app for Gen Z, round-up model
3. Get sandbox API keys
4. Integrate KYC flow (Persona / Stripe Identity)
5. Go live with real users after compliance review

---

## Appendix B: Original Brainstorm Insights (Preserved)

Key ideas from early brainstorming that inform long-term vision:

- **Winning version is not "round-up investing app"** — it's an automatic money habit engine that eventually invests
- **Insight screen** = TikTok engine inside the app (swipe cards with dramatic comparisons)
- **Wealth Garden** metaphor for investments screen (plants/trees growing, not tables)
- **Weekly Wealth Recap Cards** = primary viral growth engine
- **Finn originality** — ghost/cloud finance mascot tied to behavior + AI personality is a genuine gap in the market
- **Robinhood / Acorns path** — experience layer on licensed infrastructure, not becoming a bank

---

## Appendix C: Copilot Scaffold Prompt (Reference)

Use this to bootstrap the codebase structure:

```
Build a full-stack MVP for a fintech-style web application called "Vaulta".

The app helps users visualize and track wealth building through automated
spending round-ups and simulated investing. Finn is the mascot companion.

Core Features (MVP):
- User authentication (sign up / login / JWT)
- Dashboard: transactions, round-ups, virtual invested balance
- Mock/seeded transactions (no Plaid)
- Simulated investment dashboard with 7% annual growth projection
- XP, levels, streaks, milestones
- Finn mascot with state-based scripted reactions

Tech Stack:
- Frontend: React (Vite)
- Backend: Node.js + Express
- Database: PostgreSQL + Prisma

Constraints:
- NO real banking, Plaid, or brokerage APIs
- Modular architecture for future fintech integration
- Dark theme UI
```

---

*Document owner: solo founder · Company: Vaulta · Repo: `ifiinvested` (rename to `vaulta` when ready)*
