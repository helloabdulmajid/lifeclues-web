import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, Feather, Pencil, PenLine, RotateCcw, Trash2 } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { memoryApi } from '../api/client'
import { ApiError } from '../api/http'
import Button from '../ui/Button'
import Alert from '../ui/Alert'
import Spinner from '../ui/Spinner'
import { Field, TextField, inputClass } from '../ui/Field'

const EMPTY_FORM = { eventDate: '', eventTime: '', title: '', content: '' }

function todayString() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function formatDate(value) {
  if (!value) return ''
  const [y, m, d] = value.split('-').map(Number)
  if (!y || !m || !d) return value
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatTime(value) {
  if (!value) return ''
  const [h, min] = value.split(':')
  if (h === undefined || min === undefined) return value
  const d = new Date()
  d.setHours(Number(h), Number(min))
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

function errorMessage(err) {
  if (err instanceof ApiError) return err.message
  return 'Something went wrong. Please try again.'
}

export default function Journal() {
  const { user } = useAuth()
  const name = user?.displayName?.trim() || user?.username || 'there'

  const [view, setView] = useState('memories')
  const [editor, setEditor] = useState(null)
  const [form, setForm] = useState({ ...EMPTY_FORM, eventDate: todayString() })
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const [savingAs, setSavingAs] = useState('')

  const [memories, setMemories] = useState([])
  const [memTotal, setMemTotal] = useState(0)
  const [memMore, setMemMore] = useState(false)
  const [trashed, setTrashed] = useState([])
  const [trashTotal, setTrashTotal] = useState(0)
  const [trashMore, setTrashMore] = useState(false)
  const [loaded, setLoaded] = useState({ memories: false, trash: false })
  const [loadingMore, setLoadingMore] = useState(false)
  const [actionId, setActionId] = useState(null)
  const [pageError, setPageError] = useState('')

  const busy = view === 'memories' ? !loaded.memories : !loaded.trash

  const loadMemories = useCallback(async () => {
    setPageError('')
    try {
      const page = await memoryApi.list()
      setMemories(page.items)
      setMemTotal(page.total)
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
          setMemTotal(page.total)
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
    setForm({ ...EMPTY_FORM, eventDate: todayString() })
    setSaveError('')
  }

  const setField = (key) => (event) => {
    setForm((f) => ({ ...f, [key]: event.target.value }))
  }

  const startEdit = (memory) => {
    setEditor(memory.id)
    setSaveError('')
    setForm({
      eventDate: memory.eventDate,
      eventTime: memory.eventTime ? memory.eventTime.slice(0, 5) : '',
      title: memory.title ?? '',
      content: memory.content,
    })
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
    setSaving(true)
    setSavingAs(status)
    setSaveError('')
    const payload = {
      eventDate: form.eventDate,
      eventTime: form.eventTime || undefined,
      title: form.title.trim() || undefined,
      content: form.content.trim(),
      status,
    }
    try {
      if (editor && editor !== 'new') {
        await memoryApi.update(editor, payload)
      } else {
        await memoryApi.create(payload)
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

  const iconButton = (label, classes) =>
    `flex size-9 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink-soft transition-colors hover:border-line-strong hover:text-ink disabled:opacity-50 ${classes ?? ''}`

  const draftBadge = (
    <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent lc-themed">
      Draft
    </span>
  )

  const editorCard = (
    <section className="rounded-card border border-line bg-surface p-5 shadow-card lc-themed sm:p-7">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-accent-soft text-accent lc-themed">
          <PenLine className="size-5" aria-hidden />
        </span>
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">
            {editor ? 'Edit memory' : 'Write a memory'}
          </h2>
          <p className="text-xs text-ink-soft">
            {editor
              ? 'Anything can change — this is your memory.'
              : 'Two minutes is enough. No pressure.'}
          </p>
        </div>
      </div>

      {saveError && <Alert variant="error" className="mb-5">{saveError}</Alert>}

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Event date"
            id="eventDate"
            type="date"
            required
            value={form.eventDate}
            onChange={setField('eventDate')}
          />
          <TextField
            label="Event time (optional)"
            id="eventTime"
            type="time"
            value={form.eventTime}
            onChange={setField('eventTime')}
          />
        </div>

        <TextField
          label="Title (optional)"
          id="title"
          maxLength={120}
          hint="Leave it blank and we'll write one from your words."
          value={form.title}
          onChange={setField('title')}
        />

        <Field
          label="Your memory"
          id="content"
          counter={`${form.content.length}/10000`}
        >
          <textarea
            id="content"
            rows={7}
            maxLength={10000}
            className={`${inputClass()} resize-y leading-relaxed`}
            placeholder="What stayed with you today?"
            value={form.content}
            onChange={setField('content')}
          />
        </Field>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button variant="ghost" onClick={resetEditor} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={() => saveMemory('DRAFT')}
            loading={saving && savingAs === 'DRAFT'}
            disabled={saving}
          >
            Save draft
          </Button>
          <Button
            onClick={() => saveMemory('COMPLETED')}
            loading={saving && savingAs === 'COMPLETED'}
            disabled={saving}
          >
            Complete
          </Button>
        </div>
      </div>
    </section>
  )

  const writeTrigger = (
    <button
      type="button"
      onClick={() => {
        setSaveError('')
        setEditor('new')
      }}
      className="group flex w-full items-center justify-between gap-3 rounded-card border border-dashed border-line-strong bg-surface px-5 py-5 text-left transition-colors hover:border-accent lc-themed"
    >
      <span className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-accent-soft text-accent lc-themed">
          <PenLine className="size-5" aria-hidden />
        </span>
        <span>
          <span className="block text-sm font-semibold text-ink">Write a memory</span>
          <span className="block text-xs text-ink-soft">
            A date, a line or two. That's it.
          </span>
        </span>
      </span>
      <span className="text-ink-faint transition-colors group-hover:text-accent">+</span>
    </button>
  )

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="break-words font-display text-4xl font-semibold tracking-tight text-ink">
          Hello, {name}.
        </h1>
        {view === 'memories' ? (
          <button
            type="button"
            onClick={() => setView('trash')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
          >
            <Trash2 className="size-4" aria-hidden />
            {trashTotal > 0 ? `Trash · ${trashTotal}` : 'Trash'}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setView('memories')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to memories
          </button>
        )}
      </div>

      {pageError && <Alert variant="error" className="mt-6">{pageError}</Alert>}

      {view === 'memories' && (
        <>
          <div className="mt-8">{editor !== null ? editorCard : writeTrigger}</div>

          <div className="mt-10">
            {busy ? (
              <div className="flex justify-center py-16 text-ink-faint">
                <Spinner className="size-6" />
              </div>
            ) : memories.length === 0 ? (
              <div className="rounded-card border border-line bg-surface p-8 text-center shadow-soft lc-themed">
                <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent lc-themed">
                  <Feather className="size-6" aria-hidden />
                </span>
                <h2 className="font-display text-xl font-semibold text-ink">No memories yet</h2>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
                  Write the smallest thing you remember — a smell, a phrase, a feeling. They add up.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-faint">
                  {memTotal} {memTotal === 1 ? 'memory' : 'memories'}
                </h2>
                {memories.map((m) => (
                  <article
                    key={m.id}
                    className="rounded-card border border-line bg-surface p-5 shadow-soft lc-themed sm:p-6"
                  >
                    <header className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                          {formatDate(m.eventDate)}
                          {m.eventTime ? ` · ${formatTime(m.eventTime)}` : ''}
                        </p>
                        <h3 className="mt-1 break-words font-display text-xl font-semibold text-ink">
                          {m.title || 'Untitled memory'}
                        </h3>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        {m.status === 'DRAFT' && draftBadge}
                        <button
                          type="button"
                          onClick={() => startEdit(m)}
                          disabled={actionId === m.id}
                          aria-label="Edit memory"
                          title="Edit"
                          className={iconButton()}
                        >
                          <Pencil className="size-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTrash(m)}
                          disabled={actionId === m.id}
                          aria-label="Move to Trash"
                          title="Move to Trash"
                          className={iconButton()}
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </button>
                      </div>
                    </header>
                    <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-ink-soft line-clamp-3">
                      {m.content}
                    </p>
                  </article>
                ))}

                {memMore && (
                  <div className="flex justify-center pt-2">
                    <Button variant="outline" onClick={loadMoreMemories} loading={loadingMore}>
                      Show more
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {view === 'trash' && (
        <div className="mt-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">Trash</h2>
              <p className="text-xs text-ink-soft">
                Trashed memories stay here for 30 days before disappearing.
              </p>
            </div>
            {trashTotal > 0 && (
              <Button
                variant="ghost"
                onClick={handleEmptyTrash}
                loading={actionId === 'empty'}
                className="text-danger"
              >
                <Trash2 className="size-4" aria-hidden />
                Empty trash
              </Button>
            )}
          </div>

          {busy ? (
            <div className="flex justify-center py-16 text-ink-faint">
              <Spinner className="size-6" />
            </div>
          ) : trashed.length === 0 ? (
            <div className="rounded-card border border-line bg-surface p-8 text-center shadow-soft lc-themed">
              <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-surface-2 text-ink-faint">
                <Trash2 className="size-6" aria-hidden />
              </span>
              <h3 className="font-display text-lg font-semibold text-ink">Trash is empty</h3>
              <p className="mt-2 text-sm text-ink-soft">
                Memories you delete will rest here before saying goodbye.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {trashed.map((m) => (
                <div
                  key={m.id}
                  className="flex items-start gap-3 rounded-card border border-line bg-surface p-4 shadow-soft lc-themed sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                      {formatDate(m.eventDate)}
                    </p>
                    <p className="mt-0.5 break-words text-sm font-semibold text-ink">
                      {m.title || 'Untitled memory'}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-ink-soft">{m.content}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleRestore(m)}
                      disabled={actionId === m.id}
                      aria-label="Restore memory"
                      title="Restore"
                      className={iconButton()}
                    >
                      <RotateCcw className="size-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePermanentDelete(m)}
                      disabled={actionId === m.id}
                      aria-label="Delete forever"
                      title="Delete forever"
                      className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-danger transition-colors hover:border-danger hover:bg-danger-soft disabled:opacity-50"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </div>
                </div>
              ))}

              {trashMore && (
                <div className="flex justify-center pt-2">
                  <Button variant="outline" onClick={loadMoreTrashed} loading={loadingMore}>
                    Show more
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}