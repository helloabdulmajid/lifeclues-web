import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Check, Eye, EyeOff, KeyRound } from 'lucide-react'
import { authApi } from '../api/client'
import { ApiError } from '../api/http'
import AuthLayout from '../ui/AuthLayout'
import BrandButton from '../ui/BrandButton'
import BrandAlert from '../ui/BrandAlert'
import { brandInputClass, BrandField } from '../ui/BrandField'

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
      eyebrow="A new key"
      title="Set a new password"
      subtitle="Pick a fresh password for your memory book."
      footer={
        !done && (
          <>
            Remembered it?{' '}
            <Link to="/login" className="font-semibold" style={{ color: '#b4501e' }}>
              Back to sign in
            </Link>
          </>
        )
      }
    >
      {done ? (
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <span
              className="flex size-12 items-center justify-center rounded-full"
              style={{ backgroundColor: '#f1e3bf', color: '#8a6b33' }}
            >
              <KeyRound className="size-6" aria-hidden />
            </span>
          </div>
          <h2 className="font-caveat text-3xl leading-none text-lnd-ink">Password updated</h2>
          <p className="text-sm leading-relaxed text-lnd-mut">
            You're all set. Sign in with your new password.
          </p>
          <BrandButton type="button" className="w-full" size="lg" onClick={() => navigate('/login')}>
            Back to sign in
          </BrandButton>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {!token && (
            <BrandAlert variant="error">
              This reset link is missing its code. Please request a new one.
            </BrandAlert>
          )}

          {error && <BrandAlert variant="error">{error}</BrandAlert>}

          <BrandField
            label="New password"
            id="newPassword"
            error={fieldError}
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
              id="newPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              className={brandInputClass(!!fieldError, 'pr-11')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </BrandField>

          <BrandField
            label="Confirm new password"
            id="confirmNewPassword"
            error={confirmTouched && !confirmMatch ? 'Passwords do not match.' : undefined}
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
              id="confirmNewPassword"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Repeat your password"
              aria-invalid={confirmTouched && !confirmMatch ? true : undefined}
              aria-describedby={confirmTouched ? 'confirm-status' : undefined}
              className={brandInputClass(confirmTouched && !confirmMatch, 'pr-11')}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </BrandField>

          {confirmTouched && confirmMatch && (
            <p
              id="confirm-status"
              className="-mt-3 flex items-center gap-1.5 text-sm"
              style={{ color: '#4e6347' }}
            >
              <Check className="size-4" aria-hidden />
              Passwords match.
            </p>
          )}

          <BrandButton
            type="submit"
            className="w-full"
            size="lg"
            loading={loading}
            disabled={!token}
          >
            Reset password
          </BrandButton>
        </form>
      )}
    </AuthLayout>
  )
}