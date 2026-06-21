import { useAuthStore } from '@/features/auth/auth.store'
import { useTheme } from '@/hooks/useTheme'
import { useRoundUpSummary } from '@/features/dashboard/hooks/useRoundUpSummary'
import { useProjection } from '@/features/investments/hooks/useProjection'
import { usePortfolio } from '@/features/investments/hooks/usePortfolio'
import { useCommitRoundUp } from '@/features/dashboard/hooks/useCommitRoundUp'
import { ActivityFeed } from '@/features/dashboard/components/ActivityFeed'
import { Card } from '@/components/Card'
import { ProgressBar } from '@/components/ProgressBar'
import { Stat } from '@/components/Stat'
import { BottomNav } from '@/components/BottomNav'
import s from './Dashboard.module.css'

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtValue(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1000) return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  if (n >= 100) return `$${n.toFixed(0)}`
  return `$${n.toFixed(2)}`
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-label="Switch to light mode">
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-label="Switch to dark mode">
      <path fill="currentColor" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

// ── Sub-sections ─────────────────────────────────────────────────────────────

// The 4 timeline points shown on the dashboard (out of 6 total from API)
const TIMELINE_INDICES = [0, 1, 3, 4] as const

function FutureWealthTimeline() {
  const { data } = useProjection()

  const points = data
    ? TIMELINE_INDICES.map((i) => data[i]).filter(Boolean)
    : null

  const valueClasses = [s['today'], s['future1'], s['future2'], s['future3']]

  return (
    <>
      <p className={s.timelineHeader}>Your Future Wealth</p>
      <div className={s.timelineWrap}>
        <div className={s.timelineLine} />
        <div className={s.timelinePoints}>
          {points
            ? points.map((pt, i) => (
                <div key={pt.label} className={s.timelinePoint}>
                  <span className={s.timelineLabel}>{pt.label}</span>
                  <div className={`${s.timelineDot}${i === 0 ? ` ${s.today}` : ''}`} />
                  <span className={`${s.timelineValue} ${valueClasses[i] ?? ''}`}>
                    {fmtValue(pt.value)}
                  </span>
                </div>
              ))
            : TIMELINE_INDICES.map((i) => (
                <div key={i} className={s.timelinePoint}>
                  <span className={s.timelineLabel}>—</span>
                  <div className={s.timelineDot} />
                  <span className={s.timelineValue} />
                </div>
              ))}
        </div>
      </div>
      <p className={s.timelineDisclaimer}>*Projected at 7% annual return. Not financial advice.</p>
    </>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { theme, toggleTheme } = useTheme()
  const { data: roundup } = useRoundUpSummary()
  const { data: portfolio } = usePortfolio()
  const commitMutation = useCommitRoundUp()

  const xp = user?.xp ?? 0
  const level = user?.level ?? 1
  const streak = user?.streakCount ?? 0
  const nextLevelXP = level * 100 + 100
  const xpPercent = Math.min(100, (xp / nextLevelXP) * 100)
  const initial = (user?.email?.[0] ?? 'U').toUpperCase()

  const commitProgress = roundup?.commitProgress ?? 0
  const pendingBalance = roundup?.pendingBalance ?? 0
  const canInvest = pendingBalance >= 5

  return (
    <div className={s.page}>
      {/* ── Header ── */}
      <header className={s.header}>
        <div className={s.headerInner}>
          <span className={s.logo}>Vaulta</span>
          <div className={s.headerActions}>
            <button className={s.iconBtn} onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
            <div className={s.avatar}>{initial}</div>
          </div>
        </div>
      </header>

      {/* ── Scrollable content ── */}
      <main className={s.main}>

        {/* Section 2 — Identity */}
        <Card variant="elevated" glow="green">
          <div className={s.identityCard}>
            <div className={s.identityTop}>
              <span className={s.levelBadge}>Level {level} Investor</span>
              {streak > 0 && (
                <span className={s.streakBadge}>🔥 {streak} day{streak !== 1 ? 's' : ''}</span>
              )}
            </div>
            <div>
              <div className={s.xpRow}>
                <span className={s.xpLabel}>XP Progress</span>
                <span className={s.xpValue}>{xp} / {nextLevelXP} XP</span>
              </div>
              <ProgressBar value={xpPercent} color="green" animated />
            </div>
          </div>
        </Card>

        {/* Section 3 — Future Wealth */}
        <Card variant="glass" glow="cyan">
          <FutureWealthTimeline />
        </Card>

        {/* Section 4 — Round-Up Progress */}
        <Card variant="default">
          <div className={s.roundupHeader}>
            <span className={s.roundupTitle}>Pending Round-Ups</span>
            <span className={s.roundupBalance}>
              ${pendingBalance.toFixed(2)} of $5.00
            </span>
          </div>
          <ProgressBar value={commitProgress} color="green" animated />
          {canInvest ? (
            <button
              className={s.investBtn}
              disabled={commitMutation.isPending}
              onClick={() => commitMutation.mutate()}
            >
              {commitMutation.isPending ? 'Investing…' : 'Ready to invest! →'}
            </button>
          ) : (
            <p className={s.roundupSub}>
              ${(roundup?.nextCommitAt ?? 5).toFixed(2)} away from your next investment
            </p>
          )}
        </Card>

        {/* Section 5 — Activity Feed */}
        <section>
          <div className={s.sectionHeader}>
            <h2 className={s.sectionTitle}>Recent Activity</h2>
            <a className={s.seeAll} href="/activity">See all →</a>
          </div>
          <ActivityFeed limit={10} />
        </section>

        {/* Section 6 — Quick Stats */}
        <div className={s.statsGrid}>
          <Card variant="default" padding="sm">
            <Stat
              label="Invested"
              value={`$${(portfolio?.totalInvested ?? 0).toFixed(2)}`}
            />
          </Card>
          <Card variant="default" padding="sm">
            <Stat
              label="All-Time Gain"
              value={`$${(portfolio?.allTimeGain ?? 0).toFixed(2)}`}
              delta={portfolio ? `${portfolio.allTimeGainPct >= 0 ? '+' : ''}${portfolio.allTimeGainPct.toFixed(1)}%` : undefined}
              deltaType={
                !portfolio ? 'neutral'
                  : portfolio.allTimeGain >= 0 ? 'positive' : 'negative'
              }
            />
          </Card>
          <Card variant="default" padding="sm">
            <Stat
              label="Round-Ups"
              value={String(roundup?.totalTransactions ?? 0)}
            />
          </Card>
        </div>

      </main>

      <BottomNav />
    </div>
  )
}
