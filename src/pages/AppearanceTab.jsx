import { Check, Clock, Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from '../theme/ThemeContext'
import { useAuth } from '../auth/AuthContext'
import { accountApi } from '../api/client'
import PageHeader from '../ui/PageHeader'

const MODE_ICONS = {
  light: Sun,
  dark: Moon,
  system: Monitor,
}

const TIME_FORMATS = [
  { id: 'H12', label: '12-hour', example: '7:30 PM' },
  { id: 'H24', label: '24-hour', example: '19:30' },
]

function SectionLabel({ children }) {
  return (
    <p className="mb-3 font-plxmono text-[10px] font-medium uppercase tracking-[0.22em] text-ink-faint">
      {children}
    </p>
  )
}

export default function AppearanceTab() {
  const { theme, mode, setTheme, setMode, themes, modes } = useTheme()
  const { user, setProfile } = useAuth()
  const timeFormat = user?.timeFormat || 'H12'

  const handleTimeFormat = async (fmt) => {
    try {
      const updated = await accountApi.updateProfile({ timeFormat: fmt })
      setProfile(updated)
    } catch (err) {
      console.error('Failed to save time format:', err)
    }
  }

  return (
    <div>
      <PageHeader
        title="Appearance"
        subtitle="Choose how LifeClues looks and feels."
      />

      <div className="rounded-card border border-line bg-surface shadow-card lc-themed">
        <div className="p-6 sm:p-8">
          <SectionLabel>Theme</SectionLabel>
          <div className="space-y-2">
            {themes.map((t) => {
              const selected = t.id === theme
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id)}
                  aria-pressed={selected}
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

          <p className="mb-2 mt-7 font-plxmono text-[10px] font-medium uppercase tracking-[0.22em] text-ink-faint">
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

          <p className="mb-2 mt-7 font-plxmono text-[10px] font-medium uppercase tracking-[0.22em] text-ink-faint">
            Time Format
          </p>
          <div className="grid grid-cols-2 gap-2">
            {TIME_FORMATS.map((tf) => {
              const selected = tf.id === timeFormat
              return (
                <button
                  key={tf.id}
                  type="button"
                  onClick={() => handleTimeFormat(tf.id)}
                  className={`flex items-center gap-3 rounded-soft border px-3 py-2.5 text-left transition-colors ${
                    selected
                      ? 'border-accent bg-accent-soft text-accent'
                      : 'border-line text-ink-soft hover:bg-surface-2'
                  }`}
                >
                  <Clock className="size-4 shrink-0" aria-hidden />
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-ink">{tf.label}</span>
                    <span className="block text-xs text-ink-faint">{tf.example}</span>
                  </span>
                  {selected && (
                    <Check className="size-4 shrink-0 text-accent" aria-hidden />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}