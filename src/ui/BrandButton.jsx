import Spinner from './Spinner'

export default function BrandButton({
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
      'bg-lnd-indigo text-white hover:bg-lnd-indigo-hover focus-visible:outline-lnd-indigo',
    outline:
      'border border-lnd-line bg-lnd-card text-lnd-ink hover:border-lnd-sienna/60 hover:text-lnd-sienna focus-visible:outline-lnd-indigo',
    ghost:
      'bg-transparent text-lnd-mut hover:bg-lnd-deep hover:text-lnd-ink focus-visible:outline-lnd-ink',
  }

  const sizes = {
    sm: 'h-9 px-4 text-sm rounded-full',
    md: 'h-11 px-5 text-sm rounded-full',
    lg: 'h-12 px-7 text-base rounded-full',
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