import { forwardRef } from 'react'

export const inputClass = (hasError = false, extra = '') =>
  [
    'w-full rounded-soft border bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-faint',
    'transition-colors focus:outline-2 focus:outline-offset-1',
    hasError
      ? 'border-danger focus:outline-danger'
      : 'border-line-strong focus:border-accent focus:outline-accent',
    extra,
  ].join(' ')

export const Field = forwardRef(
  ({ label, hint, error, counter, children, id, className = '' }, ref) => (
    <div className={`space-y-1.5 ${className}`} ref={ref}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          {label}
        </label>
        {counter && (
          <span className="text-xs text-ink-faint">{counter}</span>
        )}
      </div>
      {children}
      {error ? (
        <p id={id ? `${id}-error` : undefined} className="text-sm text-danger">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-ink-faint">{hint}</p>
      )}
    </div>
  ),
)

Field.displayName = 'Field'

export function TextField({
  label,
  id,
  error,
  hint,
  maxLength,
  ...props
}) {
  const value = props.value ?? ''
  return (
    <Field
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
        className={inputClass(!!error)}
        maxLength={maxLength}
        {...props}
      />
    </Field>
  )
}

export function SelectField({ label, id, error, options, placeholder, ...props }) {
  return (
    <Field label={label} id={id} error={error}>
      <select
        id={id}
        className={`${inputClass(!!error)} appearance-none bg-[length:1.25rem] pr-10 bg-no-repeat bg-[right_0.75rem_center]`}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238E95A6' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")",
        }}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </Field>
  )
}