import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import BrandLockup from '../../ui/BrandLockup'

const NAV = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'About', href: '#about' },
]

function LandingLogo() {
  return (
    <a href="#home" className="rounded-soft">
      <BrandLockup />
    </a>
  )
}

export default function LandingHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-lnd-line bg-lnd-paper/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <LandingLogo />

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((n) => (
            <a
              key={n.label}
              href={n.href}
              className="text-sm font-medium text-lnd-mut transition-colors hover:text-lnd-ink"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2.5 md:flex">
          <Link
            to="/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-lnd-mut transition-colors hover:text-lnd-ink"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center gap-2.5 rounded-full bg-lnd-indigo px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-lnd-indigo-hover"
          >
            <span
              className="size-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: '#b4501e' }}
              aria-hidden
            />
            Get Started
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="flex size-10 items-center justify-center rounded-full border border-lnd-line bg-lnd-card text-lnd-ink md:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-lnd-line bg-lnd-card px-4 pb-5 pt-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV.map((n) => (
              <a
                key={n.label}
                href={n.href}
                onClick={() => setOpen(false)}
                className="rounded-soft px-3 py-2.5 text-sm font-medium text-lnd-ink transition-colors hover:bg-lnd-deep"
              >
                {n.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 flex gap-2 border-t border-lnd-line pt-4">
            <Link
              to="/login"
              className="flex-1 rounded-full border border-lnd-line px-4 py-2.5 text-center text-sm font-semibold text-lnd-ink"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="flex-1 rounded-full bg-lnd-indigo px-4 py-2.5 text-center text-sm font-semibold text-white"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}