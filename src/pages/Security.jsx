import { useState } from 'react'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import Button from '../ui/Button'
import Alert from '../ui/Alert'
import { Field } from '../ui/Field'
import { accountApi } from '../api/client'
import { ApiError } from '../api/http'

function PasswordInput({ id, label, autoComplete, value, onChange, show, onToggle, error }) {
  return (
    <Field label={label} id={id} error={error}>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          className="w-full rounded-soft border border-line-strong bg-surface px-4 py-3 pr-11 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-accent focus:outline-2 focus:outline-offset-1 focus:outline-accent"
          value={value}
          onChange={onChange}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? `Hide ${label}` : `Show ${label}`}
          className="absolute inset-y-0 right-0 flex items-center pr-4 text-ink-faint hover:text-ink"
        >
          {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
        </button>
      </div>
    </Field>
  )
}

export default function Security() {
  const { user, logout } = useAuth()

  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [shown, setShown] = useState({ current: false, next: false, confirm: false })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    setErrors((er) => ({ ...er, [key]: undefined }))
    setSuccess('')
  }

  const toggle = (key) => () => setShown((s) => ({ ...s, [key]: !s[key] }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    setSuccess('')

    const e = {}
    if (!form.current) e.current = 'Enter your current password.'
    if (form.next.length < 8) e.next = 'At least 8 characters, please.'
    if (form.next.length > 100) e.next = 'Password must be at most 100 characters.'
    if (form.confirm !== form.next) e.confirm = 'Passwords do not match.'
    setErrors(e)
    if (Object.keys(e).length > 0) return

    setSaving(true)
    try {
      await accountApi.changePassword({
        currentPassword: form.current,
        newPassword: form.next,
      })
      setForm({ current: '', next: '', confirm: '' })
      setSuccess('Password changed. You can keep working — no need to sign in again.')
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
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      {success && (
        <Alert variant="success" className="mb-4">
          {success}
        </Alert>
      )}

      <div className="rounded-card border border-line bg-surface shadow-card lc-themed">
        <div className="flex items-center gap-4 border-b border-line p-6 sm:p-8">
          <span className="flex size-11 items-center justify-center rounded-full bg-accent-soft text-accent">
            <ShieldCheck className="size-6" aria-hidden />
          </span>
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">Change password</h2>
            <p className="text-sm text-ink-soft">
              Signed in as <span className="font-medium text-ink">{user?.email}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-8" noValidate>
          {formError && <Alert variant="error">{formError}</Alert>}

          <PasswordInput
            id="current"
            label="Current password"
            autoComplete="current-password"
            value={form.current}
            onChange={set('current')}
            show={shown.current}
            onToggle={toggle('current')}
            error={errors.current}
          />

          <PasswordInput
            id="next"
            label="New password"
            autoComplete="new-password"
            value={form.next}
            onChange={set('next')}
            show={shown.next}
            onToggle={toggle('next')}
            error={errors.next}
          />

          <PasswordInput
            id="confirm"
            label="Confirm new password"
            autoComplete="new-password"
            value={form.confirm}
            onChange={set('confirm')}
            show={shown.confirm}
            onToggle={toggle('confirm')}
            error={errors.confirm}
          />

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={logout} disabled={saving}>
              Sign out
            </Button>
            <Button type="submit" loading={saving}>
              Update password
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}