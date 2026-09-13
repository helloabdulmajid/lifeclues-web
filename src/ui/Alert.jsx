import { AlertCircle, CheckCircle2, Info } from 'lucide-react'

const styles = {
  error: {
    border: 'border-danger/40',
    bg: 'bg-danger-soft',
    text: 'text-danger-ink',
    icon: <AlertCircle className="size-5 shrink-0" aria-hidden />,
  },
  success: {
    border: 'border-accent/40',
    bg: 'bg-accent-soft',
    text: 'text-ink',
    icon: <CheckCircle2 className="size-5 shrink-0 text-accent" aria-hidden />,
  },
  info: {
    border: 'border-line-strong',
    bg: 'bg-surface-2',
    text: 'text-ink-soft',
    icon: <Info className="size-5 shrink-0 text-ink-soft" aria-hidden />,
  },
}

export default function Alert({ variant = 'info', title, children, className = '' }) {
  const s = styles[variant]
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-soft border px-4 py-3 text-sm leading-relaxed ${s.border} ${s.bg} ${s.text} ${className}`}
    >
      {s.icon}
      <div>
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="[&_p]:mt-1">{children}</div>}
      </div>
    </div>
  )
}