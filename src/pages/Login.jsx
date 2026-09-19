import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { authApi } from '../api/client'
import AuthLayout from '../ui/AuthLayout'
import BrandButton from '../ui/BrandButton'
import BrandAlert from '../ui/BrandAlert'
import { brandInputClass, BrandField, BrandTextField } from '../ui/BrandField'
import { ApiError } from '../api/http'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/app'

  const [loginField, setLoginField] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [needsVerify, setNeedsVerify] = useState(false)
  const [resend, setResend] = useState({ state: 'idle', message: '' })
  const [loading, setLoading] = useState(false)

  const handleResend = async () => {
    setResend({ state: 'sending', message: '' })
    try {
      await authApi.resendVerification(loginField.trim())
      setResend({ state: 'done', message: 'A fresh link is on its way — check your inbox.' })
    } catch (err) {
      setResend({
        state: 'error',
        message: err instanceof ApiError ? err.message : 'Something went wrong. Please try again.',
      })
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setNeedsVerify(false)
    setResend({ state: 'idle', message: '' })

    if (!loginField.trim() || !password) {
      setError('Please enter your email or username, and your password.')
      return
    }

    setLoading(true)
    try {
      await login({ login: loginField.trim(), password })
      navigate(from, { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
        setNeedsVerify(err.message.toLowerCase().includes('verify your email'))
      } else {
        setError('Something went wrong. Please try again.')
      }
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Good to see you."
      subtitle="Your memory book is waiting."
      footer={
        <>
          New to LifeClues?{' '}
          <Link
            to="/register"
            className="font-semibold"
            style={{ color: '#b4501e' }}
          >
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error && <BrandAlert variant="error">{error}</BrandAlert>}

        {needsVerify && EMAIL_RE.test(loginField.trim()) && (
          <div className="text-right">
            {resend.state === 'done' ? (
              <p className="text-xs font-medium" style={{ color: '#b4501e' }}>
                {resend.message}
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resend.state === 'sending'}
                className="font-plxmono text-[11px] uppercase tracking-[0.1em] transition-colors hover:underline disabled:opacity-60"
                style={{ color: '#b4501e' }}
              >
                {resend.state === 'sending' ? 'Sending…' : 'Resend verification email'}
              </button>
            )}
            {resend.state === 'error' && (
              <p className="text-xs" style={{ color: '#9c4a1d' }}>
                {resend.message}
              </p>
            )}
          </div>
        )}

        <BrandTextField
          label="Email or username"
          id="login"
          autoComplete="username"
          placeholder="you@example.com"
          value={loginField}
          onChange={(e) => setLoginField(e.target.value)}
          autoFocus
        />

        <BrandField
          label="Password"
          id="password"
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
          extra={
            <Link
              to="/forgot-password"
              className="font-plxmono text-[11px] uppercase tracking-[0.1em] text-lnd-faint transition-colors hover:text-lnd-sienna"
            >
              Forgot your password?
            </Link>
          }
        >
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Your password"
            className={brandInputClass(false, 'pr-11')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </BrandField>

        <BrandButton type="submit" className="w-full" size="lg" loading={loading}>
          Sign in
        </BrandButton>
      </form>
    </AuthLayout>
  )
}