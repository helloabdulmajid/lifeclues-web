import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import AuthLayout from '../ui/AuthLayout'
import Button from '../ui/Button'
import Alert from '../ui/Alert'
import { Field, TextField } from '../ui/Field'
import { ApiError } from '../api/http'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/app'

  const [loginField, setLoginField] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

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
      } else {
        setError('Something went wrong. Please try again.')
      }
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Your memory book is waiting."
      footer={
        <>
          New to LifeClues?{' '}
          <Link to="/register" className="font-semibold text-accent hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error && <Alert variant="error">{error}</Alert>}

        <TextField
          label="Email or username"
          id="login"
          autoComplete="username"
          placeholder="you@example.com"
          value={loginField}
          onChange={(e) => setLoginField(e.target.value)}
          autoFocus
        />

        <Field label="Password" id="password">
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Your password"
              className="w-full rounded-soft border border-line-strong bg-surface px-4 py-3 pr-11 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-accent focus:outline-2 focus:outline-offset-1 focus:outline-accent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          <div className="text-right">
            <span className="text-xs text-ink-faint">
              Forgot your password? Contact support to reset it.
            </span>
          </div>
        </Field>

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Sign in
        </Button>
      </form>
    </AuthLayout>
  )
}