import { AlertCircle, CheckCircle2, Info } from 'lucide-react'

const styles = {
  error: {
    bg: '#f7e9dd',
    border: '#e3c2a8',
    text: '#9c4a1d',
    icon: <AlertCircle className="size-5 shrink-0" aria-hidden />,
  },
  success: {
    bg: '#e2ece3',
    border: '#c8d8c4',
    text: '#3f5d3f',
    icon: <CheckCircle2 className="size-5 shrink-0" aria-hidden />,
  },
  info: {
    bg: '#efe8db',
    border: '#e0d6c3',
    text: '#6e675a',
    icon: <Info className="size-5 shrink-0" aria-hidden />,
  },
}

export default function BrandAlert({ variant = 'info', title, children, className = '' }) {
  const s = styles[variant]
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm leading-relaxed ${className}`}
      style={{ backgroundColor: s.bg, borderColor: s.border, color: s.text }}
    >
      {s.icon}
      <div>
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="[&_p]:mt-1">{children}</div>}
      </div>
    </div>
  )
}