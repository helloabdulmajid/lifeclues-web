import { Download, X } from 'lucide-react'
import Button from './Button'
import { usePwaInstall } from '../pwa/usePwaInstall'

/* Small Paper & Book install invitation. It appears only when the browser
   actually offers installation, and never opens the install dialog by itself —
   the visitor has to tap Install. */
export default function InstallPrompt() {
  const { showPrompt, promptInstall, dismiss } = usePwaInstall()

  if (!showPrompt) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[env(safe-area-inset-bottom)] sm:bottom-6 sm:pb-0">
      <div
        role="status"
        className="pointer-events-auto mb-4 flex w-full max-w-md flex-col gap-3 rounded-card border border-line bg-surface p-4 shadow-card lc-themed sm:mb-0 sm:w-auto sm:max-w-none sm:flex-row sm:items-center sm:gap-4 sm:pl-4"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-soft bg-accent-soft text-accent">
            <Download className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">Install LifeClues</p>
            <p className="hidden font-plxmono text-[10px] uppercase tracking-[0.18em] text-ink-faint sm:block">
              Small Clues. Big Memories.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:ml-1">
          <Button className="flex-1 sm:flex-none" onClick={() => promptInstall()}>
            Install
          </Button>
          <Button
            variant="ghost"
            className="flex-1 sm:flex-none"
            onClick={dismiss}
            aria-label="Dismiss install prompt"
          >
            <X className="size-4" aria-hidden />
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  )
}
