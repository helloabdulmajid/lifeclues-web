import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { BookOpen, LogOut, MailQuestion, UserRound } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { authApi } from '../api/client'
import { ApiError } from '../api/http'
import Logo from './Logo'
import AppearanceMenu from '../theme/AppearanceMenu'

export default function AppShell() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [resend, setResend] = useState({ state: 'idle', message: '' })

  const handleLogout = async () => {
    await logout()
    navigate('/', { replace: true })
  }

  const handleResend = async () => {
    if (!user?.email) return
    setResend({ state: 'sending', message: '' })
    try {
      await authApi.resendVerification(user.email)
      setResend({ state: 'done', message: 'Fresh link sent — check your inbox.' })
    } catch (err) {
      setResend({
        state: 'error',
        message:
          err instanceof ApiError ? err.message : 'Something went wrong. Please try again.',
      })
    }
  }

  const needsVerification = user && !user.emailVerified

  const linkClass = ({ isActive }) =>
    [
      'inline-flex size-10 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors sm:size-auto sm:rounded-soft sm:px-3 sm:py-2',
      isActive ? 'bg-accent-soft text-accent' : 'text-ink-soft hover:bg-surface-2 hover:text-ink',
    ].join(' ')

  return (
    <div className="min-h-dvh bg-paper">
      <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur lc-themed">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-2 px-3 sm:gap-3 sm:px-6">
          <NavLink to="/app" aria-label="LifeClues home">
            <Logo size="sm" compact />
          </NavLink>

          <nav className="flex items-center gap-1">
            <NavLink to="/app" className={linkClass}>
              <BookOpen className="size-5 sm:size-4" aria-hidden />
              <span className="hidden sm:inline">Journal</span>
            </NavLink>
            <NavLink to="/app/profile" className={linkClass}>
              <UserRound className="size-5 sm:size-4" aria-hidden />
              <span className="hidden sm:inline">Profile</span>
            </NavLink>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <AppearanceMenu />
            <button
              type="button"
              onClick={handleLogout}
              title="Sign out"
              aria-label="Sign out"
              className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
            >
              <LogOut className="size-5" />
            </button>
          </div>
        </div>
      </header>

      {needsVerification && (
        <div className="border-b border-line bg-accent-soft/60">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-3 gap-y-2 px-3 py-3 sm:px-6">
            <MailQuestion className="size-5 shrink-0 text-accent" aria-hidden />
            <p className="min-w-0 flex-1 text-sm leading-snug text-ink">
              Once you confirm your email, you can start keeping your book.
            </p>
            {resend.state === 'done' ? (
              <p className="text-sm font-medium text-accent">{resend.message}</p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resend.state === 'sending'}
                className="text-sm font-semibold text-accent transition-colors hover:underline disabled:opacity-60"
              >
                {resend.state === 'sending' ? 'Sending…' : 'Send confirmation email'}
              </button>
            )}
          </div>
          {resend.state === 'error' && (
            <p className="mx-auto max-w-5xl px-3 pb-3 text-sm text-danger sm:px-6">
              {resend.message}
            </p>
          )}
        </div>
      )}

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <Outlet />
      </main>
    </div>
  )
}