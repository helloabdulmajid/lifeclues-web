import { Link } from 'react-router-dom'
import { Lock, BookHeart, Sparkles } from 'lucide-react'
import { SiennaUnderline } from './art'
import HeroCollage from './HeroCollage'

const TRUST = [
  {
    icon: Lock,
    title: 'Private by design',
    text: 'Only you can see what you write.',
  },
  {
    icon: BookHeart,
    title: 'Your memories',
    text: 'Kept close, forever yours.',
  },
  {
    icon: Sparkles,
    title: 'Always with you',
    text: 'On the phone, on the desktop.',
  },
]

export default function Hero() {
  return (
    <section id="home" className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:pb-24 lg:pt-16">
        <div>
          <p className="font-plxmono text-xs uppercase tracking-[0.24em] text-lnd-sienna">
            A private journal · just you
          </p>

          <h1 className="mt-5 font-caveat text-[56px] leading-[0.95] text-lnd-ink sm:text-[76px]">
            Small Clues.
            <br />
            Big Memories.
          </h1>
          <SiennaUnderline className="mt-2 h-3 w-52" />

          <p className="mt-6 max-w-md text-lg leading-relaxed text-lnd-mut">
            You may forget the story, but remember one clue. LifeClues turns
            tiny moments into memories that stay with you.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2.5 rounded-full bg-lnd-indigo px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-lnd-indigo-hover"
            >
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: '#b4501e' }}
                aria-hidden
              />
              Start Writing
            </Link>
            <a
              href="#app-preview"
              className="rounded-full border border-lnd-line bg-lnd-card px-7 py-3.5 text-sm font-semibold text-lnd-ink transition-colors hover:border-lnd-sienna/50"
            >
              Take a Look
            </a>
          </div>

          <dl className="mt-10 grid max-w-md gap-6 sm:grid-cols-3">
            {TRUST.map((t) => (
              <div key={t.title}>
                <dt className="flex items-center gap-1.5 text-sm font-semibold text-lnd-ink">
                  <t.icon className="size-4 text-lnd-sienna" aria-hidden />
                  {t.title}
                </dt>
                <dd className="mt-1 text-[13px] leading-snug text-lnd-mut">{t.text}</dd>
              </div>
            ))}
          </dl>
        </div>

        <HeroCollage />
      </div>
    </section>
  )
}