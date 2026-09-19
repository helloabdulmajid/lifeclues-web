import { Plus, Sun } from 'lucide-react'
import { CoffeeScene, LeafMark, MountainsScene, WinScene } from './art'
import { DateLabel, MoodPill, PersonTag, PlaceTag } from './kit'

const SIDEBAR = ['Today', 'Journal', 'Moments', 'People', 'Photos', 'Search', 'Settings']

const MEMORIES = [
  {
    art: MountainsScene,
    title: 'A day by the lake',
    mood: 'chill',
    person: 'Mom',
    place: 'Bangalore',
    date: '14.09.26',
  },
  {
    art: CoffeeScene,
    title: 'Coffee and ideas',
    mood: 'special',
    person: 'Aarav',
    place: 'Café Mélange',
    date: '12.09.26',
  },
  {
    art: WinScene,
    title: 'A small win',
    mood: 'win',
    person: 'Me',
    place: 'Home',
    date: '10.09.26',
  },
]

const TABS = ['Recent', 'Drafts', 'Pinned']

export default function AppPreview() {
  return (
    <section id="app-preview" className="border-t border-lnd-line">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="text-center">
          <p className="font-plxmono text-xs uppercase tracking-[0.24em] text-lnd-sienna">
            A glance inside
          </p>
          <h2 className="mt-3 font-caveat text-4xl text-lnd-ink sm:text-5xl">
            Your quiet corner, every day
          </h2>
        </div>

        <div className="mx-auto mt-12 max-w-4xl -rotate-1 rounded-3xl border border-lnd-line bg-lnd-card p-2 shadow-[0_24px_50px_-24px_rgba(33,27,17,0.3)] sm:p-3">
          <div className="flex overflow-hidden rounded-2xl border border-lnd-line bg-lnd-paper">
            {/* side rail */}
            <aside className="hidden w-48 shrink-0 flex-col border-r border-lnd-line bg-lnd-deep/50 p-4 sm:flex">
              <div className="flex items-center gap-2">
                <span
                  className="flex size-7 items-center justify-center rounded-lg"
                  style={{ backgroundColor: '#4a3728', color: '#fff7ea' }}
                >
                  <LeafMark className="size-4" />
                </span>
                <span className="font-grotesk text-sm font-semibold text-lnd-ink">LifeClues</span>
              </div>
              <nav className="mt-6 space-y-1">
                {SIDEBAR.map((s, i) => (
                  <span
                    key={s}
                    className={`block rounded-lg px-3 py-2 font-plxmono text-[10px] uppercase tracking-[0.14em] ${
                      i === 0
                        ? 'font-medium'
                        : 'text-lnd-faint'
                    }`}
                    style={i === 0 ? { backgroundColor: '#e1dff2', color: '#454674' } : undefined}
                  >
                    {s}
                  </span>
                ))}
              </nav>
              <span className="mt-auto font-plxmono text-[9px] uppercase tracking-[0.16em] text-lnd-faint">
                private · just you
              </span>
            </aside>

            {/* main pane */}
            <div className="min-w-0 flex-1 p-5 sm:p-7">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-plxmono text-[11px] uppercase tracking-[0.24em] text-lnd-sienna">
                    Good morning
                  </p>
                  <h3 className="mt-1.5 font-caveat text-3xl leading-none text-lnd-ink sm:text-4xl">
                    What&rsquo;s on your mind today?
                  </h3>
                  <p className="mt-2.5 flex items-center gap-1.5 font-plxmono text-[11px] uppercase tracking-[0.1em] text-lnd-mut">
                    <Sun className="size-3.5 text-lnd-sienna" aria-hidden />
                    Tue, 14 Sep 2026
                  </p>
                </div>
                <span
                  className="hidden shrink-0 items-center gap-2 rounded-full bg-lnd-indigo px-4 py-2.5 text-xs font-semibold text-white sm:inline-flex"
                >
                  <Plus className="size-3.5" strokeWidth={2.4} aria-hidden />
                  New Entry
                </span>
              </div>

              <div className="mt-6 flex gap-5 border-b border-lnd-line">
                {TABS.map((t, i) => (
                  <span
                    key={t}
                    className={`relative pb-2.5 font-plxmono text-[11px] uppercase tracking-[0.14em] ${
                      i === 0 ? 'text-lnd-ink' : 'text-lnd-faint'
                    }`}
                  >
                    {t}
                    {i === 0 && (
                      <span className="absolute inset-x-0 -bottom-px h-0.5 bg-lnd-sienna" />
                    )}
                  </span>
                ))}
                <span className="ml-auto hidden pb-2.5 font-plxmono text-[10px] uppercase tracking-[0.14em] text-lnd-faint sm:block">
                  this week
                </span>
              </div>

              <div className="divide-y divide-lnd-line">
                {MEMORIES.map((m) => (
                  <article key={m.title} className="flex items-center gap-4 py-4">
                    <m.art className="h-12 w-16 shrink-0 rounded-lg border border-lnd-line" />
                    <div className="min-w-0">
                      <h4 className="truncate font-caveat text-xl leading-tight text-lnd-ink">
                        {m.title}
                      </h4>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <MoodPill mood={m.mood} />
                        <PersonTag>{m.person}</PersonTag>
                        <PlaceTag>{m.place}</PlaceTag>
                      </div>
                    </div>
                    <DateLabel className="ml-auto shrink-0">{m.date}</DateLabel>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}