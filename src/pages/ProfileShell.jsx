import { NavLink, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const tabClass = ({ isActive }) =>
  [
    'inline-flex items-center gap-2 rounded-soft px-4 py-2 text-sm font-semibold transition-colors',
    isActive ? 'bg-accent-soft text-accent' : 'text-ink-soft hover:bg-surface-2 hover:text-ink',
  ].join(' ')

export default function ProfileShell() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <>
      <nav className="mb-6 flex w-fit gap-1 rounded-soft border border-line bg-surface p-1 lc-themed">
        <NavLink to="/app/profile" end className={tabClass}>
          About
        </NavLink>
        <NavLink to="/app/profile/security" className={tabClass}>
          Security
        </NavLink>
      </nav>
      <Outlet />
    </>
  )
}