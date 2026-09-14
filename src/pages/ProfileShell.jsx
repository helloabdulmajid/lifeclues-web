import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

const tabClass = ({ isActive }) =>
  [
    'inline-flex items-center gap-2 rounded-soft px-4 py-2 text-sm font-semibold transition-colors',
    isActive ? 'bg-accent-soft text-accent' : 'text-ink-soft hover:bg-surface-2 hover:text-ink',
  ].join(' ')

export default function ProfileShell() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className="mx-auto max-w-2xl">
      <nav className="mb-6 flex w-fit gap-1 rounded-soft border border-line bg-surface p-1 lc-themed">
        <NavLink to="/app/profile" end className={tabClass}>
          About
        </NavLink>
        <NavLink to="/app/profile/appearance" className={tabClass}>
          Appearance
        </NavLink>
        <NavLink to="/app/profile/security" className={tabClass}>
          Security
        </NavLink>
      </nav>
      <Outlet />
      <div className="mt-8 border-t border-line pt-6">
        <button
          type="button"
          onClick={() => navigate('/app', { state: { openTrash: true } })}
          className="inline-flex items-center gap-2 text-sm text-ink-faint transition-colors hover:text-ink"
        >
          <Trash2 className="size-4" aria-hidden />
          Trash
        </button>
      </div>
    </div>
  )
}