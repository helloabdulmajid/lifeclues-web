export const brandInputClass = (hasError = false, extra = '') =>
  [
    'w-full rounded-xl border bg-lnd-card px-4 py-3 text-sm text-lnd-ink placeholder:text-lnd-faint',
    'transition-colors focus:outline-2 focus:outline-offset-1',
    hasError
      ? 'border-[#c1552b] focus:outline-[#c1552b]'
      : 'border-lnd-line focus:border-lnd-sienna focus:outline-lnd-sienna',
    extra,
  ].join(' ')

export function BrandField({ label, id, hint, error, counter, extra, trailing, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-semibold text-lnd-ink">
          {label}
        </label>
        {(counter || extra) && (
          <div className="flex items-center gap-3">
            {counter && <span className="text-xs text-lnd-faint">{counter}</span>}
            {extra}
          </div>
        )}
      </div>
      <div className="relative">
        {children}
        {trailing && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3.5">{trailing}</div>
        )}
      </div>
      {error ? (
        <p
          id={id ? `${id}-error` : undefined}
          className="text-sm"
          style={{ color: '#b4501e' }}
          role="alert"
        >
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-lnd-faint">{hint}</p>
      ) : null}
    </div>
  )
}

export function BrandTextField({ label, id, error, hint, maxLength, ...props }) {
  const value = props.value ?? ''
  return (
    <BrandField
      label={label}
      id={id}
      error={error}
      hint={hint}
      counter={maxLength ? `${String(value).length}/${maxLength}` : undefined}
    >
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={brandInputClass(!!error)}
        maxLength={maxLength}
        {...props}
      />
    </BrandField>
  )
}