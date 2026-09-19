import { LeafMark } from '../pages/landing/art'

export default function BrandLockup({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        className="flex size-9 items-center justify-center rounded-xl"
        style={{ backgroundColor: '#4a3728', color: '#fff7ea' }}
      >
        <LeafMark className="size-5" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-grotesk text-[15px] font-semibold tracking-tight text-lnd-ink">
          LifeClues
        </span>
        <span className="mt-1 font-plxmono text-[8.5px] uppercase tracking-[0.16em] text-lnd-faint">
          Small Clues. Big Memories.
        </span>
      </span>
    </span>
  )
}