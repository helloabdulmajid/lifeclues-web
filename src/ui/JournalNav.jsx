import { createContext, useCallback, useContext, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

export const JOURNAL_TAB_IDS = ['home', 'memories', 'drafts', 'search']

const JournalNavContext = createContext(null)

export function JournalNavProvider({ children }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const raw = searchParams.get('tab')
  const tab = JOURNAL_TAB_IDS.includes(raw) ? raw : 'home'
  const view = searchParams.get('view') === 'trash' ? 'trash' : 'memories'

  const setTab = useCallback(
    (next) => {
      if (!JOURNAL_TAB_IDS.includes(next)) next = 'home'
      setSearchParams(next === 'home' ? {} : { tab: next })
    },
    [setSearchParams],
  )

  const setView = useCallback(
    (next) => {
      const params = new URLSearchParams(searchParams)
      if (next === 'trash') {
        params.set('view', 'trash')
        params.set('tab', 'memories')
      } else {
        params.delete('view')
      }
      setSearchParams(params)
    },
    [searchParams, setSearchParams],
  )

  const value = useMemo(
    () => ({ tab, view, setTab, setView }),
    [tab, view, setTab, setView],
  )
  return <JournalNavContext.Provider value={value}>{children}</JournalNavContext.Provider>
}

export function useJournalNav() {
  const ctx = useContext(JournalNavContext)
  if (!ctx) throw new Error('useJournalNav must be used within <JournalNavProvider>')
  return ctx
}