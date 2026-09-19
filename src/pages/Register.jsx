import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import AuthLayout from '../ui/AuthLayout'
import BrandButton from '../ui/BrandButton'
import BrandAlert from '../ui/BrandAlert'
import { brandInputClass, BrandField, BrandTextField } from '../ui/BrandField'
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
    <BrandField
      label="Password"
      id="password"
      error={errors.password}
      trailing={
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="text-lnd-faint transition-colors hover:text-lnd-ink"
        >
          {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
        </button>
      }
    >
      <input
        id="password"
        type={showPassword ? 'text' : 'password'}
        autoComplete="new-password"
        placeholder="At least 8 characters"
        className={brandInputClass(!!errors.password, 'pr-11')}
        value={form.password}
        onChange={set('password')}
      />
    </BrandField>
  )

  const confirmTouched = form.confirm.length > 0
  const confirmMatch = form.password === form.confirm

  const confirmField = (
    <BrandField
      label="Confirm password"
      id="confirm"
      error={confirmTouched && !confirmMatch ? 'Passwords do not match.' : errors.confirm}
      trailing={
        <button
          type="button"
          onClick={() => setShowConfirm((v) => !v)}
          aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
          className="text-lnd-faint transition-colors hover:text-lnd-ink"
        >
          {showConfirm ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
        </button>
      }
    >
      <input
        id="confirm"
        type={showConfirm ? 'text' : 'password'}
        autoComplete="new-password"
        placeholder="Repeat your password"
        aria-invalid={confirmTouched && !confirmMatch ? true : undefined}
        aria-describedby={confirmTouched ? 'confirm-status' : undefined}
        className={brandInputClass(confirmTouched && !confirmMatch, 'pr-11')}
        value={form.confirm}
        onChange={set('confirm')}
      />
    </BrandField>
  )

  return (
    <AuthLayout
      eyebrow="Begin your book"
      title="Open your memory book."
      subtitle="Start small — you can write everything later."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold" style={{ color: '#b4501e' }}>
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {formError && <BrandAlert variant="error">{formError}</BrandAlert>}

        <BrandTextField
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

        <BrandTextField
          label="Username"
          id="username"
          autoComplete="username"
          placeholder="e.g. maya"
          hint="Letters, numbers, dots, dashes and underscores. 3–30 characters."
          value={form.username}
          onChange={set('username')}
          error={errors.username}
        />

        <BrandTextField
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

        {confirmTouched && confirmMatch && (
          <p id="confirm-status" className="-mt-3 flex items-center gap-1.5 text-sm" style={{ color: '#4e6347' }}>
            <Check className="size-4" aria-hidden />
            Passwords match.
          </p>
        )}

        <BrandButton type="submit" className="w-full" size="lg" loading={loading}>
          Create account
        </BrandButton>

        <p className="text-center font-plxmono text-[11px] uppercase tracking-[0.12em] text-lnd-faint">
          By creating an account you agree to keep your memories private.
        </p>
      </form>
    </AuthLayout>
  )
}