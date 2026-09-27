import { Check, Download, Info, Monitor, Smartphone } from 'lucide-react'
import { usePwaInstall } from '../pwa/usePwaInstall'
import Button from '../ui/Button'
import PageHeader from '../ui/PageHeader'

function SectionLabel({ children }) {
  return (
    <p className="mb-3 font-plxmono text-[10px] font-medium uppercase tracking-[0.22em] text-ink-faint">
      {children}
    </p>
  )
}

const HOW_IT_WORKS = [
  'Installed, LifeClues opens straight to your journal — and to the sign-in screen when you are not signed in.',
  'It launches like a normal app: its own window, no browser address bar.',
  'Your memories are never copied onto the device. LifeClues always loads your journal fresh from the server, so a shared computer never keeps a copy.',
]

export default function InstallTab() {
  const {
    canInstall,
    installed,
    dismissed,
    browserLabel,
    help,
    promptInstall,
    resetDismissed,
  } = usePwaInstall()

  return (
    <div>
      <PageHeader
        title="App & Installation"
        subtitle="Keep LifeClues on this device, like a native app."
      />

      <div className="rounded-card border border-line bg-surface shadow-card lc-themed">
        <div className="p-6 sm:p-8">
          <SectionLabel>Installation</SectionLabel>

          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-soft bg-accent-soft text-accent">
              {installed ? (
                <Check className="size-5" aria-hidden />
              ) : (
                <Smartphone className="size-5" aria-hidden />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">LifeClues</p>
              <p className="text-xs text-ink-soft">
                Small Clues. Big Memories.
              </p>
            </div>
            {canInstall && (
              <Button onClick={() => promptInstall()}>
                <Download className="size-4" aria-hidden />
                Install LifeClues
              </Button>
            )}
            {installed && (
              <Button variant="outline" disabled>
                <Check className="size-4" aria-hidden />
                Installed
              </Button>
            )}
          </div>

          {!canInstall && !installed && (
            <div className="mt-5 rounded-soft border border-line bg-surface-2 p-4">
              <p className="text-sm font-semibold text-ink">{help.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">{help.steps}</p>
            </div>
          )}

          {dismissed && !installed && (
            <div className="mt-5 flex flex-col gap-3 rounded-soft border border-line bg-surface-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-ink-soft">
                You asked us not to remind you on the home page.
              </p>
              <Button variant="outline" onClick={resetDismissed} className="shrink-0">
                Show the reminder again
              </Button>
            </div>
          )}

          <p className="mb-2 mt-7 font-plxmono text-[10px] font-medium uppercase tracking-[0.22em] text-ink-faint">
            What installing does
          </p>
          <ul className="space-y-2">
            {HOW_IT_WORKS.map((line) => (
              <li key={line} className="flex gap-2.5 text-sm leading-relaxed text-ink-soft">
                <Check className="mt-0.5 size-4 shrink-0 text-sienna" aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>

          <div className="mt-7 flex items-start gap-3 border-t border-line pt-6">
            <Info className="mt-0.5 size-5 shrink-0 text-ink-faint" aria-hidden />
            <p className="text-sm leading-relaxed text-ink-soft">
              Offline, LifeClues opens to the sign-in screen rather than showing a copy of
              your journal. Nothing you have written is stored on this device.
            </p>
          </div>

          <p className="mt-4 flex items-center gap-2 font-plxmono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
            <Monitor className="size-3.5" aria-hidden />
            Detected browser: {browserLabel}
          </p>
        </div>
      </div>
    </div>
  )
}
