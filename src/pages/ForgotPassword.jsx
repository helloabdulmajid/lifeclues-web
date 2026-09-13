import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import { authApi } from '../api/client'
import { ApiError } from '../api/http'
import AuthLayout from '../ui/AuthLayout'
import Button from '../ui/Button'
import Alert from '../ui/Alert'
import { TextField } from '../ui/Field'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [started, setStarted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    if (!isValid) {
      setError('Enter a valid email address.')
      return
    }
    setLoading(true)
    try {
      await authApi.forgotPassword(email.trim())
      setStarted(true)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="We'll email you a link to set a new one."
      footer={
        <>
          Remembered it?{' '}
          <Link to="/login" className="font-semibold text-accent hover:underline">
            Back to sign in
          </Link>
        </>
      }
    >
      {started ? (
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent">
              <MailCheck className="size-6" aria-hidden />
            </span>
          </div>
          <h2 className="font-display text-xl font-semibold text-ink">Check your inbox</h2>
          <p className="text-sm leading-relaxed text-ink-soft">
            If that email has a LifeClues account, a reset link is on its way. It works for 30
            minutes — if it doesn't arrive, check your spam folder.
          </p>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => {
              setStarted(false)
              setEmail('')
            }}
          >
            Send it again
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {error && <Alert variant="error">{error}</Alert>}
          <TextField
            label="Email"
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Send reset link
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}