import { useState } from 'react'
import { Check, Pencil } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import Button from '../ui/Button'
import Alert from '../ui/Alert'
import { SelectField, TextField } from '../ui/Field'
import { accountApi } from '../api/client'
import { ApiError } from '../api/http'

const GENDER_OPTIONS = [
  { value: 'Female', label: 'Female' },
  { value: 'Male', label: 'Male' },
  { value: 'Non-binary', label: 'Non-binary' },
  { value: 'Other', label: 'Other' },
  { value: 'Prefer not to say', label: 'Prefer not to say' },
]

const RELATIONSHIP_OPTIONS = [
  { value: 'Single', label: 'Single' },
  { value: 'In a relationship', label: 'In a relationship' },
  { value: 'Engaged', label: 'Engaged' },
  { value: 'Married', label: 'Married' },
  { value: 'Divorced', label: 'Divorced' },
  { value: 'Widowed', label: 'Widowed' },
  { value: 'Other', label: 'Other' },
]

function initialsOf(user) {
  const name = user?.displayName?.trim() || user?.username || user?.email || '?'
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function formatDate(value) {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function todayString() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export default function Profile() {
  const { user, setProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    displayName: user?.displayName ?? '',
    bio: user?.bio ?? '',
    dateOfBirth: user?.dateOfBirth ?? '',
    phone: user?.phone ?? '',
    gender: user?.gender ?? '',
    city: user?.city ?? '',
    country: user?.country ?? '',
    profession: user?.profession ?? '',
    relationshipStatus: user?.relationshipStatus ?? '',
    languages: user?.languages ?? '',
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  const set = (key) => (event) => {
    setForm((f) => ({ ...f, [key]: event.target.value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const startEdit = () => {
    setForm({
      displayName: user?.displayName ?? '',
      bio: user?.bio ?? '',
      dateOfBirth: user?.dateOfBirth ?? '',
      phone: user?.phone ?? '',
      gender: user?.gender ?? '',
      city: user?.city ?? '',
      country: user?.country ?? '',
      profession: user?.profession ?? '',
      relationshipStatus: user?.relationshipStatus ?? '',
      languages: user?.languages ?? '',
    })
    setErrors({})
    setFormError('')
    setSuccess('')
    setEditing(true)
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setFormError('')
    setSuccess('')
    if (form.dateOfBirth && form.dateOfBirth > todayString()) {
      setErrors((e) => ({ ...e, dateOfBirth: 'Date of birth must be in the past.' }))
      return
    }
    if (form.displayName.length > 100) {
      setErrors((e) => ({ ...e, displayName: 'Keep it under 100 characters.' }))
      return
    }

    setSaving(true)
    try {
      const updated = await accountApi.updateProfile({
        displayName: form.displayName.trim() || undefined,
        bio: form.bio.trim(),
        dateOfBirth: form.dateOfBirth || undefined,
        phone: form.phone.trim(),
        gender: form.gender,
        city: form.city.trim(),
        country: form.country.trim(),
        profession: form.profession.trim(),
        relationshipStatus: form.relationshipStatus,
        languages: form.languages.trim(),
      })
      setProfile(updated)
      setEditing(false)
      setSuccess('Profile updated.')
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
          setErrors(err.fieldErrors)
        } else {
          setFormError(err.message)
        }
      } else {
        setFormError('Something went wrong. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  const aboutRows = [
    user?.dateOfBirth && { label: 'Birthday', value: formatDate(user.dateOfBirth) },
    user?.phone && { label: 'Phone', value: user.phone },
    user?.gender && { label: 'Gender', value: user.gender },
    user?.profession && { label: 'Profession', value: user.profession },
    user?.relationshipStatus && { label: 'Relationship status', value: user.relationshipStatus },
    [user?.city, user?.country].filter(Boolean).length > 0 && {
      label: 'Location',
      value: [user?.city, user?.country].filter(Boolean).join(', '),
    },
    user?.languages && { label: 'Languages', value: user.languages },
  ].filter(Boolean)

  const coreRows = [
    { label: 'Email', value: user?.email },
    { label: 'Username', value: `@${user?.username}` },
    { label: 'Member since', value: formatDate(user?.createdAt) },
  ]

  return (
    <div className="mx-auto max-w-2xl">
      {success && (
        <Alert variant="success" className="mb-4">
          {success}
        </Alert>
      )}

      <div className="rounded-card border border-line bg-surface shadow-card lc-themed">
        <div className="flex flex-col gap-5 border-b border-line p-6 sm:flex-row sm:items-center sm:p-8">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-accent-soft text-2xl font-display font-semibold text-accent">
            {initialsOf(user)}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-display text-2xl font-semibold text-ink">
              {user?.displayName || user?.username || 'You'}
            </h2>
            <p className="truncate text-sm text-ink-soft">{user?.email}</p>
            {user?.bio && <p className="mt-2 text-sm leading-relaxed text-ink-soft">{user.bio}</p>}
          </div>
          {!editing && (
            <Button variant="outline" onClick={startEdit}>
              <Pencil className="size-4" aria-hidden />
              Edit
            </Button>
          )}
        </div>

        {!editing ? (
          <>
            <dl className="divide-y divide-line p-6 sm:p-8">
              {coreRows.map((row) => (
                <div
                  key={row.label}
                  className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
                >
                  <dt className="text-sm font-semibold text-ink-soft">{row.label}</dt>
                  <dd className="break-words text-sm text-ink">{row.value}</dd>
                </div>
              ))}
            </dl>

            {aboutRows.length > 0 && (
              <div className="border-t border-line p-6 sm:p-8">
                <h3 className="mb-1 font-display text-lg font-semibold text-ink">
                  More about you
                </h3>
                <p className="mb-4 text-xs text-ink-faint">
                  These details help future LifeClues features — like birthday
                  memories and remembering the places and people you love.
                </p>
                <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                  {aboutRows.map((row) => (
                    <div key={row.label} className="min-w-0">
                      <dt className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                        {row.label}
                      </dt>
                      <dd className="break-words text-sm text-ink">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </>
        ) : (
          <form onSubmit={handleSave} className="p-6 sm:p-8" noValidate>
            {formError && <Alert variant="error" className="mb-5">
              {formError}
            </Alert>}
            <div className="space-y-5">
              <TextField
                label="Display name"
                id="displayName"
                autoComplete="name"
                placeholder="How friends see you"
                maxLength={100}
                value={form.displayName}
                onChange={set('displayName')}
                error={errors.displayName}
              />
              <TextField
                label="Bio"
                id="bio"
                placeholder="A line about you, your life, your memories…"
                maxLength={2000}
                value={form.bio}
                onChange={set('bio')}
                error={errors.bio}
              />
            </div>

            <div className="mt-8 border-t border-line pt-6">
              <h3 className="mb-1 font-display text-lg font-semibold text-ink">
                More about you
              </h3>
              <p className="mb-5 text-xs text-ink-faint">
                All optional — add only what you like. These details will power
                future LifeClues features: birthday memories, local reminders,
                and remembering the people and places that matter to you.
              </p>
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                  label="Date of birth"
                  id="dateOfBirth"
                  type="date"
                  max={todayString()}
                  value={form.dateOfBirth}
                  onChange={set('dateOfBirth')}
                  error={errors.dateOfBirth}
                />
                <TextField
                  label="Phone"
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+91 98765 43210"
                  maxLength={30}
                  value={form.phone}
                  onChange={set('phone')}
                  error={errors.phone}
                />
                <SelectField
                  label="Gender"
                  id="gender"
                  placeholder="Not specified"
                  options={GENDER_OPTIONS}
                  value={form.gender}
                  onChange={set('gender')}
                  error={errors.gender}
                />
                <SelectField
                  label="Relationship status"
                  id="relationshipStatus"
                  placeholder="Not specified"
                  options={RELATIONSHIP_OPTIONS}
                  value={form.relationshipStatus}
                  onChange={set('relationshipStatus')}
                  error={errors.relationshipStatus}
                />
                <TextField
                  label="City"
                  id="city"
                  placeholder="e.g. Pune"
                  maxLength={100}
                  value={form.city}
                  onChange={set('city')}
                  error={errors.city}
                />
                <TextField
                  label="Country"
                  id="country"
                  placeholder="e.g. India"
                  maxLength={100}
                  value={form.country}
                  onChange={set('country')}
                  error={errors.country}
                />
                <TextField
                  label="Profession"
                  id="profession"
                  placeholder="e.g. Software Engineer"
                  maxLength={100}
                  value={form.profession}
                  onChange={set('profession')}
                  error={errors.profession}
                />
                <TextField
                  label="Languages"
                  id="languages"
                  placeholder="e.g. English, Marathi"
                  hint="Separate with commas."
                  maxLength={200}
                  value={form.languages}
                  onChange={set('languages')}
                  error={errors.languages}
                />
              </div>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditing(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                <Check className="size-4" aria-hidden />
                Save changes
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}