import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookHeart,
  Feather,
  Lock,
  PenLine,
  Tag,
} from 'lucide-react'
import Logo from '../ui/Logo'
import Button from '../ui/Button'
import AppearanceMenu from '../theme/AppearanceMenu'

const features = [
  {
    icon: Feather,
    title: 'Capture a tiny moment',
    text: 'Some days a line, some days just a feeling. Two minutes is enough — no pressure, no streaks to lose.',
  },
  {
    icon: Tag,
    title: 'Rediscover by theme',
    text: 'Every page can note who was there, where you were, and how it felt — so a whole season of your life can come back when you need it.',
  },
  {
    icon: Lock,
    title: 'Quiet and private',
    text: 'Your memories are yours. No noise, no likes, no feed — just a book you keep.',
  },
]

export default function Landing() {
  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <header className="border-b border-line bg-paper/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-3 sm:gap-3 sm:px-6">
          <Logo compact />
          <div className="flex items-center gap-2.5">
            <AppearanceMenu />
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link to="/register" className="hidden md:inline-flex">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 text-center sm:px-6 sm:pt-24">
          <p className="mx-auto mb-6 w-fit rounded-full border border-line bg-surface px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
            A calm, book-like memory journal
          </p>
          <h1 className="mx-auto max-w-3xl font-display text-5xl font-semibold tracking-tight text-ink sm:text-6xl">
            Small Clues.
            <br />
            Big Memories.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-ink-soft">
            LifeClues is your private memory book. Jot down the little moments
            of your days — how today felt, what stayed with you — and let your
            own past come back to you, gently, when you need it.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/register">
              <Button size="lg">
                Start your memory book
                <ArrowRight className="size-5" aria-hidden />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">
                I already have one
              </Button>
            </Link>
          </div>
          <p className="mt-5 text-sm text-ink-faint">
            No streaks. No pressure. No one else sees it.
          </p>
        </section>

        <section className="border-y border-line bg-surface/60">
          <div className="mx-auto grid max-w-6xl gap-4 px-4 py-16 sm:px-6 md:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-card border border-line bg-surface p-6 shadow-soft lc-themed"
              >
                <span className="mb-4 flex size-11 items-center justify-center rounded-soft bg-accent-soft text-accent">
                  <f.icon className="size-6" aria-hidden />
                </span>
                <h2 className="font-display text-xl font-semibold text-ink">{f.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
          <div className="mx-auto max-w-2xl rounded-card border border-line bg-surface p-8 shadow-card sm:p-12 lc-themed">
            <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-accent text-accent-ink">
            <BookHeart className="size-7" aria-hidden />
            </div>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">
              Your memories, waiting in the margins
            </h2>
            <p className="mt-4 text-ink-soft">
              The most precious moments are the tiny ones. Start leaving clues
              today, and years from now you will open the book and find them
              again.
            </p>
            <Link to="/register" className="mt-8 inline-block">
              <Button size="lg">
                Create your account
                <ArrowRight className="size-5" aria-hidden />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-ink-faint sm:flex-row sm:px-6">
          <span className="inline-flex items-center gap-2">
            <PenLine className="size-4" aria-hidden />
            Small Clues. Big Memories.
          </span>
          <span>© {new Date().getFullYear()} LifeClues</span>
        </div>
      </footer>
    </div>
  )
}