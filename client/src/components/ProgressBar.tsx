import clsx from 'clsx'
import s from './ProgressBar.module.css'

type Color = 'green' | 'cyan' | 'gold'

interface ProgressBarProps {
  value: number
  color?: Color
  animated?: boolean
  label?: string
  className?: string
}

export function ProgressBar({ value, color = 'green', animated = false, label, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className={clsx(s.wrapper, s[color], className)}>
      {label && (
        <div className={s.label}>
          <span>{label}</span>
          <span>{Math.round(clamped)}%</span>
        </div>
      )}
      <div className={s.track} role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
        <div className={clsx(s.fill, animated && s.animated)} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  )
}
