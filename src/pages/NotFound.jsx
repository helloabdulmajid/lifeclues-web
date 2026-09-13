import { Link } from 'react-router-dom'
import { ArrowLeft, SearchX } from 'lucide-react'
import Button from '../ui/Button'

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-paper px-4 text-center">
      <span className="mb-6 flex size-16 items-center justify-center rounded-full bg-accent-soft text-accent">
        <SearchX className="size-8" aria-hidden />
      </span>
      <p className="font-display text-6xl font-semibold text-ink">404</p>
      <h1 className="mt-2 font-display text-2xl text-ink">This page isn't in the book.</h1>
      <p className="mt-2 max-w-sm text-ink-soft">
        The page you are looking for doesn't exist or has moved.
      </p>
      <Link to="/" className="mt-8">
        <Button>
          <ArrowLeft className="size-4" aria-hidden />
          Back home
        </Button>
      </Link>
    </div>
  )
}