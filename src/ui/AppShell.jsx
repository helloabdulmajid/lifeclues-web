import { NavLink, Outlet } from 'react-router-dom'
import { UserRound } from 'lucide-react'
import Logo from './Logo'

export default function AppShell() {
  return (
    <div className="min-h-dvh bg-paper">
      <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur lc-themed">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-2 px-3 sm:gap-3 sm:px-6">
          <NavLink to="/app" aria-label="LifeClues home">
            <Logo size="sm" compact />
          </NavLink>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <NavLink
              to="/app/profile"
              className="inline-flex size-10 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink"
              title="Profile"
            >
              <UserRound className="size-5" aria-hidden />
            </NavLink>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <Outlet />
      </main>
    </div>
  )
}
