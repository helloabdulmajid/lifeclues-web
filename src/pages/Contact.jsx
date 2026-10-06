import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Mail, PenLine } from 'lucide-react'

export default function Contact() {
  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <main className="flex-1 px-4 py-16 sm:px-6">
        <article className="mx-auto max-w-2xl">
          <Link to="/" className="mb-8 inline-flex items-center gap-1.5 text-sm text-ink-faint transition-colors hover:text-ink">
            <ArrowLeft className="size-4" aria-hidden />
            Back to LifeClues
          </Link>

          <span className="mb-5 flex size-11 items-center justify-center rounded-soft bg-accent-soft text-accent">
            <Mail className="size-6" aria-hidden />
          </span>

          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Contact Us
          </h1>
          <p className="mt-2 text-sm text-ink-faint">Last updated: September 14, 2026</p>

          <div className="prose mt-8 space-y-6 text-ink-soft leading-relaxed">
            <p>
              Found a bug, have an idea, or want to shape what comes next? Send it
              straight to us from your account — reports go directly to the
              LifeClues inbox.
            </p>
            <p className="text-sm text-ink-faint">
              You will be asked to sign in first if you are not already. Leaving an
              email address on the form is optional — without one we cannot reply
              directly, but we still read every report.
            </p>
            <p className="pt-2">
              <Link
                to="/app/profile/feedback"
                className="inline-flex h-11 items-center gap-2 rounded-soft bg-accent px-5 text-sm font-semibold text-accent-ink shadow-soft transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Open Feedback &amp; Support
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </p>
          </div>
        </article>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-ink-faint sm:flex-row sm:px-6">
          <span className="font-display font-semibold tracking-tight text-ink">LifeClues</span>
          <span className="inline-flex items-center gap-2">
            <PenLine className="size-4" aria-hidden />
            Small Clues. Big Memories.
          </span>
          <nav className="flex items-center gap-4">
            <Link to="/privacy" className="transition-colors hover:text-ink">Privacy Policy</Link>
            <Link to="/terms" className="transition-colors hover:text-ink">Terms of Service</Link>
            <Link to="/contact" className="transition-colors hover:text-ink">Contact Us</Link>
          </nav>
          <span>&copy; 2026 LifeClues</span>
        </div>
      </footer>
    </div>
  )
}
