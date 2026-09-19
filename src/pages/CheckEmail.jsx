import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import { authApi } from '../api/client'
import { ApiError } from '../api/http'
import AuthLayout from '../ui/AuthLayout'
import BrandButton from '../ui/BrandButton'
import BrandAlert from '../ui/BrandAlert'

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
      eyebrow="Nearly there"
      title="Check your inbox"
      subtitle="One small step and your book is open."
      footer={
        <>
          Already confirmed?{' '}
          <Link to="/login" className="font-semibold" style={{ color: '#b4501e' }}>
            Sign in
          </Link>
        </>
      }
    >
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <span
            className="flex size-12 items-center justify-center rounded-full"
            style={{ backgroundColor: '#f3e2d6', color: '#b4501e' }}
          >
            <MailCheck className="size-6" aria-hidden />
          </span>
        </div>

        <p className="text-sm leading-relaxed text-lnd-mut">
          {email ? (
            <>
              We sent a verification link to{' '}
              <span className="font-semibold text-lnd-ink">{email}</span>. Click it to confirm
              your address, then you can sign in and write your little clues.
            </>
          ) : (
            'We sent a verification link to your email address. Click it to confirm, then you can sign in and write your little clues.'
          )}
        </p>

        <div className="rounded-xl border border-lnd-line bg-lnd-deep/50 p-3 font-plxmono text-[11px] uppercase tracking-[0.08em] leading-relaxed text-lnd-faint">
          The link works for 30 minutes. If it doesn&rsquo;t arrive, check your spam folder.
        </div>

        <div className="space-y-2">
          {resend.state === 'error' ? (
            <BrandAlert variant="error" className="text-left">
              {resend.message}
            </BrandAlert>
          ) : resend.state === 'done' ? (
            <BrandAlert variant="success" className="text-left">
              {resend.message}
            </BrandAlert>
          ) : null}
          <BrandButton
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleResend}
            disabled={resend.state === 'sending'}
          >
            {resend.state === 'sending' ? 'Sending…' : "Didn't get it? Send again"}
          </BrandButton>
        </div>
      </div>
    </AuthLayout>
  )
}