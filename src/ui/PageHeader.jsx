export default function PageHeader({ eyebrow, title, subtitle, children }) {
  return (
    <div className="mb-6">
      {eyebrow && (
        <p className="font-plxmono text-[10px] font-medium uppercase tracking-[0.22em] text-sienna">
          {eyebrow}
        </p>
      )}
      <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink-soft">{subtitle}</p>
      )}
      <div className="mt-3 h-[3px] w-12 rounded-full bg-sienna/70" aria-hidden />
      {children}
    </div>
  )
}