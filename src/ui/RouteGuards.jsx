import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import Spinner from './Spinner'

export function ProtectedRoute({ children }) {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-paper">
        <Spinner className="size-8 text-accent" />
      </div>
    )
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}

export function GuestOnlyRoute({ children }) {
  const { status } = useAuth()

  if (status === 'loading') {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-paper">
        <Spinner className="size-8 text-accent" />
      </div>
    )
  }

  if (status === 'authenticated') {
    return <Navigate to="/app" replace />
  }

  return children
}