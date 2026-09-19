import { useId } from 'react'

/* ---------- Brand / decorative marks ---------- */

export function LeafMark({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 21C8 21 5 18.2 5 14.2 5 9.6 8.1 6 12 6s7 3.6 7 8.2c0 4-3 6.8-7 6.8Z" />
      <path d="M12 6c3 1.6 5 4.8 5.6 8.4" />
      <path d="M12 6c-1.6 1.8-2.6 4.2-2.9 6.8" />
      <path d="M4.5 19c4-.5 7.6-2.4 10-5.5" opacity="0.6" />
    </svg>
  )
}

export function SiennaUnderline({ className = '' }) {
  return (
    <svg
      viewBox="0 0 260 18"
      preserveAspectRatio="none"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M5 12c30-6 62-9 96-7 34 2 78 8 116 3 15-2 28-4 39-4"
        stroke="#b4501e"
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  )
}

export function TapePiece({ className = '' }) {
  return (
    <svg viewBox="0 0 96 26" className={className} aria-hidden>
      <rect width="96" height="26" fill="#f4ecd9" opacity="0.72" />
      <rect
        width="96"
        height="26"
        fill="none"
        stroke="#d9ccb0"
        strokeWidth="1"
        opacity="0.6"
      />
    </svg>
  )
}

export function BotanicalSprig({ className = '', flip = false }) {
  return (
    <svg
      viewBox="0 0 90 130"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
      aria-hidden
    >
      <path d="M45 126V54" opacity="0.85" />
      <path d="M45 58c-14-4-22-16-24-30 12 2 22 9 27 20" />
      <path d="M45 54c14 2 26-4 32-16-14 0-26 4-33 13" />
      <path d="M45 82c-12-3-20-12-23-23 11 1 19 7 25 15" />
      <path d="M45 78c11-1 20-7 24-16-11-1-19 3-25 10" />
      <path d="M45 106c-10-2-17-10-19-19 9 1 16 6 21 12" />
      <path d="M45 102c9-2 15-8 18-15-9-2-15 1-20 8" />
    </svg>
  )
}

export function FlowerDoodle({ className = '' }) {
  return (
    <svg viewBox="0 0 60 60" fill="none" className={className} aria-hidden>
      <g stroke="#b4501e" strokeWidth="2" strokeLinecap="round">
        <circle cx="30" cy="30" r="24" fill="#f3e2d6" stroke="#d9c6a8" strokeWidth="1.4" />
        <circle cx="30" cy="30" r="5" fill="#b4501e" stroke="none" />
      </g>
    </svg>
  )
}

export function MountainDoodle({ className = '' }) {
  return (
    <svg viewBox="0 0 120 60" fill="none" className={className} aria-hidden>
      <path
        d="M4 48 34 16 56 36 80 10 116 48"
        stroke="#b7a98b"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 48 40 30l12 10 16-18 24 26"
        stroke="#d9c6a8"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
    </svg>
  )
}

export function SunDoodle({ className = '' }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden>
      <circle cx="32" cy="32" r="13" fill="#e7c47f" />
      <g stroke="#b4501e" strokeWidth="2.4" strokeLinecap="round">
        <path d="M32 8v8M56 32h-8M32 56v-8M8 32h8M50 14l-5 5M50 50l-5-5M14 50l5-5M14 14l5 5" />
      </g>
    </svg>
  )
}

export function HeartDoodle({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 21c-6-4.6-9-8-9-11a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 3-3 6.4-9 11Z" />
    </svg>
  )
}

/* ---------- Illustrated "photographs" ---------- */

export function MountainsScene({ className = '', boat = false }) {
  const id = useId()
  const sky = `${id}-sky`
  return (
    <svg
      viewBox="0 0 320 200"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f5eddc" />
          <stop offset="1" stopColor="#e8dfcc" />
        </linearGradient>
      </defs>
      <rect width="320" height="200" fill={`url(#${sky})`} />
      <circle cx="248" cy="48" r="22" fill="#e7c47f" opacity="0.92" />
      <path d="M0 150 62 82 118 128 168 62 240 138 320 96v96H0Z" fill="#c2c9ae" />
      <path d="M0 168 84 112 150 158 232 94 320 168v32H0Z" fill="#94a589" />
      <path d="M36 200 168 118l132 82H36Z" fill="#5f795f" />
      <path d="M0 178h320v22H0Z" fill="#9fb4ac" />
      <path
        d="M40 190c24-4 48-4 72 0M132 186c30-4 60-2 86 2"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
      />
      <g fill="#45603f" opacity="0.9">
        <path d="M24 178 30 160l7 18Z" />
        <path d="M42 180 47 166l6 14Z" />
        <path d="M280 174l6-18 7 18Z" />
        <path d="M300 180l5-14 6 14Z" />
      </g>
      {boat && (
        <g>
          <path d="M96 170q14 9 30 1l-7 9H103l-7-10Z" fill="#7a4a34" />
          <path d="M118 172l7-20M124 154l11 4-20 3Z" fill="#f4ecd9" />
        </g>
      )}
    </svg>
  )
}

export function CoffeeScene({ className = '', openBook = false }) {
  const id = useId()
  return (
    <svg
      viewBox="0 0 320 200"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f0e3d2" />
          <stop offset="1" stopColor="#e6d7c2" />
        </linearGradient>
      </defs>
      <rect width="320" height="200" fill={`url(#${id}-bg)`} />
      <path d="M0 150h320" stroke="#cbb49a" strokeWidth="3" opacity="0.7" />
      <ellipse cx="158" cy="152" rx="80" ry="12" fill="#d9c5aa" />
      <ellipse cx="158" cy="148" rx="74" ry="10" fill="#b0765a" />
      <path d="M140 148v-46c0-12 9-20 20-20 12 0 21 8 21 20v46Z" fill="#a76a4a" />
      <path
        d="M181 106c14-2 22 6 22 18 0 12-8 18-22 16"
        fill="none"
        stroke="#a76a4a"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <ellipse cx="160" cy="102" rx="21" ry="7" fill="#5a3a28" />
      <path
        d="M150 78c-2-9 5-12 0-20M168 78c2-9-5-12 0-20"
        stroke="#8a6b55"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path d="M112 132l38 14M118 138l34 13" stroke="#8a6b55" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
      {openBook && (
        <g>
          <path d="M60 120c-16 4-26 2-32-2v30c8 4 20 6 36 2V120Z" fill="#f4ecd9" />
          <path d="M60 120c16-4 28-2 36 3v28c-10-4-24-5-36-1v-30Z" fill="#efe6d2" />
          <path d="M40 124h12M38 132h14" stroke="#b4501e" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        </g>
      )}
    </svg>
  )
}

export function WinScene({ className = '' }) {
  return (
    <svg
      viewBox="0 0 320 200"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden
    >
      <rect width="320" height="200" fill="#f4e7c6" />
      <circle cx="272" cy="40" r="18" fill="#e7c47f" opacity="0.9" />
      <path
        d="M160 52l16 33 36 5-26 25 6 36-32-17-32 17 6-36-26-25 36-5Z"
        fill="#d9a33f"
        stroke="#c08d28"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <g stroke="#c08d28" strokeWidth="3" strokeLinecap="round">
        <path d="M52 84h14M59 77v14" />
        <path d="M268 92h18M277 83v18" />
        <path d="M96 150h26M109 137v26" />
      </g>
      <circle cx="240" cy="140" r="4" fill="#c08d28" opacity="0.8" />
      <circle cx="84" cy="60" r="4" fill="#c08d28" opacity="0.7" />
      <circle cx="150" cy="172" r="3" fill="#c08d28" opacity="0.7" />
    </svg>
  )
}