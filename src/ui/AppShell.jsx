import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Feather,
  PenLine,
  Search,
  Settings,
  Trash2,
  UserRound,
} from 'lucide-react'
import BrandLockup from './BrandLockup'
import { JournalNavProvider, useJournalNav } from './JournalNav'

const TAB_ITEMS = [
  { id: 'home', to: '/app', label: 'Write a memory', sub: 'today', Icon: Feather },
  { id: 'memories', to: '/app?tab=memories', label: 'Memories', sub: 'archive', Icon: BookOpen },
  { id: 'drafts', to: '/app?tab=drafts', label: 'Drafts', sub: 'unfinished', Icon: PenLine },
  { id: 'search', to: '/app?tab=search', label: 'Search', sub: 'find clues', Icon: Search },
]

const MOBILE_NAV = [
  { id: 'memories', to: '/app?tab=memories', label: 'Memories', Icon: BookOpen },
  { id: 'drafts', to: '/app?tab=drafts', label: 'Drafts', Icon: PenLine },
  { id: 'write', to: '/app', label: 'Write', Icon: Feather },
  { id: 'search', to: '/app?tab=search', label: 'Search', Icon: Search },
  { id: 'profile', to: '/app/profile', label: 'Profile', Icon: UserRound },
]

const editorIsOpen = () => document.documentElement.classList.contains('lc-editing')

function guardNav(e, navigate, to) {
  if (!editorIsOpen()) return true
  e.preventDefault()
  if (window.confirm('Discard this draft? Your changes will be lost.')) {
    window.dispatchEvent(new CustomEvent('lifeclues:discard-draft'))
    navigate(to)
  }
  return false
}

function Rail() {
  const { tab } = useJournalNav()
  const navigate = useNavigate()
  const location = useLocation()
  const onProfile = location.pathname.startsWith('/app/profile')

  return (
    <aside className="hidden w-52 shrink-0 lg:block">
      <nav className="sticky top-24 space-y-1 py-8" aria-label="App navigation">
        {TAB_ITEMS.map(({ id, to, label, sub, Icon }) => {
          const active = !onProfile && tab === id
          return (
            <NavLink
              key={id}
              to={to}
              onClick={(e) => guardNav(e, navigate, to)}
              aria-current={active ? 'page' : undefined}
              className={`group flex items-center gap-3 rounded-soft px-3 py-2 transition-colors ${
                active
                  ? 'bg-accent-soft text-accent'
                  : 'text-ink-soft hover:bg-surface-2 hover:text-ink'
              }`}
            >
              <Icon className="size-5 shrink-0" aria-hidden />
              <span className="flex flex-col leading-tight">
                <span className="text-sm font-medium">{label}</span>
                <span className="font-plxmono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
                  {sub}
                </span>
              </span>
            </NavLink>
          )
        })}

        <button
          type="button"
          onClick={(e) => {
            if (!guardNav(e, navigate, '/app?tab=memories&view=trash')) return
            navigate('/app?tab=memories&view=trash')
          }}
          className="group flex w-full items-center gap-3 rounded-soft px-3 py-2 text-left text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <Trash2 className="size-5 shrink-0" aria-hidden />
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-medium">Trash</span>
            <span className="font-plxmono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
              rest in peace
            </span>
          </span>
        </button>

        <div className="my-3 h-px bg-line" aria-hidden />

        <NavLink
          to="/app/profile"
          aria-current={onProfile ? 'page' : undefined}
          className={`group flex items-center gap-3 rounded-soft px-3 py-2 transition-colors ${
            onProfile
              ? 'bg-accent-soft text-accent'
              : 'text-ink-soft hover:bg-surface-2 hover:text-ink'
          }`}
        >
          <Settings className="size-5 shrink-0" aria-hidden />
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-medium">Settings</span>
            <span className="font-plxmono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
              preferences
            </span>
          </span>
        </NavLink>
      </nav>
    </aside>
  )
}

function MobileNav() {
  const { tab } = useJournalNav()
  const location = useLocation()
  const navigate = useNavigate()
  const onProfile = location.pathname.startsWith('/app/profile')

  return (
    <nav
      className="lc-mobile-nav fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-paper/90 pb-[env(safe-area-inset-bottom)] backdrop-blur lc-themed lg:hidden"
      aria-label="App navigation"
    >
      <div className="mx-auto flex h-16 max-w-lg items-end justify-around px-2">
        {MOBILE_NAV.map(({ id, to, label, Icon }) => {
          const isWrite = id === 'write'
          const active =
            id === 'profile' ? onProfile : tab === id
          if (isWrite) {
            return (
              <button
                key={id}
                type="button"
                onClick={(e) => {
                  if (!guardNav(e, navigate, '/app?compose=1')) return
                  navigate('/app?compose=1')
                }}
                aria-label="Write a memory"
                title="Write a memory"
                className="relative -top-5 flex size-14 items-center justify-center rounded-full bg-accent text-accent-ink shadow-card transition-transform hover:scale-105"
              >
                <Icon className="size-6" aria-hidden />
              </button>
            )
          }
          return (
            <NavLink
              key={id}
              to={to}
              onClick={(e) => guardNav(e, navigate, to)}
              className={`flex min-w-12 flex-col items-center gap-1 pb-2 transition-colors ${
                active ? 'text-accent' : 'text-ink-faint hover:text-ink'
              }`}
            >
              <Icon className="size-5" aria-hidden />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

export default function AppShell() {
  return (
    <JournalNavProvider>
      <div className="min-h-dvh bg-paper">
        <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur lc-themed">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
            <NavLink to="/app" aria-label="LifeClues home" className="rounded-soft">
              <BrandLockup />
            </NavLink>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <NavLink
                to="/app/profile"
                onClick={(e) => guardNav(e, navigate, '/app/profile')}
                className="inline-flex size-10 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink"
                title="Profile"
                aria-label="Profile"
              >
                <UserRound className="size-5" aria-hidden />
              </NavLink>
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <Rail />
            <main className="min-w-0 flex-1 pb-24 pt-8 sm:pt-10 lg:pb-16">
              <Outlet />
            </main>
          </div>
        </div>

        <MobileNav />
      </div>
    </JournalNavProvider>
  )
}