import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CircleAlert } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import AuthLayout from '../ui/AuthLayout'
import BrandButton from '../ui/BrandButton'
import Spinner from '../ui/Spinner'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const navigate = useNavigate()
  const { verifyEmail } = useAuth()

  const [state, setState] = useState(token ? 'verifying' : 'error')
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    verifyEmail(token)
      .then(() => navigate('/app', { replace: true }))
      .catch(() => setState('error'))
  }, [token, verifyEmail, navigate])

  if (state === 'verifying') {
    return (
      <AuthLayout title="Confirming your email" subtitle="Almost there.">
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <Spinner className="size-8 text-lnd-sienna" />
          <p className="font-plxmono text-[11px] uppercase tracking-[0.14em] text-lnd-mut">
            Checking your link…
          </p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      eyebrow="Hmm"
      title="This link didn't work"
      subtitle="It may have expired or already been used."
      footer={
        <>
          <Link to="/login" className="font-semibold" style={{ color: '#b4501e' }}>
            Back to sign in
          </Link>
        </>
      }
    >
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <span
            className="flex size-12 items-center justify-center rounded-full"
            style={{ backgroundColor: '#f7e9dd', color: '#9c4a1d' }}
          >
            <CircleAlert className="size-6" aria-hidden />
          </span>
        </div>
        <p className="text-sm leading-relaxed text-lnd-mut">
          Verification links work for 30 minutes and can only be used once. Sign in with your
          email and we'll offer a fresh link, or create your account again.
        </p>
        <BrandButton type="button" className="w-full" size="lg" onClick={() => navigate('/login')}>
          Back to sign in
        </BrandButton>
      </div>
    </AuthLayout>
  )
}