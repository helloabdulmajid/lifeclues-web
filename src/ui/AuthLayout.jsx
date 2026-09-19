import { Link } from 'react-router-dom'
import BrandLockup from './BrandLockup'
import {
  BotanicalSprig,
  FlowerDoodle,
  MountainDoodle,
  SunDoodle,
} from '../pages/landing/art'

export default function AuthLayout({ title, subtitle, eyebrow, children, footer }) {
  return (
    <div className="landing flex min-h-dvh flex-col bg-lnd-paper paper-texture text-lnd-ink">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 py-5 sm:px-6">
        <Link to="/" aria-label="Back to LifeClues home" className="rounded-soft">
          <BrandLockup />
        </Link>
        <span className="hidden font-plxmono text-[10px] uppercase tracking-[0.2em] text-lnd-faint sm:block">
          small clues · big memories
        </span>
      </header>

      <main className="relative flex flex-1 items-center justify-center px-4 pb-16 sm:px-6">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <MountainDoodle className="absolute left-4 top-8 w-24 text-lnd-line sm:left-10 sm:top-12 sm:w-32" />
          <SunDoodle className="absolute right-4 top-10 size-9 text-lnd-sienna sm:right-12 sm:top-16 sm:size-11" />
          <FlowerDoodle className="absolute bottom-10 left-8 size-10 sm:bottom-16 sm:left-14 sm:size-12" />
          <BotanicalSprig className="absolute bottom-8 right-8 w-12 text-lnd-mut sm:bottom-12 sm:right-12 sm:w-16" />
        </div>

        <div className="relative w-full max-w-md">
          <div className="mb-7 text-center">
            {eyebrow && (
              <p className="font-plxmono text-xs uppercase tracking-[0.24em] text-lnd-sienna">
                {eyebrow}
              </p>
            )}
            <h1 className="mt-3 font-caveat text-5xl leading-[0.95] text-lnd-ink">{title}</h1>
            {subtitle && <p className="mt-3 text-[15px] leading-relaxed text-lnd-mut">{subtitle}</p>}
          </div>

          <div className="rounded-3xl border border-lnd-line bg-lnd-card p-6 shadow-[0_18px_40px_-18px_rgba(33,27,17,0.22)] sm:p-8">
            {children}
          </div>

          {footer && (
            <div className="mt-5 text-center text-sm text-lnd-mut">
              {footer}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}