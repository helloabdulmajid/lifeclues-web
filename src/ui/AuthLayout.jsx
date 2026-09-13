import { Link } from 'react-router-dom'
import { BookOpenText } from 'lucide-react'
import AppearanceMenu from '../theme/AppearanceMenu'

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-3 py-5 sm:px-6">
        <Link to="/" aria-label="Back to LifeClues home">
          <span className="inline-flex items-center gap-2.5">
            <span
              className="flex size-6 items-center justify-center rounded-soft bg-accent text-accent-ink shadow-soft"
              aria-hidden
            >
              <BookOpenText className="size-6" />
            </span>
            <span className="hidden font-display text-2xl font-semibold tracking-tight text-ink sm:inline">
              LifeClues
            </span>
          </span>
        </Link>
        <AppearanceMenu />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-16 sm:px-6">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
              {title}
            </h1>
            {subtitle && <p className="mt-2 text-ink-soft">{subtitle}</p>}
          </div>
          <div className="rounded-card border border-line bg-surface p-6 shadow-card sm:p-8 lc-themed">
            {children}
          </div>
          {footer && <div className="mt-5 text-center text-sm text-ink-soft">{footer}</div>}
        </div>
      </main>
    </div>
  )
}