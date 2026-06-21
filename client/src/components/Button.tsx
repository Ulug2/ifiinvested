import { type ButtonHTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'
import s from './Button.module.css'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  full?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, full = false, disabled, children, className, ...rest }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(s.btn, s[variant], s[size], full && s.full, className)}
      {...rest}
    >
      {loading ? <span className={s.spinner} aria-hidden /> : children}
    </button>
  )
)

Button.displayName = 'Button'
