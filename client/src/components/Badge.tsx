import { type HTMLAttributes } from 'react'
import clsx from 'clsx'
import s from './Badge.module.css'

type Variant = 'success' | 'warning' | 'info' | 'neutral'
type Size = 'sm' | 'md'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant
  size?: Size
}

export function Badge({ variant = 'neutral', size = 'md', className, children, ...rest }: BadgeProps) {
  return (
    <span className={clsx(s.badge, s[variant], s[size], className)} {...rest}>
      {children}
    </span>
  )
}
