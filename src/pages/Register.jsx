import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import AuthLayout from '../ui/AuthLayout'
import Button from '../ui/Button'
import Alert from '../ui/Alert'
import { Field, TextField, inputClass } from '../ui/Field'
import { ApiError } from '../api/http'

const USERNAME_RE = /^[a-zA-Z0-9._-]{3,30}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: '',
    username: '',
    displayName: '',
    password: '',
    confirm: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (key) => (event) => {
    setForm((f) => ({ ...f, [key]: event.target.value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!EMAIL_RE.test(form.email.trim())) {
      e.email = 'Enter a valid email address.'
    }
    if (!USERNAME_RE.test(form.username.trim())) {
      e.username =
        'Use 3–30 characters: letters, numbers, dots, dashes or underscores.'
    }
    if (form.displayName.trim().length > 100) {
      e.displayName = 'Keep it under 100 characters.'
    }
    if (form.password.length < 8) {
      e.password = 'At least 8 characters, please.'
    }
    if (form.password.length > 100) {
      e.password = 'Password must be at most 100 characters.'
    }
    if (form.confirm !== form.password) {
      e.confirm = 'Passwords do not match.'
    }
    return e
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const e = validate()
    setErrors(e)
    setFormError('')
    if (Object.keys(e).length > 0) return

    setLoading(true)
    try {
      const { email } = await register({
        email: form.email.trim(),
        username: form.username.trim(),
        displayName: form.displayName.trim() || undefined,
        password: form.password,
      })
      navigate('/check-email', { replace: true, state: { email } })
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
      setLoading(false)
    }
  }

  const passwordField = (
    <Field label="Password" id="password" error={errors.password}>
      <div className="relative">
        <input
          id="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          className="w-full rounded-soft border border-line-strong bg-surface px-4 py-3 pr-11 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-accent focus:outline-2 focus:outline-offset-1 focus:outline-accent"
          value={form.password}
          onChange={set('password')}
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 flex items-center pr-4 text-ink-faint hover:text-ink"
        >
          {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
        </button>
      </div>
    </Field>
  )

  const confirmTouched = form.confirm.length > 0
  const confirmMatch = form.password === form.confirm

  const confirmField = (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor="confirm" className="text-sm font-semibold text-ink">
          Confirm password
        </label>
      </div>
      <div className="relative">
        <input
          id="confirm"
          type={showConfirm ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Repeat your password"
          aria-invalid={confirmTouched && !confirmMatch ? true : undefined}
          aria-describedby={confirmTouched ? 'confirm-status' : undefined}
          className={`${inputClass(confirmTouched && !confirmMatch)} pr-11`}
          value={form.confirm}
          onChange={set('confirm')}
        />
        <button
          type="button"
          onClick={() => setShowConfirm((v) => !v)}
          aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
          className="absolute inset-y-0 right-0 flex items-center pr-4 text-ink-faint hover:text-ink"
        >
          {showConfirm ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
        </button>
      </div>
      {errors.confirm || (confirmTouched && !confirmMatch) ? (
        <p id="confirm-status" className="text-sm text-danger">
          {errors.confirm || 'Passwords do not match.'}
        </p>
      ) : confirmTouched ? (
        <p id="confirm-status" className="flex items-center gap-1.5 text-sm text-accent">
          <Check className="size-4" aria-hidden />
          Passwords match.
        </p>
      ) : null}
    </div>
  )

  return (
    <AuthLayout
      title="Open your memory book"
      subtitle="Start small — you can write everything later."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-accent hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {formError && <Alert variant="error">{formError}</Alert>}

        <TextField
          label="Email"
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={set('email')}
          error={errors.email}
          autoFocus
        />

        <TextField
          label="Username"
          id="username"
          autoComplete="username"
          placeholder="e.g. maya"
          hint="Letters, numbers, dots, dashes and underscores. 3–30 characters."
          value={form.username}
          onChange={set('username')}
          error={errors.username}
        />

        <TextField
          label="Display name (optional)"
          id="displayName"
          autoComplete="name"
          placeholder="How friends see you"
          maxLength={100}
          value={form.displayName}
          onChange={set('displayName')}
          error={errors.displayName}
        />

        {passwordField}

        {confirmField}

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Create account
        </Button>

        <p className="text-center text-xs text-ink-faint">
          By creating an account you agree to keep your memories private.
        </p>
      </form>
    </AuthLayout>
  )
}