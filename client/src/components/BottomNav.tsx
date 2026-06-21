import { useNavigate, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import s from './BottomNav.module.css'

const TABS = [
  {
    label: 'Home',
    path: '/dashboard',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M3 12L12 3l9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 12v9h18v-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: 'Invest',
    path: '/investments',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="16 7 22 7 22 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: 'Finn',
    path: '/finn',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
        <path d="M8 14c-3 1-5 3-5 5h18c0-2-2-4-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M15 8c1-1 3-.5 3 1.5s-2 3-3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
] as const

export function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav className={s.nav} aria-label="Main navigation">
      <div className={s.inner}>
        {TABS.map(({ label, path, icon }) => {
          const active = pathname === path
          return (
            <button
              key={path}
              className={clsx(s.tab, active && s.active)}
              onClick={() => navigate(path)}
              aria-current={active ? 'page' : undefined}
            >
              {icon}
              <span className={s.label}>{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
