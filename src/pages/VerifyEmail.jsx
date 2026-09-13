import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, CircleAlert } from 'lucide-react'
import { authApi } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import AuthLayout from '../ui/AuthLayout'
import Button from '../ui/Button'
import Spinner from '../ui/Spinner'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const navigate = useNavigate()
  const { isAuthenticated, setProfile } = useAuth()

  const [state, setState] = useState(token ? 'verifying' : 'error')
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    authApi
      .verifyEmail(token)
      .then(async () => {
        if (isAuthenticated) {
          try {
            setProfile(await authApi.me())
          } catch {
            /* no-op: the banner refreshes next load */
          }
        }
        setState('success')
      })
      .catch(() => {
        setState('error')
      })
  }, [token, isAuthenticated, setProfile])

  return (
    <AuthLayout
      title="Confirming your email"
      subtitle="Almost there."
      footer={
        <>
          <Link to="/login" className="font-semibold text-accent hover:underline">
            Back to sign in
          </Link>
        </>
      }
    >
      {state === 'verifying' && (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <Spinner className="size-8 text-accent" />
          <p className="text-sm text-ink-soft">Checking your link…</p>
        </div>
      )}

      {state === 'success' && (
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent">
              <CheckCircle2 className="size-6" aria-hidden />
            </span>
          </div>
          <h2 className="font-display text-xl font-semibold text-ink">Email confirmed</h2>
          <p className="text-sm leading-relaxed text-ink-soft">
            Your memory book is open. You can now start writing your little clues.
          </p>
          <Button type="button" className="w-full" size="lg" onClick={() => navigate('/app')}>
            {isAuthenticated ? 'Go to your memory book' : 'Sign in'}
          </Button>
        </div>
      )}

      {state === 'error' && (
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-danger-soft text-danger">
              <CircleAlert className="size-6" aria-hidden />
            </span>
          </div>
          <h2 className="font-display text-xl font-semibold text-ink">This link didn't work</h2>
          <p className="text-sm leading-relaxed text-ink-soft">
            It may have expired or already been used. Sign in and the confirmation reminder will
            let you send a fresh link.
          </p>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => navigate('/login')}
          >
            Back to sign in
          </Button>
        </div>
      )}
    </AuthLayout>
  )
}