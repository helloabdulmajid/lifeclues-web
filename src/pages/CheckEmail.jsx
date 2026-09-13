import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import { authApi } from '../api/client'
import { ApiError } from '../api/http'
import AuthLayout from '../ui/AuthLayout'
import Button from '../ui/Button'
import Alert from '../ui/Alert'

export default function CheckEmail() {
  const location = useLocation()
  const email = location.state?.email || ''

  const [resend, setResend] = useState({ state: 'idle', message: '' })

  const handleResend = async () => {
    if (!email) return
    setResend({ state: 'sending', message: '' })
    try {
      await authApi.resendVerification(email)
      setResend({ state: 'done', message: 'A fresh link is on its way — check your inbox.' })
    } catch (err) {
      setResend({
        state: 'error',
        message: err instanceof ApiError ? err.message : 'Something went wrong. Please try again.',
      })
    }
  }

  return (
    <AuthLayout
      title="Check your inbox"
      subtitle="One small step and your book is open."
      footer={
        <>
          Already confirmed?{' '}
          <Link to="/login" className="font-semibold text-accent hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent">
            <MailCheck className="size-6" aria-hidden />
          </span>
        </div>
        <p className="text-sm leading-relaxed text-ink-soft">
          {email ? (
            <>
              We sent a verification link to <span className="font-semibold text-ink">{email}</span>.
              Click it to confirm your address, then you can sign in and write your little clues.
            </>
          ) : (
            'We sent a verification link to your email address. Click it to confirm, then you can sign in and write your little clues.'
          )}
        </p>
        <div className="rounded-soft border border-line bg-surface p-3 text-xs leading-relaxed text-ink-faint">
          The link works for 30 minutes. If it doesn't arrive, check your spam folder.
        </div>
        <div className="space-y-2">
          {resend.state === 'error' ? (
            <Alert variant="error" className="text-left">{resend.message}</Alert>
          ) : resend.state === 'done' ? (
            <Alert variant="success" className="text-left">{resend.message}</Alert>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={handleResend}
            disabled={resend.state === 'sending'}
          >
            {resend.state === 'sending' ? 'Sending…' : "Didn't get it? Send again"}
          </Button>
        </div>
      </div>
    </AuthLayout>
  )
}