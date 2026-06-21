import { type InputHTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'
import s from './Input.module.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...rest }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className={clsx(s.wrapper, error && s.error, className)}>
        {label && <label className={s.label} htmlFor={inputId}>{label}</label>}
        <input ref={ref} id={inputId} className={s.input} {...rest} />
        {error && <span className={s.errorText}>{error}</span>}
      </div>
    )
  }
)

Input.displayName = 'Input'
