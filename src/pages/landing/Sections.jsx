import { Link } from 'react-router-dom'
import { Feather, Image as ImageIcon, Users, Search, Lock, Check } from 'lucide-react'
import { FlowerDoodle, HeartDoodle, MountainDoodle, SiennaUnderline, SunDoodle } from './art'

const FEATURES = [
  {
    icon: Feather,
    bg: '#efe3cf',
    title: 'Write It Down',
    text: 'Capture thoughts in a beat, wherever inspiration finds you.',
  },
  {
    icon: ImageIcon,
    bg: '#e7e0d0',
    title: 'Add Photos',
    text: 'Pair every memory with the picture that holds it.',
  },
  {
    icon: Users,
    bg: '#e8ded2',
    title: 'People & Places',
    text: 'Tag who you were with and where it happened.',
  },
  {
    icon: Search,
    bg: '#e4e0d8',
    title: 'Find Your Story',
    text: 'Search back through years of tiny, precious clues.',
  },
  {
    icon: Lock,
    bg: '#e6e3da',
    title: 'Private & Secure',
    text: 'Your words stay yours — private by design.',
  },
]

const CHECKS = [
  'Small moments become stories',
  'Just you and your words',
  'Pen first. Reflect later.',
  'Small clue. Built relationships again.',
]

export function FeaturesRow() {
  return (
    <section id="features" className="border-t border-lnd-line bg-lnd-card/60">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="mb-12 text-center">
          <p className="font-plxmono text-xs uppercase tracking-[0.24em] text-lnd-sienna">
            Everything you need
          </p>
          <h2 className="mt-3 font-caveat text-4xl text-lnd-ink sm:text-5xl">
            A little help, page by page
          </h2>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="text-center">
              <span
                className="mx-auto flex size-14 items-center justify-center rounded-full border border-lnd-line shadow-soft"
                style={{ backgroundColor: f.bg }}
              >
                <f.icon className="size-6 text-lnd-sienna" strokeWidth={1.6} aria-hidden />
              </span>
              <h3 className="mt-4 font-caveat text-2xl leading-none text-lnd-ink">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-lnd-mut">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function StorySection() {
  return (
    <section id="how-it-works" className="border-t border-lnd-line">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
        <div>
          <p className="font-plxmono text-xs uppercase tracking-[0.24em] text-lnd-sienna">
            More than a journal
          </p>
          <h2 className="mt-4 font-caveat text-5xl leading-[0.95] text-lnd-ink sm:text-6xl">
            It&rsquo;s your story.
          </h2>
          <SiennaUnderline className="mt-2 h-3 w-48" />
          <p className="mt-6 max-w-md text-lg leading-relaxed text-lnd-mut">
            Life doesn&rsquo;t move in chapters — it moves in moments. LifeClues
            helps you hold on to the ones you never want to let go.
          </p>
          <ul className="mt-8 space-y-3.5">
            {CHECKS.map((c) => (
              <li key={c} className="flex items-center gap-3 text-[15px] text-lnd-ink">
                <span
                  className="flex size-6 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: '#f0e2d4', color: '#b4501e' }}
                >
                  <Check className="size-3.5" strokeWidth={2.6} aria-hidden />
                </span>
                {c}
              </li>
            ))}
          </ul>
          <Link
            to="/register"
            className="mt-9 inline-flex items-center gap-2.5 rounded-full bg-lnd-indigo px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-lnd-indigo-hover"
          >
            <span
              className="size-1.5 rounded-full"
              style={{ backgroundColor: '#b4501e' }}
              aria-hidden
            />
            Get Started Free
          </Link>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <MountainDoodle className="absolute -left-2 -top-8 w-24 text-lnd-line lg:-left-10" />
          <div className="rotate-1 rounded-3xl border border-lnd-line bg-lnd-card p-5 shadow-[0_18px_40px_-18px_rgba(33,27,17,0.22)]">
            <p className="font-caveat text-[26px] leading-snug text-lnd-ink">
              Sept 14 — she called again. Three rings, then her voice, softer
              than I remember. Outside, the jasmine had finally bloomed. I
              wrote it down before I could forget.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="rounded-full px-2.5 py-1" style={{ backgroundColor: '#e2ece3', color: '#4e6347' }}>
                <span className="font-plxmono text-[10px] uppercase tracking-[0.1em]">Chill</span>
              </span>
              <span
                className="font-plxmono text-[10px] uppercase tracking-[0.1em]"
                style={{ color: '#87806f' }}
              >
                14.09.26 · jasmine &amp; phone calls
              </span>
            </div>
          </div>
          <SunDoodle className="absolute -right-1 -top-6 size-10 rotate-12 text-lnd-sienna lg:-right-6" />
          <FlowerDoodle className="absolute -bottom-6 -left-3 size-12 lg:-left-8" />
        </div>
      </div>
    </section>
  )
}

export function Closing() {
  return (
    <section id="about" className="relative overflow-hidden border-t border-lnd-line">
      <div className="paper-texture mx-auto max-w-3xl px-6 py-20 text-center sm:py-28">
        <HeartDoodle className="mx-auto size-5 text-lnd-sienna" />
        <h2 className="mt-6 font-caveat text-5xl leading-[0.95] text-lnd-ink sm:text-6xl">
          You may forget the story,
          <br />
          but remember one clue.
        </h2>
        <SiennaUnderline className="mx-auto mt-3 h-3 w-64" />

        <p className="mt-8 font-plxmono text-xs uppercase tracking-[0.24em] text-lnd-mut">
          Small Clues. Big Memories.
        </p>
        <p className="mt-3 font-caveat text-2xl text-lnd-mut">
          Small moments make a brighter tomorrow.
        </p>

        <div className="mt-12 flex items-end justify-center gap-6 sm:gap-10">
          <SunDoodle className="size-10 text-lnd-sienna" />
          <MountainDoodle className="w-24 text-lnd-line sm:w-32" />
          <FlowerDoodle className="size-12" />
          <HeartDoodle className="mb-1 size-5 text-lnd-sienna" />
        </div>
      </div>
    </section>
  )
}