/* Install state for the LifeClues PWA.
   Wraps the browser's `beforeinstallprompt` so a surface can offer "Install"
   without ever opening the browser dialog on its own — the user always taps
   first. Remembers a dismissal locally, like the appearance preference. */

import { useCallback, useEffect, useMemo, useState } from 'react'

const DISMISSED_KEY = 'lifeclues.installDismissed'

const readDismissed = () => {
  try {
    return localStorage.getItem(DISMISSED_KEY) === '1'
  } catch {
    return false
  }
}

const writeDismissed = (value) => {
  try {
    if (value) localStorage.setItem(DISMISSED_KEY, '1')
    else localStorage.removeItem(DISMISSED_KEY)
  } catch {
    /* storage unavailable – ignore */
  }
}

/* True when LifeClues is running as an installed app (Android, desktop, or
   iOS, where the event never fires and `navigator.standalone` is the signal). */
function detectInstalled() {
  if (typeof window === 'undefined') return false
  if (window.matchMedia?.('(display-mode: standalone)').matches) return true
  if (window.matchMedia?.('(display-mode: minimal-ui)').matches) return true
  if (window.matchMedia?.('(display-mode: window-controls-overlay)').matches) return true
  return window.navigator?.standalone === true
}

function detectBrowser() {
  const ua = window.navigator?.userAgent || ''
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && 'ontouchend' in window)
  if (/CriOS|FxiOS|EdgiOS/.test(ua)) return 'in-app'
  if (isIOS) return 'ios'
  if (/Firefox/.test(ua)) return 'firefox'
  if (/Edg\//.test(ua)) return 'edge'
  if (/OPR\//.test(ua)) return 'opera'
  if (/Chrome|CriOS/.test(ua)) return 'chrome'
  if (/Safari/.test(ua)) return 'safari'
  return 'other'
}

export const BROWSER_LABELS = {
  ios: 'Safari on iOS',
  safari: 'Safari',
  chrome: 'Chrome',
  edge: 'Edge',
  opera: 'Opera',
  firefox: 'Firefox',
  'in-app': 'an in-app browser',
  other: 'this browser',
}

export const INSTALL_HELP = {
  ios: {
    title: 'Add LifeClues to your Home Screen',
    steps: 'Tap the Share button, then choose “Add to Home Screen”.',
  },
  safari: {
    title: 'Add LifeClues to your Dock',
    steps: 'Use File → Add to Dock, or drag the page onto your Dock.',
  },
  'in-app': {
    title: 'Open LifeClues in your browser',
    steps: 'Use the menu in the top corner and choose “Open in browser”, then install from there.',
  },
  firefox: {
    title: 'Install LifeClues from the browser menu',
    steps: 'Firefox on desktop does not install apps — use Chrome or Edge on Android, or Add to Home Screen on iOS.',
  },
  edge: {
    title: 'Install from the Edge menu',
    steps: 'Open the browser menu and choose “Apps” → “Install LifeClues”.',
  },
  opera: {
    title: 'Install from the Opera menu',
    steps: 'Open the browser menu and choose “Install” to add LifeClues as an app.',
  },
  chrome: {
    title: 'Install from the browser menu',
    steps: 'Open the browser menu and choose “Install LifeClues” or “Cast, save and share” → “Install page as app”.',
  },
  other: {
    title: 'Install from your browser menu',
    steps: 'Look for “Install app” or “Add to Home Screen” in your browser menu.',
  },
}

export function usePwaInstall() {
  const [deferred, setDeferred] = useState(null)
  const [installed, setInstalled] = useState(detectInstalled)
  const [dismissed, setDismissed] = useState(readDismissed)
  const [browser, setBrowser] = useState(() =>
    typeof window === 'undefined' ? 'other' : detectBrowser(),
  )

  useEffect(() => {
    const onBeforeInstallPrompt = (event) => {
      // Keep the event so the Install button can trigger the dialog on tap.
      event.preventDefault()
      setDeferred(event)
    }
    const onAppInstalled = () => {
      setInstalled(true)
      setDeferred(null)
    }
    // The mode/standalone state can change without a reload (display-mode media).
    const standaloneQuery = window.matchMedia?.('(display-mode: standalone)')
    const onDisplayModeChange = () => setInstalled(detectInstalled())

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)
    standaloneQuery?.addEventListener?.('change', onDisplayModeChange)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
      standaloneQuery?.removeEventListener?.('change', onDisplayModeChange)
    }
  }, [])

  const canInstall = Boolean(deferred) && !installed

  const promptInstall = useCallback(async () => {
    if (!deferred) return 'unavailable'
    setDismissed(false)
    writeDismissed(false)
    const event = deferred
    setDeferred(null)
    try {
      await event.prompt()
      const { outcome } = await event.userChoice
      // "dismissed" here is the browser's own choice — don't treat it as ours.
      return outcome
    } catch {
      return 'error'
    }
  }, [deferred])

  const dismiss = useCallback(() => {
    setDismissed(true)
    writeDismissed(true)
  }, [])

  const resetDismissed = useCallback(() => {
    setDismissed(false)
    writeDismissed(false)
  }, [])

  const showPrompt = canInstall && !dismissed

  return useMemo(
    () => ({
      canInstall,
      installed,
      dismissed,
      showPrompt,
      browser,
      browserLabel: BROWSER_LABELS[browser] || BROWSER_LABELS.other,
      help: INSTALL_HELP[browser] || INSTALL_HELP.other,
      promptInstall,
      dismiss,
      resetDismissed,
    }),
    [canInstall, installed, dismissed, showPrompt, browser, promptInstall, dismiss, resetDismissed],
  )
}
