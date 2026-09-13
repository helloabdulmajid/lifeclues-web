import Spinner from './Spinner'

export default function Button({
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  children,
  disabled,
  ...props
}) {
  const variants = {
    primary:
      'bg-accent text-accent-ink hover:bg-accent-hover shadow-soft focus-visible:outline-accent',
    outline:
      'border border-line-strong bg-surface text-ink hover:border-accent hover:text-accent',
    ghost: 'bg-transparent text-ink-soft hover:bg-surface-2 hover:text-ink',
    danger:
      'bg-danger text-white hover:opacity-90 focus-visible:outline-danger',
  }

  const sizes = {
    sm: 'h-9 px-3.5 text-sm rounded-soft',
    md: 'h-11 px-5 text-sm rounded-soft',
    lg: 'h-12 px-7 text-base rounded-card',
  }

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner className="size-4" />}
      {children}
    </button>
  )
}