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
    swatch: ['#f7f1e5', '#b25e38'],
  },
  {
    id: 'indigo',
    name: 'Modern Minimal',
    tagline: 'Clean, sharp, distraction-free.',
    swatch: ['#f5f6fa', '#4f46e5'],
  },
  {
    id: 'green',
    name: 'Earthy Calm',
    tagline: 'Soft greens, rooted and close to nature.',
    swatch: ['#f4f2e6', '#41693c'],
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
  const [theme, setThemeState] = useState(() =>
    readPref(THEME_KEY, 'paper'),
  )
  const [mode, setModeState] = useState(() => readPref(MODE_KEY, 'system'))

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
      setThemeState(t)
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