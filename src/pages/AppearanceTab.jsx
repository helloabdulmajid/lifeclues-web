import { Check, Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from '../theme/ThemeContext'

const MODE_ICONS = {
  light: Sun,
  dark: Moon,
  system: Monitor,
}

export default function AppearanceTab() {
  const { theme, mode, setTheme, setMode, themes, modes } = useTheme()

  return (
    <div>
      <div className="rounded-card border border-line bg-surface shadow-card lc-themed">
        <div className="border-b border-line p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold text-ink">Appearance</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Choose how LifeClues looks and feels.
          </p>
        </div>

        <div className="p-6 sm:p-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-faint">
            Theme
          </p>
          <div className="space-y-2">
            {themes.map((t) => {
              const selected = t.id === theme
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id)}
                  className={`flex w-full items-center gap-3 rounded-soft border p-3 text-left transition-colors ${
                    selected
                      ? 'border-accent bg-accent-soft'
                      : 'border-line bg-surface hover:border-line-strong hover:bg-surface-2'
                  }`}
                >
                  <span className="flex size-9 shrink-0 overflow-hidden rounded-soft border border-line-strong">
                    <span style={{ background: t.swatch[0] }} className="flex-1" />
                    <span style={{ background: t.swatch[1] }} className="flex-1" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-ink">
                      {t.name}
                    </span>
                    <span className="block text-xs text-ink-soft">{t.tagline}</span>
                  </span>
                  {selected && (
                    <Check className="size-4 shrink-0 text-accent" aria-hidden />
                  )}
                </button>
              )
            })}
          </div>

          <p className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wider text-ink-faint">
            Mode
          </p>
          <div className="grid grid-cols-3 gap-2">
            {modes.map((m) => {
              const Icon = MODE_ICONS[m.id]
              const selected = m.id === mode
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  className={`flex flex-col items-center gap-1 rounded-soft border px-2 py-2.5 text-xs font-medium transition-colors ${
                    selected
                      ? 'border-accent bg-accent-soft text-accent'
                      : 'border-line text-ink-soft hover:bg-surface-2'
                  }`}
                >
                  <Icon className="size-4" aria-hidden />
                  {m.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
