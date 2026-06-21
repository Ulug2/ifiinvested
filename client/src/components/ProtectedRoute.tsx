import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/auth.store'
import s from './ProtectedRoute.module.css'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, token, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className={s.spinner}>
        <span className={s.logo}>Vaulta</span>
        <div className={s.ring} />
      </div>
    )
  }

  if (!token || !user) return <Navigate to="/login" replace />

  return <>{children}</>
}
