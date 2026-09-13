import { BookHeart, Lightbulb, MapPin } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

export default function Journal() {
  const { user } = useAuth()
  const name = user?.displayName?.trim() || user?.username || 'there'

  const coming = [
    { icon: Lightbulb, label: 'Write a tiny clue a day' },
    { icon: MapPin, label: 'Who was there, where you were' },
  ]

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="break-words font-display text-4xl font-semibold tracking-tight text-ink">
        Hello, {name}.
      </h1>
      <p className="mt-3 text-ink-soft">
        Your memory book is ready. Writing starts in the next step — for now,
        everything is set up and safe.
      </p>

      <div className="mt-10 rounded-card border border-line bg-surface p-8 text-center shadow-card lc-themed">
        <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-accent-soft text-accent">
          <BookHeart className="size-7" aria-hidden />
        </span>
        <h2 className="font-display text-2xl font-semibold text-ink">
          Breathe. Your journal is coming.
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
          The first version of LifeClues built your account, your privacy, and
          your theme — the writing itself is the very next thing we build.
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {coming.map((item) => (
            <div
              key={item.label}
              className="rounded-soft border border-line bg-paper/60 px-4 py-4"
            >
              <item.icon className="mx-auto mb-2 size-5 text-accent" aria-hidden />
              <p className="text-xs font-medium text-ink-soft">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}