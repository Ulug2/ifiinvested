import { type HTMLAttributes } from 'react'
import clsx from 'clsx'
import s from './Card.module.css'

type Variant = 'default' | 'elevated' | 'glass'
type Glow = 'green' | 'cyan' | 'gold'
type Padding = 'sm' | 'md' | 'lg'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant
  glow?: Glow
  padding?: Padding
}

export function Card({ variant = 'default', glow, padding = 'md', className, children, ...rest }: CardProps) {
  return (
    <div
      className={clsx(
        s.card,
        s[variant],
        s[`pad-${padding}`],
        glow && s[`glow-${glow}`],
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
