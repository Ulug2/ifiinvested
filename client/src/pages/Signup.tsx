import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { useAuthStore } from '@/features/auth/auth.store'
import s from '@/features/auth/Auth.module.css'

export default function SignupPage() {
  const navigate = useNavigate()
  const { signup, isLoading, error, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const passwordStrength = password.length >= 8 ? 100 : (password.length / 8) * 100

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    clearError()
    try {
      await signup(email, password)
      navigate('/onboarding', { replace: true })
    } catch {
      // error displayed via store
    }
  }

  return (
    <div className={s.page}>
      <div className={s.container}>
        <div className={s.brand}>
          <span className={s.logo}>Vaulta</span>
          <span className={s.tagline}>Start your wealth journey</span>
        </div>

        <Card variant="elevated" padding="lg">
          <div className={s.card}>
            <h1 className={s.heading}>Create account</h1>

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

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  required
                />
                {password.length > 0 && (
                  <>
                    <div className={s.strengthTrack}>
                      <div className={s.strengthFill} style={{ width: `${passwordStrength}%` }} />
                    </div>
                    <span className={s.strengthLabel}>
                      {password.length >= 8 ? 'Strong enough' : `${8 - password.length} more characters`}
                    </span>
                  </>
                )}
              </div>

              {error && <p className={s.errorBanner}>{error}</p>}

              <Button
                type="submit"
                variant="primary"
                full
                loading={isLoading}
                disabled={password.length < 8}
              >
                Create account
              </Button>
            </form>

            <p className={s.footer}>
              Already have an account?{' '}
              <Link to="/login" className={s.link}>
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
