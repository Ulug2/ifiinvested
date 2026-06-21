import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { ProgressBar } from '@/components/ProgressBar'
import { Stat } from '@/components/Stat'
import { useTheme } from '@/hooks/useTheme'
import s from './Dev.module.css'

export default function DevPage() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className={s.page}>
      <header className={s.header}>
        <span className={s.logo}>Vaulta</span>
        <Button variant="ghost" size="sm" onClick={toggleTheme}>
          {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </Button>
      </header>

      <section className={s.section}>
        <h2 className={s.sectionTitle}>Buttons</h2>
        <div className={s.row}>
          <Button variant="primary" size="sm">Small</Button>
          <Button variant="primary" size="md">Primary</Button>
          <Button variant="primary" size="lg">Large</Button>
        </div>
        <div className={s.row}>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="primary" loading>Loading</Button>
          <Button variant="primary" disabled>Disabled</Button>
        </div>
        <Button variant="primary" full>Full Width</Button>
      </section>

      <section className={s.section}>
        <h2 className={s.sectionTitle}>Cards</h2>
        <Card variant="default" padding="md">
          <p>Default card</p>
        </Card>
        <Card variant="elevated" glow="green" padding="md">
          <p>Elevated + green glow</p>
        </Card>
        <Card variant="glass" glow="cyan" padding="md">
          <p>Glass + cyan glow</p>
        </Card>
        <Card variant="elevated" glow="gold" padding="md">
          <p>Elevated + gold glow</p>
        </Card>
      </section>

      <section className={s.section}>
        <h2 className={s.sectionTitle}>Badges</h2>
        <div className={s.row}>
          <Badge variant="success">Invested</Badge>
          <Badge variant="warning">Streak</Badge>
          <Badge variant="info">Active</Badge>
          <Badge variant="neutral">Level 7</Badge>
        </div>
        <div className={s.row}>
          <Badge variant="success" size="sm">sm</Badge>
          <Badge variant="warning" size="sm">sm</Badge>
          <Badge variant="info" size="sm">sm</Badge>
        </div>
      </section>

      <section className={s.section}>
        <h2 className={s.sectionTitle}>Progress Bars</h2>
        <ProgressBar value={68} color="green" animated label="XP Progress" />
        <ProgressBar value={42} color="cyan" animated label="Commit Progress" />
        <ProgressBar value={85} color="gold" label="Milestone" />
        <ProgressBar value={100} color="green" animated label="Complete" />
      </section>

      <section className={s.section}>
        <h2 className={s.sectionTitle}>Stats</h2>
        <div className={s.statGrid}>
          <Stat label="Total Invested" value="$47.25" delta="+$0.82" deltaType="positive" />
          <Stat label="All-Time Gain" value="+1.7%" delta="+0.3%" deltaType="positive" />
          <Stat label="Transactions" value="45" />
        </div>
      </section>

      <section className={s.section}>
        <h2 className={s.sectionTitle}>Typography</h2>
        <div className={s.typeStack}>
          <p style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 'var(--font-weight-black)', color: 'var(--color-accent-green)' }}>$48,920</p>
          <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>Level 7 Investor</p>
          <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>Your Future Wealth</p>
          <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)' }}>Round-ups grow into real investments over time.</p>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Simulated at 7% annual return. Not financial advice.</p>
        </div>
      </section>

      <section className={s.section}>
        <h2 className={s.sectionTitle}>Color Palette</h2>
        <div className={s.swatchGrid}>
          {([
            ['--color-accent-green', 'Green'],
            ['--color-accent-cyan', 'Cyan'],
            ['--color-gold', 'Gold'],
            ['--color-error', 'Error'],
            ['--color-bg-primary', 'BG Primary'],
            ['--color-bg-secondary', 'BG Secondary'],
            ['--color-bg-card', 'Card'],
            ['--color-bg-elevated', 'Elevated'],
          ] as [string, string][]).map(([token, name]) => (
            <div key={token} className={s.swatch}>
              <div className={s.swatchColor} style={{ background: `var(${token})` }} />
              <span className={s.swatchLabel}>{name}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
