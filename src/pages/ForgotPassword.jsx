import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import { authApi } from '../api/client'
import { ApiError } from '../api/http'
import AuthLayout from '../ui/AuthLayout'
import BrandButton from '../ui/BrandButton'
import BrandAlert from '../ui/BrandAlert'
import { BrandTextField } from '../ui/BrandField'

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
      eyebrow="Password help"
      title="Forgot your password?"
      subtitle="We'll email you a link to set a new one."
      footer={
        <>
          Remembered it?{' '}
          <Link to="/login" className="font-semibold" style={{ color: '#b4501e' }}>
            Back to sign in
          </Link>
        </>
      }
    >
      {started ? (
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <span
              className="flex size-12 items-center justify-center rounded-full"
              style={{ backgroundColor: '#f3e2d6', color: '#b4501e' }}
            >
              <MailCheck className="size-6" aria-hidden />
            </span>
          </div>
          <h2 className="font-caveat text-3xl leading-none text-lnd-ink">Check your inbox</h2>
          <p className="text-sm leading-relaxed text-lnd-mut">
            If that email has a LifeClues account, a reset link is on its way. It works for 30
            minutes — if it doesn't arrive, check your spam folder.
          </p>
          <BrandButton
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setStarted(false)
              setEmail('')
            }}
          >
            Send it again
          </BrandButton>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {error && <BrandAlert variant="error">{error}</BrandAlert>}
          <BrandTextField
            label="Email"
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
          <BrandButton type="submit" className="w-full" size="lg" loading={loading}>
            Send reset link
          </BrandButton>
        </form>
      )}
    </AuthLayout>
  )
}