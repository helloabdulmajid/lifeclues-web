import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

export const THEMES = [
  {
    id: 'paper',
    name: 'Paper & Book',
    tagline: 'Warm, book-like calm. The LifeClues default.',
    swatch: ['#f6f1e6', '#6e6d8e'],
  },
]

export const MODES = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'system', label: 'Auto' },
]

const THEME_KEY = 'lifeclues.theme'
const MODE_KEY = 'lifeclues.mode'

const readPref = (key, fallback) => {
  try {
    return localStorage.getItem(key) || fallback
  } catch {
    return fallback
  }
}

const writePref = (key, value) => {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* storage unavailable – ignore */
  }
}

const systemPrefersDark = () =>
  window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false

function resolveMode(mode) {
  return mode === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : mode
}

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  // Paper & Book is the only theme. Legacy stored values are sanitized.
  const [theme] = useState('paper')
  const [mode, setModeState] = useState(() => readPref(MODE_KEY, 'light'))

  const apply = useCallback((t, m) => {
    document.documentElement.setAttribute('data-theme', t)
    document.documentElement.setAttribute('data-mode', resolveMode(m))
  }, [])

  useEffect(() => {
    apply(theme, mode)
  }, [theme, mode, apply])

  // Keep following the OS when mode is "system".
  useEffect(() => {
    if (mode !== 'system') return undefined
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => apply(theme, mode)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [mode, theme, apply])

  const setTheme = useCallback(
    (t) => {
      if (t !== 'paper') return
      writePref(THEME_KEY, t)
    },
    [],
  )

  const setMode = useCallback(
    (m) => {
      setModeState(m)
      writePref(MODE_KEY, m)
    },
    [],
  )

  const value = useMemo(
    () => ({
      theme,
      mode,
      setTheme,
      setMode,
      resolvedMode: resolveMode(mode),
      themes: THEMES,
      modes: MODES,
    }),
    [theme, mode, setTheme, setMode],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>')
  return ctx
}