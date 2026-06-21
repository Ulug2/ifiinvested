import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { useTheme } from '@/hooks/useTheme'
import { useAuthStore } from '@/features/auth/auth.store'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import LoginPage from '@/pages/Login'
import SignupPage from '@/pages/Signup'
import DashboardPage from '@/pages/Dashboard'
import InvestmentsPage from '@/pages/Investments'
import FinnPage from '@/pages/Finn'
import OnboardingPage from '@/pages/Onboarding'
import DevPage from '@/pages/Dev'

function AppRoutes() {
  useTheme()
  const { initialize, user, isLoading } = useAuthStore()

  useEffect(() => { initialize() }, [initialize])

  return (
    <Routes>
      <Route
        path="/"
        element={
          isLoading ? null : <Navigate to={user ? '/dashboard' : '/login'} replace />
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/dev" element={<DevPage />} />
      <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/investments" element={<ProtectedRoute><InvestmentsPage /></ProtectedRoute>} />
      <Route path="/finn" element={<ProtectedRoute><FinnPage /></ProtectedRoute>} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
