import clsx from 'clsx'
import s from './Stat.module.css'

type DeltaType = 'positive' | 'negative' | 'neutral'

interface StatProps {
  label: string
  value: string
  delta?: string
  deltaType?: DeltaType
  className?: string
}

export function Stat({ label, value, delta, deltaType = 'neutral', className }: StatProps) {
  return (
    <div className={clsx(s.stat, className)}>
      <span className={s.label}>{label}</span>
      <span className={s.value}>{value}</span>
      {delta && <span className={clsx(s.delta, s[deltaType])}>{delta}</span>}
    </div>
  )
}
