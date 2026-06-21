import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { useAuthStore } from '@/features/auth/auth.store'
import s from '@/features/auth/Auth.module.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    clearError()
    try {
      await login(email, password)
      navigate('/dashboard', { replace: true })
    } catch {
      // error displayed via store
    }
  }

  return (
    <div className={s.page}>
      <div className={s.container}>
        <div className={s.brand}>
          <span className={s.logo}>Vaulta</span>
          <span className={s.tagline}>Meet Finn, your financial companion</span>
        </div>

        <Card variant="elevated" padding="lg">
          <div className={s.card}>
            <h1 className={s.heading}>Welcome back</h1>

            <form className={s.form} onSubmit={handleSubmit} noValidate>
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />

              {error && <p className={s.errorBanner}>{error}</p>}

              <Button type="submit" variant="primary" full loading={isLoading}>
                Sign in
              </Button>
            </form>

            <p className={s.footer}>
              No account?{' '}
              <Link to="/signup" className={s.link}>
                Start with Finn →
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
