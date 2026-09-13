import { BookOpenText } from 'lucide-react'

export default function Logo({ size = 'md', compact = false }) {
  const iconSizes = { sm: 'size-5', md: 'size-6', lg: 'size-9' }
  const textClass = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  }
  const compactTextClass = {
    sm: 'text-base sm:text-lg',
    md: 'text-lg sm:text-2xl',
    lg: 'text-2xl sm:text-4xl',
  }

  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`flex ${iconSizes[size]} shrink-0 items-center justify-center rounded-soft bg-accent text-accent-ink shadow-soft`}
      >
        <BookOpenText className={`${iconSizes[size]} shrink-0`} aria-hidden />
      </span>
      <span
        className={`whitespace-nowrap font-display font-semibold tracking-tight text-ink ${
          compact ? compactTextClass[size] : textClass[size]
        }`}
      >
        LifeClues
      </span>
    </span>
  )
}