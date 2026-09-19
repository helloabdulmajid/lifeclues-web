import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  BookOpen,
  Feather,
  Heart,
  MoreHorizontal,
  Pencil,
  PenLine,
  Pin,
  RotateCcw,
  Search,
  Tag,
  Trash2,
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

const EMPTY_FORM = { eventDate: '', eventTime: '', title: '', content: '', tags: [] }

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
  const { tab, view } = useJournalNav()
  const [now] = useState(Date.now)
  const [editor, setEditor] = useState(null)
  const [viewing, setViewing] = useState(null)
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
  const contentRef = useRef(null)
  const [readControlsVisible, setReadControlsVisible] = useState(true)
  const hideTimerRef = useRef(null)
  const readSectionRef = useRef(null)

  const [userTags, setUserTags] = useState([])
  const [userTagsLoaded, setUserTagsLoaded] = useState(false)
  const [userTagsLoading, setUserTagsLoading] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const tagInputRef = useRef(null)
  const tagEditorRef = useRef(null)
  const [readTagsOpen, setReadTagsOpen] = useState(false)
  const [editTagsOpen, setEditTagsOpen] = useState(false)

  const autoGrow = () => {
    const el = contentRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  useEffect(() => {
    if (editor) autoGrow()
  }, [editor])

  useEffect(() => {
    if ((editor !== null || viewing) && !userTagsLoaded && !userTagsLoading) {
      setUserTagsLoading(true)
      memoryApi.listTags()
        .then((tags) => { setUserTags(tags); setUserTagsLoaded(true) })
        .catch(() => {})
        .finally(() => setUserTagsLoading(false))
    }
  }, [editor, viewing, userTagsLoaded, userTagsLoading])

  useEffect(() => {
    if (!editTagsOpen) return
    const handleMouseDown = (e) => {
      if (tagEditorRef.current && !tagEditorRef.current.contains(e.target)) {
        const pending = (tagInputRef.current?.value || '').trim()
        if (pending && pending.length <= 50) {
          setForm((f) => {
            if (f.tags.some((t) => t.toLowerCase() === pending.toLowerCase()) || f.tags.length >= 50) return f
            return { ...f, tags: [...f.tags, pending] }
          })
          setTagInput('')
        }
        setEditTagsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [editTagsOpen])

  useEffect(() => {
    if (!viewing) return
    const html = document.documentElement
    html.classList.add('read-mode')
    const showThenHide = () => {
      setReadControlsVisible(true)
      html.classList.add('read-controls-visible')
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = setTimeout(() => {
        setReadControlsVisible(false)
        html.classList.remove('read-controls-visible')
      }, 2500)
    }
    showThenHide()
    return () => {
      clearTimeout(hideTimerRef.current)
      html.classList.remove('read-controls-visible')
      html.classList.remove('read-mode')
    }
  }, [viewing])

  const busy = view === 'memories' ? !loaded.memories : !loaded.trash

  const loadMemories = useCallback(async () => {
    setPageError('')
    try {
      const page = await memoryApi.list()
      setMemories(page.items)
      setMemMore(page.hasMore)
    } catch (err) {
      setPageError(errorMessage(err))
    }
  }, [])

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
          view === 'memories' ? await memoryApi.list() : await memoryApi.listTrashed()
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
  }, [view])

  const loadMoreMemories = async () => {
    setLoadingMore(true)
    try {
      const page = await memoryApi.list({ offset: memories.length })
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

  const resetEditor = () => {
    setEditor(null)
    setViewing(null)
    setForm({ ...EMPTY_FORM, eventDate: todayString() })
    setSaveError('')
    setTagInput('')
    setEditTagsOpen(false)
  }

  const openEditor = () => {
    setSaveError('')
    setViewing(null)
    setTagInput('')
    setEditTagsOpen(false)
    setEditor('new')
  }

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

  const startEdit = (memory) => {
    setEditor(memory.id)
    setViewing(null)
    setSaveError('')
    setTagInput('')
    setEditTagsOpen(false)
    setForm({
      eventDate: memory.eventDate,
      eventTime: memory.eventTime ? memory.eventTime.slice(0, 5) : '',
      title: memory.title ?? '',
      content: memory.content,
      tags: memory.tags ? memory.tags.map((t) => t.name) : [],
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const viewMemory = (memory) => {
    setViewing(memory)
    setReadTagsOpen(false)
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
      tags: form.tags.length > 0 ? form.tags : undefined,
    }
    try {
      if (editor && editor !== 'new') {
        await memoryApi.update(editor, payload)
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

  const drafts = memories.filter((m) => m.status === 'DRAFT')
  const completed = memories.filter((m) => m.status === 'COMPLETED')
  const hasDrafts = drafts.length > 0
  const hasCompleted = completed.length > 0

  const overflowButton = (memory) => (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpenActions((cur) => (cur === memory.id ? null : memory.id)) }}
        aria-label="Memory actions"
        title="More"
        className={`flex size-7 shrink-0 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-surface-2 hover:text-ink focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 ${
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
          </div>
        </div>
        <div className="mt-7 h-px bg-line" aria-hidden />
      </article>
    )
  }


  const editorCard = (
    <section className="pb-2">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-accent-soft text-accent lc-themed">
          <PenLine className="size-5" aria-hidden />
        </span>
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">
            {editor === 'new' ? 'Write a memory' : 'Edit memory'}
          </h2>
          {editor !== 'new' && (
            <p className="text-xs text-ink-soft">
              Anything can change — this is your memory.
            </p>
          )}
        </div>
      </div>

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
          <span className="ms-auto flex items-center">
            <button
              type="button"
              onClick={() => setEditTagsOpen((o) => !o)}
              className={`flex size-7 shrink-0 items-center justify-center rounded-full transition-colors ${
                form.tags.length > 0
                  ? 'text-accent hover:bg-accent-soft'
                  : 'text-ink-faint hover:bg-surface-2 hover:text-ink'
              }`}
              title={editTagsOpen ? 'Hide tags' : 'Show tags'}
              aria-label="Toggle tags"
            >
              <Tag className="size-4" aria-hidden />
            </button>
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

        <Field
          id="title"
          hint="Leave it blank and we'll write one from your words."
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
    <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-line bg-paper/90 backdrop-blur lc-themed lg:left-[calc(50%+7.5rem)] lg:right-auto lg:w-full lg:max-w-2xl lg:-translate-x-1/2 lg:rounded-card lg:border lg:pb-2">
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
          setReadControlsVisible(true)
          html.classList.add('read-controls-visible')
          clearTimeout(hideTimerRef.current)
          hideTimerRef.current = setTimeout(() => {
            setReadControlsVisible(false)
            html.classList.remove('read-controls-visible')
          }, 2500)
        }}
        onTouchStart={() => {
          const html = document.documentElement
          setReadControlsVisible(true)
          html.classList.add('read-controls-visible')
          clearTimeout(hideTimerRef.current)
          hideTimerRef.current = setTimeout(() => {
            setReadControlsVisible(false)
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
            <div className="flex items-center justify-between">
              <p className="font-plxmono text-[11px] uppercase tracking-[0.12em] text-ink-soft">
                {formatLongDate(viewing.eventDate)}{viewing.eventTime ? ` · ${formatTime(viewing.eventTime, user?.timeFormat)}` : ''}
              </p>
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
            </div>
          </div>
        </div>

        {readTagsOpen && viewing.tags?.length > 0 && (
          <p className="mb-4 text-sm text-ink-faint">
            {viewing.tags.map((t) => t.name).join(' · ')}
          </p>
        )}

        <div className="space-y-4">
          <h3 className="font-hand text-4xl font-medium leading-[1.1] text-ink sm:text-5xl">
            {cleanTitle(viewing.title) || 'Untitled memory'}
          </h3>
          <div className="whitespace-pre-wrap break-words font-display text-xl leading-[1.9] text-ink">
            {viewing.content}
          </div>
        </div>

        <div className={`mt-8 flex items-center justify-between gap-2 transition-opacity duration-300 ${readControlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <Button variant="ghost" size="sm" onClick={() => setViewing(null)}>
            <ArrowLeft className="size-4" aria-hidden />
            Back
          </Button>
          <Button variant="outline" size="sm" onClick={() => { setViewing(null); startEdit(viewing) }}>
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

      {pageError && <Alert variant="error" className="my-6">{pageError}</Alert>}

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
          const months = groupByMonth(completed)
          return months.keys.map((key) => archivedSection(key, months.groups))
        })() : (
          <div className="py-14 text-center">
            <h2 className="font-hand text-3xl font-medium leading-tight text-ink">
              Nothing here yet.
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
              The first page of your book is still blank. Write a memory and it will
              live here.
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

      <section aria-label="Recall a memory" className="rounded-card border border-line bg-surface p-6 shadow-soft lc-themed sm:p-8">
        <div className="flex items-center gap-3">
          <Search className="size-5 shrink-0 text-sienna" aria-hidden />
          <span className="font-hand text-3xl font-medium leading-tight text-ink">
            What do you remember?
          </span>
        </div>
        <p className="mt-2 pl-8 text-sm leading-relaxed text-ink-soft">
          Search your memories using the clues you remember.
        </p>
        <div className="mt-5 border-t border-dashed border-line pt-4" aria-hidden>
          <p className="font-caveat text-lg leading-relaxed text-ink-faint">
            coffee · Hyderabad · interview
            <br />
            walking · that red apartment · Rahul
          </p>
        </div>
      </section>
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

  if (view === 'trash') return <>{trashView}<div className="pb-20" /></>
  if (viewing) return <>{readView}<div className="pb-20" /></>
  if (editor !== null) return <>{editorCard}{editorActions}<div className="pb-32" /></>
  if (tab === 'home') return <>{homeView}<div className="pb-20" /></>
  if (tab === 'memories') return <>{memoriesView}<div className="pb-20" /></>
  if (tab === 'drafts') return <>{draftsView}<div className="pb-20" /></>
  if (tab === 'search') return <>{searchView}<div className="pb-20" /></>
  return <>{homeView}<div className="pb-20" /></>
}