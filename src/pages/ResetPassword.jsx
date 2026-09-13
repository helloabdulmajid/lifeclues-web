import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Check, Eye, EyeOff, KeyRound } from 'lucide-react'
import { authApi } from '../api/client'
import { ApiError } from '../api/http'
import AuthLayout from '../ui/AuthLayout'
import Button from '../ui/Button'
import Alert from '../ui/Alert'
import { Field, inputClass } from '../ui/Field'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const confirmTouched = confirm.length > 0
  const confirmMatch = password === confirm

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setFieldError('')

    if (password.length < 8) {
      setFieldError('At least 8 characters, please.')
      return
    }
    if (password.length > 100) {
      setFieldError('Password must be at most 100 characters.')
      return
    }
    if (!confirmMatch) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await authApi.resetPassword({ token, newPassword: password })
      setDone(true)
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
          setFieldError(Object.values(err.fieldErrors)[0])
        } else {
          setError(err.message)
        }
      } else {
        setError('Something went wrong. Please try again.')
      }
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Pick a fresh password for your memory book."
      footer={
        !done && (
          <>
            Remembered it?{' '}
            <Link to="/login" className="font-semibold text-accent hover:underline">
              Back to sign in
            </Link>
          </>
        )
      }
    >
      {done ? (
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent">
              <KeyRound className="size-6" aria-hidden />
            </span>
          </div>
          <h2 className="font-display text-xl font-semibold text-ink">Password updated</h2>
          <p className="text-sm leading-relaxed text-ink-soft">
            You're all set. Sign in with your new password.
          </p>
          <Button type="button" className="w-full" size="lg" onClick={() => navigate('/login')}>
            Back to sign in
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {!token && (
            <Alert variant="error">
              This reset link is missing its code. Please request a new one.
            </Alert>
          )}

          {error && <Alert variant="error">{error}</Alert>}

          <Field label="New password" id="newPassword" error={fieldError}>
            <div className="relative">
              <input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className="w-full rounded-soft border border-line-strong bg-surface px-4 py-3 pr-11 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-accent focus:outline-2 focus:outline-offset-1 focus:outline-accent"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
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

          <div className="space-y-1.5">
            <label htmlFor="confirmNewPassword" className="text-sm font-semibold text-ink">
              Confirm new password
            </label>
            <div className="relative">
              <input
                id="confirmNewPassword"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Repeat your password"
                aria-invalid={confirmTouched && !confirmMatch ? true : undefined}
                aria-describedby={confirmTouched ? 'confirm-status' : undefined}
                className={`${inputClass(confirmTouched && !confirmMatch)} pr-11`}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
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
            {confirmTouched && !confirmMatch ? (
              <p id="confirm-status" className="text-sm text-danger">
                Passwords do not match.
              </p>
            ) : confirmTouched ? (
              <p id="confirm-status" className="flex items-center gap-1.5 text-sm text-accent">
                <Check className="size-4" aria-hidden />
                Passwords match.
              </p>
            ) : null}
          </div>

          <Button type="submit" className="w-full" size="lg" loading={loading} disabled={!token}>
            Reset password
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}