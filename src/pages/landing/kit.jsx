const MOODS = {
  special: { bg: '#f3e2d6', ink: '#a35427', label: 'Happy' },
  sad: { bg: '#dfe4ed', ink: '#4a5568', label: 'Sad' },
  win: { bg: '#f1e3bf', ink: '#8a6b33', label: 'Win' },
  social: { bg: '#e4dde9', ink: '#655a71', label: 'Social' },
  chill: { bg: '#e2ece3', ink: '#4e6347', label: 'Chill' },
}

export function MoodPill({ mood }) {
  const m = MOODS[mood] ?? MOODS.chill
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
      style={{ backgroundColor: m.bg, color: m.ink }}
    >
      <span
        className="size-1 rounded-full"
        style={{ backgroundColor: m.ink }}
        aria-hidden
      />
      {m.label}
    </span>
  )
}

export function PersonTag({ children }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-lnd-line bg-lnd-card px-2 py-0.5 text-[10px] font-medium text-lnd-mut">
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="size-3"
        aria-hidden
      >
        <circle cx="8" cy="5" r="2.6" />
        <path d="M3 13.5c.5-3 2.2-4.5 5-4.5s4.5 1.5 5 4.5" />
      </svg>
      {children}
    </span>
  )
}

export function PlaceTag({ children }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-lnd-line bg-lnd-card px-2 py-0.5 text-[10px] font-medium text-lnd-mut">
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-3"
        aria-hidden
      >
        <path d="M8 14s4.5-3.6 4.5-7a4.5 4.5 0 0 0-9 0C3.5 10.4 8 14 8 14Z" />
        <circle cx="8" cy="6.8" r="1.6" />
      </svg>
      {children}
    </span>
  )
}

export function DateLabel({ children, className = '' }) {
  return (
    <span
      className={`font-plxmono text-[10px] uppercase tracking-[0.08em] text-lnd-faint ${className}`}
    >
      {children}
    </span>
  )
}