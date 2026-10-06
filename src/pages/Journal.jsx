import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Feather,
  Folder,
  Heart,
  MapPin,
  MoreHorizontal,
  Pencil,
  PenLine,
  Pin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Smile,
  Tag,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import { memoryApi } from '../api/client'
import { ApiError } from '../api/http'
import { useAuth } from '../auth/AuthContext'
import Button from '../ui/Button'
import Alert from '../ui/Alert'
import Spinner from '../ui/Spinner'
import { Field } from '../ui/Field'
import PageHeader from '../ui/PageHeader'
import { useJournalNav } from '../ui/JournalNav'

const EMPTY_FORM = {
  eventDate: '',
  eventTime: '',
  title: '',
  content: '',
  tags: [],
  mood: '',
  categories: [],
  people: [],
  places: [],
}

const MOODS = ['HAPPY', 'CALM', 'EXCITED', 'NOSTALGIC', 'SAD', 'ANGRY', 'TIRED', 'NEUTRAL']

const MOOD_LABELS = {
  HAPPY: 'Happy',
  CALM: 'Calm',
  EXCITED: 'Excited',
  NOSTALGIC: 'Nostalgic',
  SAD: 'Sad',
  ANGRY: 'Angry',
  TIRED: 'Tired',
  NEUTRAL: 'Neutral',
}

const moodLabel = (mood) => (mood ? (MOOD_LABELS[mood] ?? mood.toLowerCase()) : '')

const filterControlClass =
  'rounded-soft border border-line-strong bg-surface px-3 py-2 text-sm text-ink transition-colors focus:outline-2 focus:outline-offset-1 focus:border-accent focus:outline-accent'

function todayString() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function formatTime(value, timeFormat = 'H12') {
  if (!value) return ''
  const [h, min] = value.split(':')
  if (h === undefined || min === undefined) return value
  if (timeFormat === 'H24') {
    return `${h}:${min}`
  }
  const d = new Date()
  d.setHours(Number(h), Number(min))
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true })
}

function formatLongDate(value) {
  const [y, m, d] = (value || '').split('-').map(Number)
  if (!y || !m || !d) return ''
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function timeAgo(value) {
  if (!value) return ''
  const t = new Date(value).getTime()
  if (Number.isNaN(t)) return ''
  const sec = Math.floor((Date.now() - t) / 1000)
  if (sec < 45) return 'just now'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hrs = Math.floor(min / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

function todayMonoLine() {
  return new Date()
    .toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
    .toUpperCase()
}

function dayParts(value) {
  const [y, m, d] = (value || '').split('-').map(Number)
  if (!y || !m || !d) return null
  const date = new Date(y, m - 1, d)
  return {
    day: String(d),
    weekday: date.toLocaleDateString(undefined, { weekday: 'long' }),
  }
}

function monthLabel(key) {
  const [y, m] = key.split('-').map(Number)
  if (!y || !m) return key
  return new Date(y, m - 1, 1)
    .toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    .toUpperCase()
}

const GIT_RE = /\b[0-9a-f]{7,}\b/g
const GIT_REF_RE = /\(HEAD\s*->\s*[^,)]+\s*(?:,\s*(?:tag:\s*[^)]+|origin\/[^)]+))*\)/g
const GIT_PREFIX_RE = /^\s*\*?\s*(?:[0-9a-f]{7,}\s*)?(?:\([^)]*\)\s*)?\|?\s*/g

function cleanTitle(text) {
  if (!text) return ''
  return text
    .replace(GIT_REF_RE, '')
    .replace(GIT_RE, '')
    .replace(GIT_PREFIX_RE, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function memoryExcerpt(content) {
  if (!content) return ''
  const lines = content.split('\n')
  const humanLines = lines.filter(
    (l) => !/^\s*[|/\\*]/.test(l) && !/^\s*[0-9a-f]{7,}\s/.test(l)
  )
  const text = humanLines.join(' ').replace(/\s{2,}/g, ' ').trim()
  if (!text) return ''
  return text.length > 120 ? text.slice(0, 120).replace(/\s+\S*$/, '') + '…' : text
}

function groupByMonth(list) {
  const groups = {}
  for (const item of list) {
    const key = (item.eventDate || '').slice(0, 7) || 'unknown'
    ;(groups[key] = groups[key] || []).push(item)
  }
  const keys = Object.keys(groups).sort((a, b) => {
    if (a === 'unknown') return 1
    if (b === 'unknown') return -1
    return b.localeCompare(a)
  })
  return { keys, groups }
}

function errorMessage(err) {
  if (err instanceof ApiError) return err.message
  return 'Something went wrong. Please try again.'
}

export default function Journal() {
  const { user } = useAuth()
  const { tab, view, viewId, openRead, closeRead } = useJournalNav()
  const [searchParams, setSearchParams] = useSearchParams()
  const compose = searchParams.get('compose') === '1'
  const filterActive = tab === 'memories'
  const [now] = useState(Date.now)
  const [editor, setEditor] = useState(null)
  const editingId = compose ? 'new' : editor
  const [form, setForm] = useState({ ...EMPTY_FORM, eventDate: todayString() })
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const [savingAs, setSavingAs] = useState('')

  const [memories, setMemories] = useState([])
  const [memMore, setMemMore] = useState(false)
  const [trashed, setTrashed] = useState([])
  const [trashTotal, setTrashTotal] = useState(0)
  const [trashMore, setTrashMore] = useState(false)
  const [loaded, setLoaded] = useState({ memories: false, trash: false })
  const [loadingMore, setLoadingMore] = useState(false)
  const [actionId, setActionId] = useState(null)
  const [openActions, setOpenActions] = useState(null)
  const [pageError, setPageError] = useState('')
  const [toast, setToast] = useState('')
  const [listFilters, setListFilters] = useState({
    field: 'eventDate',
    order: 'desc',
    from: '',
    to: '',
    favoritesOnly: false,
    mood: '',
    tags: [],
    categories: [],
    people: [],
    places: [],
  })
  const [clueFiltersOpen, setClueFiltersOpen] = useState(false)
  const [filterClueInput, setFilterClueInput] = useState({ tags: '', categories: '', people: '', places: '' })
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchMore, setSearchMore] = useState(false)
  const [searchTotal, setSearchTotal] = useState(0)
  const [searchBusy, setSearchBusy] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [loadingMoreSearch, setLoadingMoreSearch] = useState(false)
  const searchTokenRef = useRef(0)
  const contentRef = useRef(null)
  const hideTimerRef = useRef(null)
  const readSectionRef = useRef(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 4000)
    return () => clearTimeout(t)
  }, [toast])

  const buildListQuery = useCallback(
    (offset = 0) => ({
      limit: 50,
      offset,
      sort: listFilters.field,
      order: listFilters.order,
      ...(listFilters.from ? { from: listFilters.from } : {}),
      ...(listFilters.to ? { to: listFilters.to } : {}),
      ...(listFilters.favoritesOnly ? { favorite: true } : {}),
      ...(listFilters.mood ? { mood: listFilters.mood } : {}),
      tag: listFilters.tags.length > 0 ? listFilters.tags : undefined,
      category: listFilters.categories.length > 0 ? listFilters.categories : undefined,
      people: listFilters.people.length > 0 ? listFilters.people : undefined,
      place: listFilters.places.length > 0 ? listFilters.places : undefined,
    }),
    [listFilters],
  )

  const updateListFilter = (key, value) =>
    setListFilters((f) => (f[key] === value ? f : { ...f, [key]: value }))

  const resetListFilters = () =>
    setListFilters({ field: 'eventDate', order: 'desc', from: '', to: '', favoritesOnly: false,
      mood: '', tags: [], categories: [], people: [], places: [] })

  const hasActiveFilters =
    listFilters.field !== 'eventDate' ||
    listFilters.order !== 'desc' ||
    listFilters.from !== '' ||
    listFilters.to !== '' ||
    listFilters.favoritesOnly ||
    listFilters.mood !== '' ||
    listFilters.tags.length > 0 ||
    listFilters.categories.length > 0 ||
    listFilters.people.length > 0 ||
    listFilters.places.length > 0

  const hasClueFilters =
    listFilters.mood !== '' ||
    listFilters.tags.length > 0 ||
    listFilters.categories.length > 0 ||
    listFilters.people.length > 0 ||
    listFilters.places.length > 0

  const viewing = viewId
    ? memories.find((m) => m.id === viewId) || trashed.find((m) => m.id === viewId) || null
    : null
  const viewingHasClues = Boolean(viewing) && Boolean(
    viewing.mood ||
    (viewing.categories && viewing.categories.length > 0) ||
    (viewing.people && viewing.people.length > 0) ||
    (viewing.places && viewing.places.length > 0)
  )

  const [userTags, setUserTags] = useState([])
  const [userTagsLoaded, setUserTagsLoaded] = useState(false)
  const [userTagsLoading, setUserTagsLoading] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const tagInputRef = useRef(null)
  const tagEditorRef = useRef(null)
  const [readTagsOpen, setReadTagsOpen] = useState(false)
  const [readCluesOpen, setReadCluesOpen] = useState(false)
  const [editTagsOpen, setEditTagsOpen] = useState(false)

  const [userCategories, setUserCategories] = useState([])
  const [userCategoriesLoaded, setUserCategoriesLoaded] = useState(false)
  const [userCategoriesLoading, setUserCategoriesLoading] = useState(false)
  const [userPeople, setUserPeople] = useState([])
  const [userPeopleLoaded, setUserPeopleLoaded] = useState(false)
  const [userPeopleLoading, setUserPeopleLoading] = useState(false)
  const [userPlaces, setUserPlaces] = useState([])
  const [userPlacesLoaded, setUserPlacesLoaded] = useState(false)
  const [userPlacesLoading, setUserPlacesLoading] = useState(false)
  const [clueInput, setClueInput] = useState({ categories: '', people: '', places: '' })
  const [editCategoriesOpen, setEditCategoriesOpen] = useState(false)
  const [editPeopleOpen, setEditPeopleOpen] = useState(false)
  const [editPlacesOpen, setEditPlacesOpen] = useState(false)
  const [editMoodOpen, setEditMoodOpen] = useState(false)
  const moodEditorRef = useRef(null)
  const categoriesEditorRef = useRef(null)
  const peopleEditorRef = useRef(null)
  const placesEditorRef = useRef(null)

  // Exactly one metadata selector (mood / categories / people / places / tags)
  // may be open at a time — opening one closes the others.
  const editorPanelSetters = {
    tags: setEditTagsOpen,
    mood: setEditMoodOpen,
    categories: setEditCategoriesOpen,
    people: setEditPeopleOpen,
    places: setEditPlacesOpen,
  }
  const closeAllEditors = () => {
    setEditTagsOpen(false)
    setEditMoodOpen(false)
    setEditCategoriesOpen(false)
    setEditPeopleOpen(false)
    setEditPlacesOpen(false)
  }
  const toggleEditor = (panel) => {
    const isOpen = {
      tags: editTagsOpen,
      mood: editMoodOpen,
      categories: editCategoriesOpen,
      people: editPeopleOpen,
      places: editPlacesOpen,
    }[panel]
    closeAllEditors()
    if (!isOpen) editorPanelSetters[panel](true)
  }

  const autoGrow = () => {
    const el = contentRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  useEffect(() => {
    if (editingId) autoGrow()
  }, [editingId])

  useEffect(() => {
    if ((editingId !== null || viewing || filterActive) && !userTagsLoaded && !userTagsLoading) {
      setUserTagsLoading(true)
      memoryApi.listTags()
        .then((tags) => { setUserTags(tags); setUserTagsLoaded(true) })
        .catch(() => {})
        .finally(() => setUserTagsLoading(false))
    }
  }, [editingId, viewing, filterActive, userTagsLoaded, userTagsLoading])

  useEffect(() => {
    if (!(editingId !== null || viewing || filterActive)) return
    if (!userCategoriesLoaded && !userCategoriesLoading) {
      setUserCategoriesLoading(true)
      memoryApi.listCategories()
        .then((items) => { setUserCategories(items); setUserCategoriesLoaded(true) })
        .catch(() => {})
        .finally(() => setUserCategoriesLoading(false))
    }
    if (!userPeopleLoaded && !userPeopleLoading) {
      setUserPeopleLoading(true)
      memoryApi.listPeople()
        .then((items) => { setUserPeople(items); setUserPeopleLoaded(true) })
        .catch(() => {})
        .finally(() => setUserPeopleLoading(false))
    }
    if (!userPlacesLoaded && !userPlacesLoading) {
      setUserPlacesLoading(true)
      memoryApi.listPlaces()
        .then((items) => { setUserPlaces(items); setUserPlacesLoaded(true) })
        .catch(() => {})
        .finally(() => setUserPlacesLoading(false))
    }
  }, [
    editingId, viewing, filterActive,
    userCategoriesLoaded, userCategoriesLoading,
    userPeopleLoaded, userPeopleLoading,
    userPlacesLoaded, userPlacesLoading,
  ])

  useEffect(() => {
    const openPanel = [
      ['tags', editTagsOpen],
      ['mood', editMoodOpen],
      ['categories', editCategoriesOpen],
      ['people', editPeopleOpen],
      ['places', editPlacesOpen],
    ].find(([, open]) => open)?.[0]
    if (!openPanel) return
    const editorRefs = {
      tags: tagEditorRef,
      mood: moodEditorRef,
      categories: categoriesEditorRef,
      people: peopleEditorRef,
      places: placesEditorRef,
    }
    // Committed on outside-click so half-typed input is never silently lost.
    const flushPending = (panel) => {
      if (panel === 'tags') {
        const pending = (tagInputRef.current?.value || '').trim()
        if (pending && pending.length <= 50) {
          setForm((f) => {
            if (f.tags.some((t) => t.toLowerCase() === pending.toLowerCase()) || f.tags.length >= 50) return f
            return { ...f, tags: [...f.tags, pending] }
          })
          setTagInput('')
        }
      } else if (panel !== 'mood') {
        const pending = (clueInput[panel] || '').trim()
        if (pending) addClue(panel)(pending)
      }
    }
    const handleMouseDown = (e) => {
      const toggleEl = e.target.closest ? e.target.closest('[data-editor-toggle]') : null
      if (toggleEl) {
        // Same toggle: let its own click decide (close), or the close would
        // race the click and immediately reopen. Different toggle: flush the
        // open panel and close so the click can open the other one.
        if (toggleEl.dataset.editorToggle === openPanel) return
        flushPending(openPanel)
        closeAllEditors()
        return
      }
      const ref = editorRefs[openPanel]
      if (ref.current && !ref.current.contains(e.target)) {
        flushPending(openPanel)
        closeAllEditors()
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [editTagsOpen, editMoodOpen, editCategoriesOpen, editPeopleOpen, editPlacesOpen, clueInput, form])

  useEffect(() => {
    if (!viewing || editingId !== null) return
    const html = document.documentElement
    html.classList.add('read-mode')
    const showThenHide = () => {
      html.classList.add('read-controls-visible')
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = setTimeout(() => {
        html.classList.remove('read-controls-visible')
      }, 2500)
    }
    showThenHide()
    return () => {
      clearTimeout(hideTimerRef.current)
      html.classList.remove('read-controls-visible')
      html.classList.remove('read-mode')
    }
  }, [viewing, editingId])

  useEffect(() => {
    const html = document.documentElement
    if (editingId !== null) {
      html.classList.add('lc-editing')
    } else {
      html.classList.remove('lc-editing')
    }
    return () => html.classList.remove('lc-editing')
  }, [editingId])

  const busy = view === 'memories' ? !loaded.memories : !loaded.trash

  const loadMemories = useCallback(async () => {
    setPageError('')
    try {
      const page = await memoryApi.list(buildListQuery())
      setMemories(page.items)
      setMemMore(page.hasMore)
    } catch (err) {
      setPageError(errorMessage(err))
    }
  }, [buildListQuery])

  const loadTrashed = useCallback(async () => {
    setPageError('')
    try {
      const page = await memoryApi.listTrashed()
      setTrashed(page.items)
      setTrashTotal(page.total)
      setTrashMore(page.hasMore)
    } catch (err) {
      setPageError(errorMessage(err))
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const page =
          view === 'memories' ? await memoryApi.list(buildListQuery()) : await memoryApi.listTrashed()
        if (cancelled) return
        if (view === 'memories') {
          setMemories(page.items)
          setMemMore(page.hasMore)
        } else {
          setTrashed(page.items)
          setTrashTotal(page.total)
          setTrashMore(page.hasMore)
        }
      } catch (err) {
        if (!cancelled) setPageError(errorMessage(err))
      } finally {
        if (!cancelled) setLoaded((l) => ({ ...l, [view]: true }))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [view, buildListQuery])

  const loadMoreMemories = async () => {
    setLoadingMore(true)
    try {
      const page = await memoryApi.list(buildListQuery(memories.length))
      setMemories((m) => [...m, ...page.items])
      setMemMore(page.hasMore)
    } catch (err) {
      setPageError(errorMessage(err))
    } finally {
      setLoadingMore(false)
    }
  }

  const loadMoreTrashed = async () => {
    setLoadingMore(true)
    try {
      const page = await memoryApi.listTrashed({ offset: trashed.length })
      setTrashed((t) => [...t, ...page.items])
      setTrashMore(page.hasMore)
    } catch (err) {
      setPageError(errorMessage(err))
    } finally {
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    const q = searchQuery.trim()
    if (q.length < 2) {
      searchTokenRef.current++
      setSearchResults([])
      setSearchMore(false)
      setSearchTotal(0)
      setSearchError('')
      return
    }
    const token = ++searchTokenRef.current
    const timer = setTimeout(async () => {
      setSearchBusy(true)
      setSearchError('')
      try {
        const page = await memoryApi.search({ q })
        if (searchTokenRef.current !== token) return
        setSearchResults(page.items)
        setSearchMore(page.hasMore)
        setSearchTotal(page.total)
      } catch (err) {
        if (searchTokenRef.current !== token) return
        setSearchError(errorMessage(err))
      } finally {
        if (searchTokenRef.current === token) setSearchBusy(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const loadMoreSearch = async () => {
    setLoadingMoreSearch(true)
    setSearchError('')
    try {
      const page = await memoryApi.search({ q: searchQuery.trim(), offset: searchResults.length })
      setSearchResults((r) => [...r, ...page.items])
      setSearchMore(page.hasMore)
    } catch (err) {
      setSearchError(errorMessage(err))
    } finally {
      setLoadingMoreSearch(false)
    }
  }

  const resetEditor = () => {
    setEditor(null)
    setForm({ ...EMPTY_FORM, eventDate: todayString() })
    setSaveError('')
    setTagInput('')
    setEditTagsOpen(false)
    setEditMoodOpen(false)
    setEditCategoriesOpen(false)
    setEditPeopleOpen(false)
    setEditPlacesOpen(false)
    setClueInput({ categories: '', people: '', places: '' })
  }

  const resetEditorRef = useRef(null)
  resetEditorRef.current = resetEditor

  useEffect(() => {
    const discardDraft = () => resetEditorRef.current && resetEditorRef.current()
    window.addEventListener('lifeclues:discard-draft', discardDraft)
    return () => window.removeEventListener('lifeclues:discard-draft', discardDraft)
  }, [])

  const openEditor = () => {
    setSaveError('')
    setTagInput('')
    setEditTagsOpen(false)
    setEditMoodOpen(false)
    setEditCategoriesOpen(false)
    setEditPeopleOpen(false)
    setEditPlacesOpen(false)
    setClueInput({ categories: '', people: '', places: '' })
    setEditor('new')
  }

  useEffect(() => {
    if (!compose) return
    openEditor()
    // The editor scrolls back to its start (also covers mobile, where the
    // previous tab may have left the window scrolled deep into a list).
    window.scrollTo({ top: 0 })
    const params = new URLSearchParams(searchParams)
    params.delete('compose')
    setSearchParams(params, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compose])

  const setField = (key) => (event) => {
    setForm((f) => ({ ...f, [key]: event.target.value }))
  }

  const tagSuggestions = tagInput.trim().length > 0
    ? userTags.filter(
        (t) =>
          t.name.toLowerCase().includes(tagInput.trim().toLowerCase()) &&
          !form.tags.some((existing) => existing.toLowerCase() === t.name.toLowerCase())
      )
    : []

  const addTag = (name) => {
    const trimmed = name.trim()
    if (!trimmed || trimmed.length > 50) return
    if (form.tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) return
    if (form.tags.length >= 50) return
    setForm((f) => ({ ...f, tags: [...f.tags, trimmed] }))
    setTagInput('')
  }

  const removeTag = (index) => {
    setForm((f) => ({ ...f, tags: f.tags.filter((_, i) => i !== index) }))
  }

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(tagInput)
    } else if (e.key === 'Backspace' && tagInput === '' && form.tags.length > 0) {
      removeTag(form.tags.length - 1)
    }
  }

  const setClue = (key) => (value) => setClueInput((s) => ({ ...s, [key]: value }))

  const addClue = (key) => (name) => {
    const trimmed = name.trim()
    if (!trimmed || trimmed.length > 50) return
    if (form[key].some((v) => v.toLowerCase() === trimmed.toLowerCase())) return
    if (form[key].length >= 50) return
    setForm((f) => ({ ...f, [key]: [...f[key], trimmed] }))
    setClueInput((s) => ({ ...s, [key]: '' }))
  }

  const removeClue = (key) => (index) => {
    setForm((f) => ({ ...f, [key]: f[key].filter((_, i) => i !== index) }))
  }

  const clueSuggestions = (key, userList) =>
    clueInput[key].trim().length > 0
      ? userList.filter(
          (item) =>
            item.name.toLowerCase().includes(clueInput[key].trim().toLowerCase()) &&
            !form[key].some((existing) => existing.toLowerCase() === item.name.toLowerCase())
        )
      : []

  const iconToggleButton = (open, active, onClick, title, label, Icon) => (
    <button
      type="button"
      onClick={onClick}
      data-editor-toggle={label}
      className={`flex size-7 shrink-0 items-center justify-center rounded-full transition-colors ${active ? 'text-accent hover:bg-accent-soft' : 'text-ink-faint hover:bg-surface-2 hover:text-ink'}`}
      title={`${open ? 'Hide' : 'Show'} ${title}`}
      aria-label={`Toggle ${label}`}
      aria-pressed={open}
    >
      <Icon className="size-4" aria-hidden />
    </button>
  )

  const clueEditor = (key, userList, placeholder, editorRef) => {
    const values = form[key] || []
    const input = (clueInput[key] || '').trimStart()
    const suggestions = clueSuggestions(key, userList)
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault()
        addClue(key)(input)
      } else if (e.key === 'Backspace' && input === '' && values.length > 0) {
        removeClue(key)(values.length - 1)
      }
    }
    return (
      <div ref={editorRef} className="relative">
        <div className="flex flex-wrap items-center gap-1.5 rounded-card border border-line bg-transparent px-3 py-2 lc-themed">
          {values.map((v, i) => (
            <span
              key={`${v}-${i}`}
              className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent"
            >
              {v}
              <button
                type="button"
                onClick={() => removeClue(key)(i)}
                className="ml-0.5 text-accent/60 hover:text-accent"
                aria-label={`Remove ${v}`}
              >
                ×
              </button>
            </span>
          ))}
          {values.length < 50 && (
            <input
              type="text"
              value={clueInput[key]}
              onChange={(e) => setClue(key)(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => { if (input) addClue(key)(input) }}
              placeholder={values.length === 0 ? placeholder : ''}
              className="min-w-[120px] flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
            />
          )}
        </div>
        {suggestions.length > 0 && (
          <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded-card border border-line bg-surface py-1 shadow-card lc-themed">
            {suggestions.slice(0, 10).map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); addClue(key)(s.name) }}
                  onTouchStart={(e) => { e.preventDefault(); addClue(key)(s.name) }}
                  className="w-full px-3 py-1.5 text-left text-sm text-ink-soft hover:bg-surface-2 hover:text-ink"
                >
                  {s.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  const clueFilterEditor = (key, userList, placeholder) => {
    const values = listFilters[key] || []
    const input = (filterClueInput[key] || '').trim()
    const suggestions = input.length > 0
      ? userList.filter(
          (item) =>
            item.name.toLowerCase().includes(input.toLowerCase()) &&
            !values.some((existing) => existing.toLowerCase() === item.name.toLowerCase())
        )
      : []
    const add = (name) => {
      const trimmed = name.trim()
      if (!trimmed || trimmed.length > 50) return
      if (values.some((v) => v.toLowerCase() === trimmed.toLowerCase())) return
      updateListFilter(key, [...values, trimmed])
      setFilterClueInput((s) => ({ ...s, [key]: '' }))
    }
    const remove = (index) => updateListFilter(key, values.filter((_, i) => i !== index))
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault()
        add(input)
      } else if (e.key === 'Backspace' && input === '' && values.length > 0) {
        remove(values.length - 1)
      }
    }
    return (
      <div className="relative w-full min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 rounded-soft border border-line-strong bg-surface px-2.5 py-1.5">
          {values.map((v, i) => (
            <span
              key={`${v}-${i}`}
              className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent"
            >
              {v}
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label={`Remove ${v}`}
                className="ml-0.5 text-accent/60 hover:text-accent"
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            value={filterClueInput[key]}
            onChange={(e) => setFilterClueInput((s) => ({ ...s, [key]: e.target.value }))}
            onKeyDown={handleKeyDown}
            onBlur={() => { if (input) add(input) }}
            placeholder={values.length === 0 ? placeholder : ''}
            className="min-w-[120px] flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
          />
        </div>
        {suggestions.length > 0 && (
          <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded-soft border border-line bg-surface py-1 shadow-card lc-themed">
            {suggestions.slice(0, 10).map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); add(s.name) }}
                  onTouchStart={(e) => { e.preventDefault(); add(s.name) }}
                  className="w-full px-3 py-1.5 text-left text-sm text-ink-soft hover:bg-surface-2 hover:text-ink"
                >
                  {s.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  const startEdit = (memory) => {
    setEditor(memory.id)
    setSaveError('')
    setTagInput('')
    setEditTagsOpen(false)
    setEditMoodOpen(false)
    setEditCategoriesOpen(false)
    setEditPeopleOpen(false)
    setEditPlacesOpen(false)
    setClueInput({ categories: '', people: '', places: '' })
    setForm({
      eventDate: memory.eventDate,
      eventTime: memory.eventTime ? memory.eventTime.slice(0, 5) : '',
      title: memory.title ?? '',
      content: memory.content,
      tags: memory.tags ? memory.tags.map((t) => t.name) : [],
      mood: memory.mood ?? '',
      categories: memory.categories ? memory.categories.map((c) => c.name) : [],
      people: memory.people ? memory.people.map((p) => p.name) : [],
      places: memory.places ? memory.places.map((p) => p.name) : [],
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const viewMemory = (memory) => {
    openRead(memory.id)
    setReadTagsOpen(false)
    setReadCluesOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const saveMemory = async (status) => {
    if (!form.eventDate) {
      setSaveError('Choose the date this memory belongs to.')
      return
    }
    if (!form.content.trim()) {
      setSaveError('Write a little something first.')
      return
    }
    if (status === 'COMPLETED' && form.tags.length === 0) {
      setSaveError('Add at least one tag before completing this memory.')
      return
    }
    if (form.tags.length > 50) {
      setSaveError('Maximum 50 tags per memory.')
      return
    }
    setSaving(true)
    setSavingAs(status)
    setSaveError('')
    const payload = {
      eventDate: form.eventDate,
      eventTime: form.eventTime || undefined,
      title: form.title.trim() || undefined,
      content: form.content.trim(),
      status,
      // Always send the clue lists (as arrays) and mood (or null) so that
      // clearing a field on edit actually removes it server-side.
      tags: form.tags,
      mood: form.mood || null,
      categories: form.categories,
      people: form.people,
      places: form.places,
    }
    try {
      if (editingId && editingId !== 'new') {
        await memoryApi.update(editingId, payload)
      } else {
        await memoryApi.create(payload)
      }
      const newTagNames = form.tags.filter(
        (name) => !userTags.some((t) => t.name.toLowerCase() === name.toLowerCase())
      )
      if (newTagNames.length > 0) {
        setUserTags((prev) =>
          [...prev, ...newTagNames.map((name) => ({ id: name, name }))]
            .sort((a, b) => a.name.localeCompare(b.name))
        )
      }
      const knownClue = (list, name) => list.some((item) => item.name.toLowerCase() === name.toLowerCase())
      if (form.categories.some((name) => !knownClue(userCategories, name))) {
        setUserCategories((prev) =>
          [...prev, ...form.categories.filter((name) => !knownClue(prev, name)).map((name) => ({ id: name, name }))]
            .sort((a, b) => a.name.localeCompare(b.name))
        )
      }
      if (form.people.some((name) => !knownClue(userPeople, name))) {
        setUserPeople((prev) =>
          [...prev, ...form.people.filter((name) => !knownClue(prev, name)).map((name) => ({ id: name, name }))]
            .sort((a, b) => a.name.localeCompare(b.name))
        )
      }
      if (form.places.some((name) => !knownClue(userPlaces, name))) {
        setUserPlaces((prev) =>
          [...prev, ...form.places.filter((name) => !knownClue(prev, name)).map((name) => ({ id: name, name }))]
            .sort((a, b) => a.name.localeCompare(b.name))
        )
      }
      resetEditor()
      await loadMemories()
    } catch (err) {
      setSaveError(errorMessage(err))
    } finally {
      setSaving(false)
      setSavingAs('')
    }
  }

  const handleTrash = async (memory) => {
    setActionId(memory.id)
    setOpenActions(null)
    try {
      await memoryApi.trash(memory.id)
      await loadMemories()
    } catch (err) {
      setPageError(errorMessage(err))
    } finally {
      setActionId(null)
    }
  }

  const handleRestore = async (memory) => {
    setActionId(memory.id)
    try {
      await memoryApi.restore(memory.id)
      await loadTrashed()
    } catch (err) {
      setPageError(errorMessage(err))
    } finally {
      setActionId(null)
    }
  }

  const handlePermanentDelete = async (memory) => {
    if (!window.confirm('Delete this memory forever? This cannot be undone.')) return
    setActionId(memory.id)
    try {
      await memoryApi.permanentDelete(memory.id)
      await loadTrashed()
    } catch (err) {
      setPageError(errorMessage(err))
    } finally {
      setActionId(null)
    }
  }

  const handleEmptyTrash = async () => {
    if (!window.confirm('Empty the Trash? Everything in it is gone for good.')) return
    setActionId('empty')
    try {
      await memoryApi.emptyTrash()
      await loadTrashed()
    } catch (err) {
      setPageError(errorMessage(err))
    } finally {
      setActionId(null)
    }
  }

  const toggleFlag = async (memory, key) => {
    const flagId = `${memory.id}:${key}`
    setActionId(flagId)
    try {
      const updated = await memoryApi.updateFlags(memory.id, {
        favorite: key === 'favorite' ? !memory.favorite : !!memory.favorite,
        pinned: key === 'pinned' ? !memory.pinned : !!memory.pinned,
      })
      setMemories((ms) => ms.map((m) => (m.id === memory.id ? updated : m)))
      setTrashed((ts) => ts.map((m) => (m.id === memory.id ? updated : m)))
    } catch (err) {
      setToast(errorMessage(err))
    } finally {
      setActionId(null)
    }
  }

  const flagBusy = (memory, key) => actionId === `${memory.id}:${key}`

  const drafts = memories.filter((m) => m.status === 'DRAFT')
  const completed = memories.filter((m) => m.status === 'COMPLETED')
  const pinned = [...completed]
    .filter((m) => m.pinned)
    .sort((a, b) => new Date(b.pinnedAt || 0) - new Date(a.pinnedAt || 0))
  const archived = completed.filter((m) => !m.pinned)
  const hasDrafts = drafts.length > 0
  const hasCompleted = completed.length > 0

  const overflowButton = (memory) => (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpenActions((cur) => (cur === memory.id ? null : memory.id)) }}
        aria-label="Memory actions"
        title="More"
        className={`flex size-6 -m-2 shrink-0 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-surface-2 hover:text-ink focus-visible:opacity-100 sm:size-7 sm:m-0 sm:opacity-0 sm:group-hover:opacity-100 ${
          openActions === memory.id ? 'bg-surface-2 text-ink sm:opacity-100' : ''
        }`}
      >
        <MoreHorizontal className="size-4" aria-hidden />
      </button>
      {openActions === memory.id && (
        <>
          <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setOpenActions(null) }} aria-hidden />
          <div className="absolute right-0 top-full z-50 mt-2 w-44 rounded-card border border-line bg-surface p-1 shadow-card lc-themed">
            {memory.status !== 'DRAFT' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setOpenActions(null)
                  startEdit(memory)
                }}
                aria-label="Edit memory"
                title="Edit"
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <Pencil className="size-3.5" aria-hidden />
                Edit
              </button>
            )}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleTrash(memory) }}
              aria-label="Move to Trash"
              title="Move to Trash"
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-ink-soft transition-colors hover:bg-surface-2 hover:text-danger"
            >
              <Trash2 className="size-3.5" aria-hidden />
              Move to Trash
            </button>
            {memory.status !== 'TRASHED' && (
              <>
                <div className="my-1 h-px bg-line" aria-hidden />
                <button
                  type="button"
                  disabled={flagBusy(memory, 'favorite')}
                  onClick={(e) => { e.stopPropagation(); setOpenActions(null); toggleFlag(memory, 'favorite') }}
                  aria-label={memory.favorite ? 'Remove from favorites' : 'Add to favorites'}
                  title={memory.favorite ? 'Unfavorite' : 'Favorite'}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink disabled:opacity-60"
                >
                  <Heart className={`size-3.5 ${memory.favorite ? 'fill-current text-sienna' : ''}`} aria-hidden />
                  {memory.favorite ? 'Unfavorite' : 'Favorite'}
                </button>
                <button
                  type="button"
                  disabled={flagBusy(memory, 'pinned')}
                  onClick={(e) => { e.stopPropagation(); setOpenActions(null); toggleFlag(memory, 'pinned') }}
                  aria-label={memory.pinned ? 'Unpin memory' : 'Pin memory'}
                  title={memory.pinned ? 'Unpin' : 'Pin'}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink disabled:opacity-60"
                >
                  <Pin className={`size-3.5 ${memory.pinned ? 'fill-current text-accent' : ''}`} aria-hidden />
                  {memory.pinned ? 'Unpin' : 'Pin'}
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )

  const memoryMeta = (memory) => (
    <p className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-plxmono text-[11px] text-ink-faint">
      {memory.eventTime && (
        <span className="uppercase tracking-[0.12em]">{formatTime(memory.eventTime, user?.timeFormat)}</span>
      )}
      {memory.status === 'DRAFT' && (
        <span className="font-medium text-sienna">
          Draft{memory.updatedAt ? ` · updated ${timeAgo(memory.updatedAt)}` : ''}
        </span>
      )}
      {memory.favorite && <Heart className="size-3 fill-current text-sienna" aria-label="Favorite" />}
      {memory.pinned && <Pin className="size-3 fill-current" aria-label="Pinned" />}
    </p>
  )

  const clueChipsRow = (memory, className = 'mt-2') => {
    const chips = []
    if (memory.mood) chips.push({ Icon: Smile, text: moodLabel(memory.mood), key: `mood-${memory.mood}` })
    ;(memory.categories || []).forEach((c) =>
      chips.push({ Icon: Folder, text: c.name, key: c.id || `cat-${c.name}` })
    )
    ;(memory.people || []).forEach((p) =>
      chips.push({ Icon: Users, text: p.name, key: p.id || `person-${p.name}` })
    )
    ;(memory.places || []).forEach((p) =>
      chips.push({ Icon: MapPin, text: p.name, key: p.id || `place-${p.name}` })
    )
    if (chips.length === 0) return null
    return (
      <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
        {chips.map((chip) => {
          const Icon = chip.Icon
          return (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1 rounded-full border border-line bg-surface-2 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-ink-soft"
            >
              <Icon className="size-3" aria-hidden />
              {chip.text}
            </span>
          )
        })}
      </div>
    )
  }

  const memoryEntry = (memory, quiet) => {
    const parts = dayParts(memory.eventDate)
    const displayTitle = cleanTitle(memory.title) || 'Untitled memory'
    const excerpt = memoryExcerpt(memory.content)
    const isDraft = memory.status === 'DRAFT'
    return (
      <article
        key={memory.id}
        className={`group relative ${isDraft ? 'cursor-pointer' : quiet ? '' : 'cursor-pointer rounded-card transition-colors hover:bg-surface/50'}`}
        onClick={isDraft ? () => startEdit(memory) : !quiet ? () => viewMemory(memory) : undefined}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (isDraft) startEdit(memory); else if (!quiet) viewMemory(memory) } }}
        role={isDraft || !quiet ? 'button' : undefined}
        tabIndex={isDraft || !quiet ? 0 : undefined}
      >
        <div className={`flex gap-4 sm:gap-7 ${quiet ? '' : 'py-1 -mx-3 px-3'}`}>
          <div className="w-12 shrink-0 sm:w-14">
            {parts ? (
              <>
                <div
                  className={`font-display font-medium leading-none text-ink ${
                    quiet ? 'text-2xl' : 'text-4xl'
                  }`}
                >
                  {parts.day}
                </div>
                <div className="mt-1.5 font-plxmono text-[9.5px] font-medium uppercase tracking-[0.16em] text-ink-faint">
                  {parts.weekday}
                </div>
              </>
            ) : (
              <div className="font-plxmono text-[9.5px] font-medium uppercase tracking-[0.16em] text-ink-faint">
                later
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <h3
                className={`break-words font-hand leading-[1.15] transition-colors ${
                  quiet
                    ? 'text-lg font-medium leading-snug text-ink-faint'
                    : 'text-[26px] font-medium text-ink sm:text-[28px]'
                }`}
              >
                {displayTitle}
              </h3>
              {overflowButton(memory)}
            </div>
            {excerpt && (
              <p
                className={`mt-2 whitespace-pre-wrap break-words ${
                  quiet
                    ? 'line-clamp-2 text-sm leading-relaxed text-ink-faint/70'
                    : 'line-clamp-4 text-base leading-relaxed text-ink-soft'
                }`}
              >
                {excerpt}
              </p>
            )}
            {memoryMeta(memory)}
            {clueChipsRow(memory)}
          </div>
        </div>
        <div className="mt-7 h-px bg-line" aria-hidden />
      </article>
    )
  }


  const editorCard = (
    <section className="pb-2">
      {editingId !== 'new' && (
        <div className="mb-5 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-accent-soft text-accent lc-themed">
            <PenLine className="size-5" aria-hidden />
          </span>
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">
              Edit memory
            </h2>
            <p className="text-xs text-ink-soft">
              Anything can change — this is your memory.
            </p>
          </div>
        </div>
      )}

      {saveError && <Alert variant="error" className="mb-5">{saveError}</Alert>}

      <div className="space-y-4">
        <div className="flex flex-wrap items-baseline gap-x-2 font-plxmono text-sm text-ink sm:text-base">
          <div
            role="group"
            aria-label="Event date and time"
            className="flex flex-wrap items-baseline gap-x-2"
          >
            <div className="group relative inline-flex items-baseline">
              <span
                aria-hidden
                className="cursor-pointer underline-offset-4 group-hover:underline group-focus-within:underline"
              >
                {formatLongDate(form.eventDate) || 'Add a date'}
              </span>
              <input
                id="eventDate"
                type="date"
                required
                tabIndex={0}
                value={form.eventDate}
                onChange={setField('eventDate')}
                aria-label="Event date"
                className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent p-0 opacity-0"
                onMouseDown={(e) => {
                  e.preventDefault()
                  const el = e.currentTarget
                  el.focus()
                  if (typeof el.showPicker === 'function') {
                    try { el.showPicker() } catch { el.focus() }
                  }
                }}
              />
            </div>
            {form.eventTime && <span className="text-ink-faint" aria-hidden>·</span>}
            <div className="group relative inline-flex items-baseline">
              <span
                aria-hidden
                className="cursor-pointer underline-offset-4 group-hover:underline group-focus-within:underline"
              >
                {form.eventTime ? formatTime(form.eventTime, user?.timeFormat) : 'Add time'}
              </span>
              <input
                id="eventTime"
                type="time"
                tabIndex={0}
                value={form.eventTime}
                onChange={setField('eventTime')}
                aria-label="Event time"
                className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent p-0 opacity-0"
                onMouseDown={(e) => {
                  e.preventDefault()
                  const el = e.currentTarget
                  el.focus()
                  if (typeof el.showPicker === 'function') {
                    try { el.showPicker() } catch { el.focus() }
                  }
                }}
              />
            </div>
          </div>
          <span className="ms-auto flex items-center gap-0.5">
            {iconToggleButton(
              editMoodOpen,
              Boolean(form.mood),
              () => toggleEditor('mood'),
              'mood',
              'mood',
              Smile
            )}
            {iconToggleButton(
              editCategoriesOpen,
              form.categories.length > 0,
              () => toggleEditor('categories'),
              'category tags',
              'categories',
              Folder
            )}
            {iconToggleButton(
              editPeopleOpen,
              form.people.length > 0,
              () => toggleEditor('people'),
              'people tags',
              'people',
              Users
            )}
            {iconToggleButton(
              editPlacesOpen,
              form.places.length > 0,
              () => toggleEditor('places'),
              'place tags',
              'places',
              MapPin
            )}
            {/* Tags are the original taxonomy; keep them at the end so the new clue toggles stay grouped. */}
            {iconToggleButton(
              editTagsOpen,
              form.tags.length > 0,
              () => toggleEditor('tags'),
              'tags',
              'tags',
              Tag
            )}
          </span>
        </div>

        {editTagsOpen && (
          <div ref={tagEditorRef} className="relative">
            <div className="flex flex-wrap items-center gap-1.5 rounded-card border border-line bg-transparent px-3 py-2 lc-themed">
              {form.tags.map((tag, i) => (
                <span
                  key={`${tag}-${i}`}
                  className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(i)}
                    className="ml-0.5 text-accent/60 hover:text-accent"
                    aria-label={`Remove ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              {form.tags.length < 50 && (
                <input
                  ref={tagInputRef}
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onBlur={() => {
                    setTimeout(() => {
                      const pending = (tagInputRef.current?.value || '').trim()
                      if (pending && pending.length <= 50) {
                        addTag(pending)
                      }
                    }, 0)
                  }}
                  placeholder={form.tags.length === 0 ? 'Add tags…' : ''}
                  className="min-w-[120px] flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
                />
              )}
            </div>
            {tagSuggestions.length > 0 && (
              <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded-card border border-line bg-surface py-1 shadow-card lc-themed">
                {tagSuggestions.slice(0, 10).map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); addTag(t.name) }}
                      onTouchStart={(e) => { e.preventDefault(); addTag(t.name) }}
                      className="w-full px-3 py-1.5 text-left text-sm text-ink-soft hover:bg-surface-2 hover:text-ink"
                    >
                      {t.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {editMoodOpen && (
          <div ref={moodEditorRef} className="flex flex-wrap items-center gap-1.5">
            {MOODS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setForm((f) => ({ ...f, mood: f.mood === m ? '' : m }))}
                aria-pressed={form.mood === m}
                className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                  form.mood === m
                    ? 'bg-accent-soft text-accent ring-1 ring-accent'
                    : 'border border-line bg-transparent text-ink-soft hover:bg-surface-2 hover:text-ink'
                }`}
              >
                {moodLabel(m)}
              </button>
            ))}
          </div>
        )}
        {editCategoriesOpen && clueEditor('categories', userCategories, 'Add category tags…', categoriesEditorRef)}
        {editPeopleOpen && clueEditor('people', userPeople, 'Add people tags…', peopleEditorRef)}
        {editPlacesOpen && clueEditor('places', userPlaces, 'Add place tags…', placesEditorRef)}

        <Field
          id="title"
          hint={<span className="hidden sm:inline">Leave it blank and we'll write one from your words.</span>}
        >
          <input
            id="title"
            type="text"
            maxLength={120}
            value={form.title}
            onChange={setField('title')}
            placeholder="Title"
            className="w-full bg-transparent p-0 font-display text-2xl font-medium leading-tight text-ink placeholder:text-ink-faint focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:text-3xl"
          />
        </Field>

        {form.content.length > 9500 && (
          <div className="flex justify-end">
            <span className="text-xs text-ink-faint">{form.content.length}/10000</span>
          </div>
        )}
        <textarea
          id="content"
          ref={contentRef}
          rows={20}
          maxLength={10000}
          className="w-full resize-none overflow-hidden bg-transparent p-0 font-display text-xl leading-[1.9] text-ink break-words placeholder:italic placeholder:text-ink-faint focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          placeholder="What stayed with you today?"
          value={form.content}
          onChange={(e) => { setField('content')(e); autoGrow() }}
          onInput={autoGrow}
        />
        <div className="h-[160px]" aria-hidden />
      </div>
    </section>
  )

  const editorActions = (
    <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-line bg-paper/90 pb-[env(safe-area-inset-bottom)] backdrop-blur lc-themed lg:bottom-6 lg:left-[calc(50%+7.5rem)] lg:right-auto lg:w-full lg:max-w-2xl lg:-translate-x-1/2 lg:rounded-card lg:border lg:pb-2">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-end gap-2 px-4 sm:px-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={resetEditor}
          disabled={saving}
          className="text-ink-faint hover:text-ink"
        >
          Cancel
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => saveMemory('DRAFT')}
          loading={saving && savingAs === 'DRAFT'}
          disabled={saving}
        >
          Save draft
        </Button>
        <Button
          size="sm"
          onClick={() => saveMemory('COMPLETED')}
          loading={saving && savingAs === 'COMPLETED'}
          disabled={saving}
        >
          Complete
        </Button>
      </div>
    </div>
  )

  const readView = viewing && (() => {
    return (
      <section
        ref={readSectionRef}
        className="pb-2"
        onMouseMove={() => {
          const html = document.documentElement
          html.classList.add('read-controls-visible')
          clearTimeout(hideTimerRef.current)
          hideTimerRef.current = setTimeout(() => {
            html.classList.remove('read-controls-visible')
          }, 2500)
        }}
        onTouchStart={() => {
          const html = document.documentElement
          html.classList.add('read-controls-visible')
          clearTimeout(hideTimerRef.current)
          hideTimerRef.current = setTimeout(() => {
            html.classList.remove('read-controls-visible')
          }, 2500)
        }}
      >
        <div className="mb-5 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-accent-soft text-accent lc-themed">
            <BookOpen className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-xl font-semibold text-ink">Read memory</h2>
            <div className="flex items-center justify-between gap-2">
              <p className="min-w-0 font-plxmono text-[11px] uppercase tracking-[0.12em] text-ink-soft">
                {formatLongDate(viewing.eventDate)}{viewing.eventTime ? ` · ${formatTime(viewing.eventTime, user?.timeFormat)}` : ''}
              </p>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  disabled={flagBusy(viewing, 'favorite')}
                  onClick={() => toggleFlag(viewing, 'favorite')}
                  aria-label={viewing.favorite ? 'Remove from favorites' : 'Add to favorites'}
                  aria-pressed={!!viewing.favorite}
                  title={viewing.favorite ? 'Unfavorite' : 'Favorite'}
                  className={`flex size-7 items-center justify-center rounded-full transition-colors disabled:opacity-60 ${
                    viewing.favorite
                      ? 'text-sienna hover:bg-sienna-soft'
                      : 'text-ink-faint hover:bg-surface-2 hover:text-ink'
                  }`}
                >
                  <Heart className={`size-4 ${viewing.favorite ? 'fill-current' : ''}`} aria-hidden />
                </button>
                <button
                  type="button"
                  disabled={flagBusy(viewing, 'pinned')}
                  onClick={() => toggleFlag(viewing, 'pinned')}
                  aria-label={viewing.pinned ? 'Unpin memory' : 'Pin memory'}
                  aria-pressed={!!viewing.pinned}
                  title={viewing.pinned ? 'Unpin' : 'Pin'}
                  className={`flex size-7 items-center justify-center rounded-full transition-colors disabled:opacity-60 ${
                    viewing.pinned
                      ? 'text-accent hover:bg-accent-soft'
                      : 'text-ink-faint hover:bg-surface-2 hover:text-ink'
                  }`}
                >
                  <Pin className={`size-4 ${viewing.pinned ? 'fill-current' : ''}`} aria-hidden />
                </button>
                {viewing.tags?.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setReadTagsOpen((o) => !o)}
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full transition-colors ${
                      readTagsOpen
                        ? 'text-accent hover:bg-accent-soft'
                        : 'text-ink-faint hover:bg-surface-2 hover:text-ink'
                    }`}
                    title={readTagsOpen ? 'Hide tags' : 'Show tags'}
                    aria-label="Toggle tags"
                  >
                    <Tag className="size-4" aria-hidden />
                  </button>
                )}
                {viewingHasClues && (
                  <button
                    type="button"
                    onClick={() => setReadCluesOpen((o) => !o)}
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full transition-colors ${
                      readCluesOpen
                        ? 'text-accent hover:bg-accent-soft'
                        : 'text-ink-faint hover:bg-surface-2 hover:text-ink'
                    }`}
                    title={readCluesOpen ? 'Hide clues' : 'Show clues'}
                    aria-label="Toggle clues"
                  >
                    <Smile className="size-4" aria-hidden />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {readTagsOpen && viewing.tags?.length > 0 && (
          <p className="mb-4 text-sm text-ink-faint">
            {viewing.tags.map((t) => t.name).join(' · ')}
          </p>
        )}

        {readCluesOpen && clueChipsRow(viewing, 'mb-4')}

        <div className="space-y-4">
          <h3 className="font-hand text-4xl font-medium leading-[1.1] text-ink sm:text-5xl">
            {cleanTitle(viewing.title) || 'Untitled memory'}
          </h3>
          <div className="whitespace-pre-wrap break-words font-display text-xl leading-[1.9] text-ink">
            {viewing.content}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={closeRead}>
            <ArrowLeft className="size-4" aria-hidden />
            Back
          </Button>
          <Button variant="outline" size="sm" onClick={() => { closeRead(); startEdit(viewing) }}>
            <Pencil className="size-4" aria-hidden />
            Edit
          </Button>
        </div>
      </section>
    )
  })()

  const archivedSection = (key, groups) => {
    const label = key === 'unknown' ? 'MEMORY' : monthLabel(key)
    const entries = groups[key]
    return (
      <section key={key} className="mb-14">
        <div className="mb-8 flex items-center gap-4">
          <h2 className="shrink-0 font-plxmono text-[11px] font-medium uppercase tracking-[0.2em] text-ink-faint">
            {label}
          </h2>
          <span className="h-px flex-1 bg-line-strong" aria-hidden />
        </div>
        <div className="space-y-9">{entries.map((m) => memoryEntry(m, false))}</div>
      </section>
    )
  }


  const recentClues = [
    ...new Set(
      completed
        .flatMap((m) => m.tags?.map((t) => t.name) ?? [])
        .map((n) => n.toLowerCase())
    ),
  ].slice(0, 6)

  const weekAgo = now - 7 * 24 * 60 * 60 * 1000
  const thisWeek = completed.filter((m) => {
    const t = m.eventDate ? new Date(`${m.eventDate}T00:00:00`).getTime() : NaN
    return !Number.isNaN(t) && t >= weekAgo
  })
  const latest = (thisWeek.length > 0 ? thisWeek : completed).slice(0, 3)

  const homeView = (
    <div className="mx-auto max-w-2xl">
      {hasCompleted || hasDrafts ? (
        <div>
          <p className="font-plxmono text-[10px] uppercase tracking-[0.22em] text-sienna">
            {todayMonoLine()}
          </p>
          <h1 className="mt-3 font-hand text-4xl font-medium leading-[1.1] text-ink sm:text-5xl">
            What stayed with you today?
          </h1>
          <button
            type="button"
            onClick={openEditor}
            className="group mt-5 inline-flex items-center gap-2.5"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-ink shadow-soft transition-transform group-hover:scale-105">
              <Feather className="size-5" aria-hidden />
            </span>
            <span className="font-display text-base font-medium text-ink-soft transition-colors group-hover:text-ink">
              Write a memory
            </span>
          </button>

          <div className="mt-6 flex flex-wrap gap-x-4 gap-y-1 font-plxmono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            <span>{completed.length} {completed.length === 1 ? 'memory' : 'memories'}</span>
            {hasDrafts && <span>{drafts.length} {drafts.length === 1 ? 'draft' : 'drafts'}</span>}
          </div>

          {latest.length > 0 && (
            <div className="mt-10">
              <div className="mb-6 flex items-center gap-4">
                <h2 className="shrink-0 font-plxmono text-[11px] font-medium uppercase tracking-[0.2em] text-ink-faint">
                  {thisWeek.length > 0 ? 'This week' : 'Latest'}
                </h2>
                <span className="h-px flex-1 bg-line-strong" aria-hidden />
              </div>
              <div className="space-y-9">{latest.map((m) => memoryEntry(m, false))}</div>
            </div>
          )}

          {recentClues.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center gap-2">
              {recentClues.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-line bg-surface px-2.5 py-1 font-plxmono text-[10px] uppercase tracking-[0.12em] text-ink-soft"
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex min-h-[70dvh] flex-col items-center justify-center px-6 text-center">
          <p className="font-plxmono text-[10px] uppercase tracking-[0.22em] text-sienna">
            {todayMonoLine()}
          </p>
          <h1 className="mt-4 font-hand text-5xl font-medium leading-[1.05] text-ink">
            What happened today?
          </h1>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">
            No memory is too small. Write it down now, and you'll never have to wonder again.
          </p>
          <button
            type="button"
            onClick={openEditor}
            className="group mt-8 inline-flex items-center gap-2.5"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-accent text-accent-ink shadow-card transition-transform group-hover:scale-105">
              <Feather className="size-5" aria-hidden />
            </span>
            <span className="font-display text-lg text-ink-soft transition-colors group-hover:text-ink">
              Write a memory
            </span>
          </button>
        </div>
      )}
    </div>
  )

  const memoriesView = (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        eyebrow="Journal"
        title="Memories"
        subtitle="Moments worth remembering."
      />

      <div
        role="group"
        aria-label="Sort and filter memories"
        className="mt-6 flex flex-wrap items-end gap-x-4 gap-y-3 border-t border-dashed border-line pt-4"
      >
        <label className="flex flex-col gap-1.5">
          <span className="font-plxmono text-[10px] uppercase tracking-[0.16em] text-ink-faint">Sort by</span>
          <select
            value={listFilters.field}
            onChange={(e) => updateListFilter('field', e.target.value)}
            className={filterControlClass}
          >
            <option value="eventDate">Event date</option>
            <option value="createdAt">Date created</option>
            <option value="updatedAt">Last edited</option>
            <option value="eventTime">Event time</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-plxmono text-[10px] uppercase tracking-[0.16em] text-ink-faint">Order</span>
          <select
            value={listFilters.order}
            onChange={(e) => updateListFilter('order', e.target.value)}
            className={filterControlClass}
          >
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-plxmono text-[10px] uppercase tracking-[0.16em] text-ink-faint">From</span>
          <input
            type="date"
            value={listFilters.from}
            onChange={(e) => updateListFilter('from', e.target.value)}
            className={filterControlClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-plxmono text-[10px] uppercase tracking-[0.16em] text-ink-faint">To</span>
          <input
            type="date"
            value={listFilters.to}
            onChange={(e) => updateListFilter('to', e.target.value)}
            className={filterControlClass}
          />
        </label>

        <button
          type="button"
          onClick={() => updateListFilter('favoritesOnly', !listFilters.favoritesOnly)}
          aria-pressed={listFilters.favoritesOnly}
          className={`flex items-center gap-1.5 rounded-soft border px-3 py-2 text-sm transition-colors ${
            listFilters.favoritesOnly
              ? 'border-sienna/50 bg-sienna-soft text-ink'
              : 'border-line-strong bg-surface text-ink-soft hover:text-ink'
          }`}
        >
          <Heart className={`size-4 ${listFilters.favoritesOnly ? 'fill-current text-sienna' : ''}`} aria-hidden />
          Favorites only
        </button>

        <button
          type="button"
          onClick={() => setClueFiltersOpen((o) => !o)}
          aria-pressed={clueFiltersOpen}
          aria-expanded={clueFiltersOpen}
          className={`flex items-center gap-1.5 rounded-soft border px-3 py-2 text-sm transition-colors ${
            clueFiltersOpen || hasClueFilters
              ? 'border-accent/50 bg-accent-soft text-ink'
              : 'border-line-strong bg-surface text-ink-soft hover:text-ink'
          }`}
        >
          <SlidersHorizontal className="size-4" aria-hidden />
          Clues
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetListFilters}
            className="font-plxmono text-[10px] uppercase tracking-[0.14em] text-sienna transition-colors hover:text-ink"
          >
            Clear filters
          </button>
        )}

        {clueFiltersOpen && (
          <div className="w-full space-y-4 border-t border-dashed border-line pt-4">
            <div className="flex flex-wrap gap-1.5">
              {MOODS.map((m) => {
                const active = listFilters.mood === m
                return (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={active}
                    onClick={() => updateListFilter('mood', active ? '' : m)}
                    className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors ${
                      active
                        ? 'border-sienna/50 bg-sienna-soft text-ink'
                        : 'border-line-strong bg-surface text-ink-soft hover:text-ink'
                    }`}
                  >
                    {active && <Smile className="size-3" aria-hidden />}
                    {moodLabel(m)}
                  </button>
                )
              })}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>{clueFilterEditor('tags', userTags, 'Filter by tag…')}</div>
              <div>{clueFilterEditor('categories', userCategories, 'Filter by category…')}</div>
              <div>{clueFilterEditor('people', userPeople, 'Filter by people…')}</div>
              <div>{clueFilterEditor('places', userPlaces, 'Filter by place…')}</div>
            </div>
          </div>
        )}
      </div>

      {archived.length > 0 && (
        <p className="mb-2 mt-1 font-plxmono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
          {archived.length} {archived.length === 1 ? 'memory' : 'memories'}
          {memMore ? ' and more' : ''}
        </p>
      )}

      {pageError && <Alert variant="error" className="my-6">{pageError}</Alert>}

      {pinned.length > 0 && (
        <div className="mb-10">
          <div className="mb-2 flex items-center gap-4">
            <h2 className="shrink-0 font-plxmono text-[11px] font-medium uppercase tracking-[0.2em] text-accent">
              Pinned
            </h2>
            <span className="h-px flex-1 bg-line-strong" aria-hidden />
          </div>
          <div className="space-y-9">{pinned.map((m) => memoryEntry(m, false))}</div>
        </div>
      )}

      <div>
        {busy ? (
          <div className="space-y-10 py-4" aria-hidden>
            <div className="space-y-6">
              <div className="lc-skeleton h-4 w-32" />
              <div className="lc-skeleton h-3 w-2/3" />
              <div className="lc-skeleton h-3 w-1/2" />
              <div className="lc-skeleton h-3 w-3/4" />
            </div>
            <div className="space-y-6">
              <div className="lc-skeleton h-4 w-36" />
              <div className="lc-skeleton h-3 w-3/4" />
              <div className="lc-skeleton h-3 w-1/3" />
            </div>
          </div>
        ) : hasCompleted ? (() => {
          const months = groupByMonth(archived)
          return months.keys.map((key) => archivedSection(key, months.groups))
        })() : (
          <div className="py-14 text-center">
            <h2 className="font-hand text-3xl font-medium leading-tight text-ink">
              {hasActiveFilters
                ? (hasClueFilters ? 'No clues to match.' : (listFilters.favoritesOnly ? 'No favorites yet.' : 'No matches.'))
                : 'Nothing here yet.'}
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
              {hasActiveFilters
                ? (hasClueFilters
                    ? 'No memory carries every clue you asked for. Remove a clue or choose another mood to widen the list.'
                    : (listFilters.favoritesOnly
                        ? 'Tap the heart on any memory, then come back to gather your favorites here.'
                        : 'No memories match these filters. Adjust or clear them to widen the list.'))
                : 'The first page of your book is still blank. Write a memory and it will live here.'}
            </p>
          </div>
        )}

        {memMore && !busy && (
          <div className="flex justify-center pt-6">
            <Button variant="ghost" onClick={loadMoreMemories} loading={loadingMore} className="text-ink-soft">
              Show more memories
            </Button>
          </div>
        )}
      </div>
    </div>
  )

  const draftsView = (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        eyebrow="Journal"
        title="Drafts"
        subtitle="A memory still taking shape."
      />

      {hasDrafts && (
        <p className="mb-2 mt-1 font-plxmono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
          {drafts.length} {drafts.length === 1 ? 'draft' : 'drafts'}
        </p>
      )}

      {pageError && <Alert variant="error" className="my-6">{pageError}</Alert>}

      <div>
        {busy ? (
          <div className="space-y-10 py-4" aria-hidden>
            <div className="space-y-6">
              <div className="lc-skeleton h-4 w-28" />
              <div className="lc-skeleton h-3 w-2/3" />
              <div className="lc-skeleton h-3 w-1/2" />
            </div>
            <div className="space-y-6">
              <div className="lc-skeleton h-4 w-40" />
              <div className="lc-skeleton h-3 w-3/4" />
              <div className="lc-skeleton h-3 w-2/5" />
            </div>
          </div>
        ) : hasDrafts ? (
          <div className="space-y-9">{drafts.map((m) => memoryEntry(m, true))}</div>
        ) : (
          <div className="py-14 text-center">
            <h2 className="font-hand text-3xl font-medium leading-tight text-ink">
              Nothing here yet.
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
              Start a memory and save it as a draft — it will wait here for you.
            </p>
          </div>
        )}
      </div>
    </div>
  )

  const searchView = (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        eyebrow="Journal"
        title="Search"
        subtitle="Turn over a clue and the memory comes back."
      />

      <section aria-label="Search your memories" className="rounded-card border border-line bg-surface p-6 shadow-soft lc-themed sm:p-8">
        <div className="flex items-center gap-3">
          <Search className="size-5 shrink-0 text-sienna" aria-hidden />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your memories…"
            aria-label="Search your memories"
            autoComplete="off"
            maxLength={120}
            className="w-full bg-transparent py-1 font-display text-xl font-medium leading-tight text-ink placeholder:text-ink-faint focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:text-2xl"
          />
          {searchQuery.length > 0 && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="shrink-0 rounded-full p-1 text-ink-faint transition-colors hover:text-ink"
            >
              <X className="size-4" aria-hidden />
            </button>
          )}
        </div>
        {searchQuery.trim().length === 0 && (
          <p className="mt-3 pl-8 text-sm leading-relaxed text-ink-soft">
            Search by a word in your memories, or a clue you remember — a tag, person, place or category. Put
            {' '}
            <span className="font-medium text-ink">+</span>
            {' '}
            before a word to require it (e.g. rainy +Mumbai).
          </p>
        )}
        {searchQuery.trim().length === 1 && (
          <p className="mt-3 pl-8 text-sm leading-relaxed text-ink-soft">Keep typing to search…</p>
        )}
      </section>

      {searchError && <Alert variant="error" className="my-6">{searchError}</Alert>}

      <div className="mt-8">
        {searchBusy ? (
          <div className="space-y-10 py-4" aria-hidden>
            <div className="space-y-6">
              <div className="lc-skeleton h-4 w-32" />
              <div className="lc-skeleton h-3 w-2/3" />
              <div className="lc-skeleton h-3 w-1/2" />
              <div className="lc-skeleton h-3 w-3/4" />
            </div>
            <div className="space-y-6">
              <div className="lc-skeleton h-4 w-36" />
              <div className="lc-skeleton h-3 w-3/4" />
              <div className="lc-skeleton h-3 w-1/3" />
            </div>
          </div>
        ) : searchQuery.trim().length >= 2 && searchResults.length > 0 ? (
          <>
            {searchTotal > 0 && (
              <p className="mb-2 mt-1 font-plxmono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                {searchTotal} {searchTotal === 1 ? 'memory' : 'memories'} found
                {searchMore ? ' and more' : ''}
              </p>
            )}
            <div className="space-y-9">{searchResults.map((m) => memoryEntry(m, false))}</div>
            {searchMore && (
              <div className="mt-8 flex justify-center">
                <Button variant="ghost" onClick={loadMoreSearch} loading={loadingMoreSearch} className="text-ink-soft">
                  Show more
                </Button>
              </div>
            )}
          </>
        ) : searchQuery.trim().length >= 2 ? (
          <div className="py-14 text-center">
            <h2 className="font-hand text-3xl font-medium leading-tight text-ink">
              No memories match “{searchQuery.trim()}”.
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
              Try a shorter word, or search by what you remember — a tag, person, place or category.
            </p>
          </div>
        ) : (
          <div className="py-14 text-center" aria-hidden>
            <h2 className="font-hand text-3xl font-medium leading-tight text-ink">Every memory has a clue.</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
              coffee · Hyderabad · interview — turn any of them back into the memory.
            </p>
          </div>
        )}
      </div>
    </div>
  )

  const trashView = (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        eyebrow="Journal"
        title="Trash"
        subtitle="Trashed memories stay here for 30 days before disappearing."
      />

      {trashTotal > 0 && (
        <div className="-mt-2 mb-6 flex justify-end">
          <Button
            variant="ghost"
            onClick={handleEmptyTrash}
            loading={actionId === 'empty'}
            className="text-xs text-danger"
          >
            Empty trash
          </Button>
        </div>
      )}

      {pageError && <Alert variant="error" className="mt-6">{pageError}</Alert>}

      <div className="mt-8">
        {busy ? (
          <div className="flex justify-center py-16 text-ink-faint">
            <Spinner className="size-6" />
          </div>
        ) : trashed.length === 0 ? (
          <div className="py-16 text-center">
            <span className="mx-auto mb-6 flex size-10 items-center justify-center rounded-full text-sienna">
              <Trash2 className="size-5" aria-hidden />
            </span>
            <h2 className="font-hand text-3xl font-medium text-ink">Trash is empty.</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
              Memories you delete will rest here before saying goodbye.
            </p>
          </div>
        ) : (
          <div className="space-y-9">
            {trashed.map((memory) => {
              const parts = dayParts(memory.eventDate)
              return (
                <article key={memory.id} className="group relative">
                  <div className="flex gap-4 sm:gap-7">
                    <div className="w-12 shrink-0 sm:w-14">
                      {parts ? (
                        <>
                          <div className="font-display text-3xl leading-none text-ink">
                            {parts.day}
                          </div>
                          <div className="mt-1.5 font-plxmono text-[9.5px] font-medium uppercase tracking-[0.16em] text-ink-faint">
                            {parts.weekday}
                          </div>
                        </>
                      ) : (
                        <div className="font-plxmono text-[9.5px] font-medium uppercase tracking-[0.16em] text-ink-faint">
                          later
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mt-1 flex items-start justify-between gap-2">
                        <h3 className="break-words font-display text-base font-medium leading-snug text-ink">
                          {memory.title || 'Untitled memory'}
                        </h3>
                        <div className="flex shrink-0 items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => handleRestore(memory)}
                            disabled={actionId === memory.id}
                            aria-label="Restore memory"
                            title="Restore"
                            className="flex size-8 shrink-0 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-surface-2 hover:text-ink disabled:opacity-50"
                          >
                            <RotateCcw className="size-4" aria-hidden />
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePermanentDelete(memory)}
                            disabled={actionId === memory.id}
                            aria-label="Delete forever"
                            title="Delete forever"
                            className="flex size-8 shrink-0 items-center justify-center rounded-full text-danger transition-colors hover:bg-danger-soft disabled:opacity-50"
                          >
                            <Trash2 className="size-4" aria-hidden />
                          </button>
                        </div>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-ink-soft line-clamp-3">
                        {memory.content}
                      </p>
                    </div>
                  </div>
                  <div className="mt-7 h-px bg-line" aria-hidden />
                </article>
              )
            })}

            {trashMore && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="ghost"
                  onClick={loadMoreTrashed}
                  loading={loadingMore}
                  className="text-ink-soft"
                >
                  Show more trash
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )

  const toastView = toast && (
    <div
      role="alert"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 sm:bottom-6 sm:justify-end sm:pr-6"
    >
      <div className="pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-soft border border-danger/40 bg-danger-soft px-4 py-3 text-sm leading-relaxed text-danger-ink shadow-lg">
        <AlertCircle className="size-5 shrink-0" aria-hidden />
        <div className="min-w-0 flex-1">{toast}</div>
        <button
          type="button"
          onClick={() => setToast('')}
          aria-label="Dismiss message"
          className="shrink-0 text-danger-ink/70 transition-colors hover:text-danger-ink"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  )

  if (editingId !== null) return <>{editorCard}{editorActions}{toastView}<div className="pb-32" /></>
  if (view === 'trash') return <>{trashView}{toastView}<div className="pb-20" /></>
  if (viewing) return <>{readView}{toastView}<div className="pb-20" /></>
  if (tab === 'home') return <>{homeView}{toastView}<div className="pb-20" /></>
  if (tab === 'memories') return <>{memoriesView}{toastView}<div className="pb-20" /></>
  if (tab === 'drafts') return <>{draftsView}{toastView}<div className="pb-20" /></>
  if (tab === 'search') return <>{searchView}{toastView}<div className="pb-20" /></>
  return <>{homeView}{toastView}<div className="pb-20" /></>
}