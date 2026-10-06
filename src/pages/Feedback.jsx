import { useRef, useState } from 'react'
import { Bug, CheckCircle2, ImagePlus, Lightbulb, MessageSquare, Rocket, Send, X } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { feedbackApi } from '../api/client'
import { ApiError } from '../api/http'
import Alert from '../ui/Alert'
import Button from '../ui/Button'
import { Field, TextField, inputClass } from '../ui/Field'

const CATEGORIES = [
  { value: 'BUG', label: 'Bug Report', Icon: Bug },
  { value: 'SUGGESTION', label: 'Suggestion', Icon: Lightbulb },
  { value: 'FEATURE_REQUEST', label: 'Feature Request', Icon: Rocket },
  { value: 'GENERAL', label: 'General Feedback', Icon: MessageSquare },
]

// Category-aware confirmation — never over-promises (no "will be fixed"/"will be built").
const CONFIRMATION = {
  BUG: {
    heading: 'Bug report received',
    message: 'Thanks for reporting this issue. We will review it and investigate what went wrong.',
  },
  SUGGESTION: {
    heading: 'Suggestion received',
    message: 'Thanks for sharing your idea. Your feedback helps us improve LifeClues.',
  },
  FEATURE_REQUEST: {
    heading: 'Feature request received',
    message: 'Thanks for helping shape what is next. We will review your request.',
  },
  GENERAL: {
    heading: 'Feedback received',
    message: 'Thanks for taking the time to share your thoughts with us.',
  },
}

// Honest notification states — never claims an email was sent unless it was.
// Base sentence reflects the actual notificationStatus from the backend.
const NOTIFICATION_HINT = {
  SENT: 'Your feedback was saved and our team was notified.',
  LOGGED: 'Your feedback has been saved and is waiting in our review queue.',
  FAILED:
    'Your feedback was saved. The email notification could not be sent, but your report is stored and will be reviewed.',
  PENDING: 'Your feedback has been saved.',
}

// Appended only when the user actually left a contact email — the team
// notification being sent never implies the user will be emailed automatically.
const FOLLOW_UP_HINT = " If we need to follow up, we'll use the email you provided."

// Category-aware "submit another" labels (our enum: BUG, GENERAL).
const ANOTHER_LABEL = {
  BUG: 'Submit another bug report',
  SUGGESTION: 'Submit another suggestion',
  FEATURE_REQUEST: 'Submit another feature request',
  GENERAL: 'Submit more feedback',
}

const MIN_DESCRIPTION = 20
const MAX_DESCRIPTION = 5000

const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024

const emptyForm = () => ({
  category: '',
  subject: '',
  description: '',
  reproductionSteps: '',
  contactEmail: '',
})

export default function Feedback() {
  const { user } = useAuth()
  const fileInputRef = useRef(null)

  const [form, setForm] = useState(() => ({
    ...emptyForm(),
    // Prefilled so replies are easy; the user can clear it to stay anonymous
    // to follow-up (the field is never required).
    contactEmail: user?.email ?? '',
  }))
  const [screenshot, setScreenshot] = useState(null)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  // { id, reference, category, status, notificationStatus } after a successful submit
  const [receipt, setReceipt] = useState(null)

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    setErrors((er) => ({ ...er, [key]: undefined }))
    setFormError('')
  }

  const pickCategory = (value) => () => {
    setForm((f) => ({ ...f, category: value }))
    setErrors((er) => ({ ...er, category: undefined }))
    setFormError('')
  }

  const onPickFile = (event) => {
    const file = event.target.files?.[0] ?? null
    setErrors((er) => ({ ...er, screenshot: undefined }))
    setFormError('')
    if (!file) {
      setScreenshot(null)
      return
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setScreenshot(null)
      event.target.value = ''
      setErrors((er) => ({ ...er, screenshot: 'Use a PNG, JPEG, or WebP image.' }))
      return
    }
    if (file.size > MAX_ATTACHMENT_BYTES) {
      setScreenshot(null)
      event.target.value = ''
      setErrors((er) => ({ ...er, screenshot: 'Screenshots must be 5 MB or smaller.' }))
      return
    }
    setScreenshot(file)
  }

  const clearFile = () => {
    setScreenshot(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')

    const e = {}
    if (!form.category) e.category = 'Pick a category first.'
    if (form.subject.trim().length < 5) e.subject = 'A few more words, please (at least 5).'
    if (form.description.length < MIN_DESCRIPTION) {
      e.description = 'Description must be at least 20 characters.'
    } else if (!form.description.trim()) {
      e.description = 'Description is required.'
    }
    const email = form.contactEmail.trim()
    if (email && !/^\S+@\S+\.\S+$/.test(email)) e.contactEmail = 'That does not look like an email address.'
    if (email.length > 254) e.contactEmail = 'That email address is too long.'
    setErrors(e)
    if (Object.keys(e).length > 0) return

    setSubmitting(true)
    try {
      const result = await feedbackApi.create({
        category: form.category,
        subject: form.subject.trim(),
        // Sent exactly as typed — the confirmation needs to know whether a
        // contact email was supplied, and the text itself is not modified.
        description: form.description,
        reproductionSteps: form.reproductionSteps.trim(),
        contactEmail: email,
        screenshot,
      })
      setReceipt({ ...result, contactProvided: Boolean(email) })
      clearFile()
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
          setErrors(err.fieldErrors)
        } else {
          setFormError(err.message)
        }
      } else {
        setFormError('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Returns to the form with the submitted category preselected, so the
  // follow-up matches the category-aware CTA that was just clicked.
  const resetForAnother = () => {
    const category = receipt?.category
    setReceipt(null)
    setForm({ ...emptyForm(), category, contactEmail: user?.email ?? '' })
    setErrors({})
    setFormError('')
    clearFile()
  }

  if (receipt) {
    const copy = CONFIRMATION[receipt.category] ?? CONFIRMATION.GENERAL
    const hint =
      (NOTIFICATION_HINT[receipt.notificationStatus] ?? NOTIFICATION_HINT.PENDING) +
      (receipt.contactProvided ? FOLLOW_UP_HINT : '')
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-card border border-line bg-surface shadow-card lc-themed">
          <div className="p-6 sm:p-8">
            <span className="flex size-11 items-center justify-center rounded-full bg-accent-soft text-accent">
              <CheckCircle2 className="size-6" aria-hidden />
            </span>
            <h2 className="mt-4 font-display text-xl font-semibold text-ink">{copy.heading}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{copy.message}</p>
            <p className="mt-3 font-plxmono text-[11px] uppercase tracking-[0.16em] text-ink-faint">
              Reference: <span className="text-sienna">{receipt.reference}</span>
            </p>
            <Alert variant="info" className="mt-4">
              {hint}
            </Alert>
            <div className="mt-6 flex justify-end">
              <Button type="button" onClick={resetForAnother}>
                {ANOTHER_LABEL[receipt.category] ?? 'Submit another report'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-card border border-line bg-surface shadow-card lc-themed">
        <div className="flex items-center gap-4 border-b border-line p-6 sm:p-8">
          <span className="flex size-11 items-center justify-center rounded-full bg-accent-soft text-accent">
            <MessageSquare className="size-6" aria-hidden />
          </span>
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">Feedback &amp; Support</h2>
            <p className="text-sm text-ink-soft">
              Report a problem, suggest an improvement, or tell us what you think.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-8" noValidate>
          {formError && <Alert variant="error">{formError}</Alert>}

          <Field label="Category" id="category" error={errors.category} hint="What kind of feedback is this?">
            <div className="flex flex-wrap gap-2 pt-1" role="group" aria-label="Feedback category">
              {CATEGORIES.map(({ value, label, Icon }) => {
                const active = form.category === value
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={pickCategory(value)}
                    aria-pressed={active}
                    className={`inline-flex items-center gap-2 rounded-soft border px-4 py-2 text-sm font-medium transition-colors ${
                      active
                        ? 'border-accent bg-accent-soft text-accent'
                        : 'border-line-strong text-ink-soft hover:border-accent hover:text-ink'
                    }`}
                  >
                    <Icon className="size-4" aria-hidden />
                    {label}
                  </button>
                )
              })}
            </div>
          </Field>

          <TextField
            label="Subject"
            id="subject"
            maxLength={120}
            placeholder="A short summary"
            value={form.subject}
            onChange={set('subject')}
            error={errors.subject}
          />

        <Field
          label="Description"
          id="description"
          error={errors.description}
          hint={
            form.description.length < MIN_DESCRIPTION
              ? `Description must be at least ${MIN_DESCRIPTION} characters.` +
                (form.description.length > 0
                  ? ` ${MIN_DESCRIPTION - form.description.length} more to go.`
                  : '')
              : undefined
          }
          counter={`${form.description.length}/${MAX_DESCRIPTION}`}
        >
            <textarea
              id="description"
              rows={6}
              maxLength={5000}
              aria-invalid={errors.description ? true : undefined}
              aria-describedby={errors.description ? 'description-error' : undefined}
              placeholder="What happened, or what would you like to see?"
              className={`${inputClass(!!errors.description, 'min-h-32 resize-y')}`}
              value={form.description}
              onChange={set('description')}
            />
          </Field>

          {form.category === 'BUG' && (
            <Field
              label="Reproduction steps"
              id="reproductionSteps"
              error={errors.reproductionSteps}
              hint="Optional — how can we repeat the problem?"
              counter={`${form.reproductionSteps.length}/5000`}
            >
              <textarea
                id="reproductionSteps"
                rows={4}
                maxLength={5000}
                className={`${inputClass(!!errors.reproductionSteps, 'min-h-24 resize-y')}`}
                placeholder={'1. Open …\n2. Tap …\n3. See …'}
                value={form.reproductionSteps}
                onChange={set('reproductionSteps')}
              />
            </Field>
          )}

          <TextField
            label="Contact email"
            id="contactEmail"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.contactEmail}
            onChange={set('contactEmail')}
            error={errors.contactEmail}
            hint="Optional — we can only reply if you leave an email address. Clear it if you would rather not be contacted."
          />

          <Field
            label="Screenshot"
            id="screenshot"
            error={errors.screenshot}
            hint={
              screenshot
                ? undefined
                : 'Optional. PNG, JPEG, or WebP, up to 5 MB.'
            }
          >
            <div className="flex items-center gap-3 pt-1">
              <input
                ref={fileInputRef}
                id="screenshot"
                type="file"
                accept={ALLOWED_IMAGE_TYPES.join(',')}
                onChange={onPickFile}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="size-4" aria-hidden />
                {screenshot ? 'Replace image' : 'Choose image'}
              </Button>
              {screenshot && (
                <span className="inline-flex items-center gap-2 rounded-soft border border-line bg-surface-2 px-3 py-1.5 text-xs text-ink-soft">
                  <span className="max-w-48 truncate">{screenshot.name}</span>
                  <button
                    type="button"
                    onClick={clearFile}
                    aria-label="Remove screenshot"
                    className="text-ink-faint transition-colors hover:text-danger"
                  >
                    <X className="size-4" aria-hidden />
                  </button>
                </span>
              )}
            </div>
          </Field>

          <div className="flex justify-end pt-1">
            <Button type="submit" loading={submitting}>
              <Send className="size-4" aria-hidden />
              Send feedback
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
