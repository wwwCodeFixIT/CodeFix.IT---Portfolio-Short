import { useId, useLayoutEffect, useRef, useState } from 'react'
import type { FormEvent, InputHTMLAttributes } from 'react'
import { leadFieldError } from '../lib/lead-field'
import type { LeadFieldElement } from '../lib/lead-field'

type LeadFieldProps = Pick<
  InputHTMLAttributes<HTMLInputElement>,
  | 'type'
  | 'inputMode'
  | 'autoComplete'
  | 'autoCapitalize'
  | 'enterKeyHint'
  | 'minLength'
  | 'maxLength'
  | 'placeholder'
  | 'required'
> & { name: string; label: string; rows?: number }

export function LeadField({ label, rows, type, ...attributes }: LeadFieldProps) {
  const id = useId()
  const [error, setError] = useState<string | null>(null)
  const fieldRef = useRef<LeadFieldElement | null>(null)
  const { required, minLength, maxLength } = attributes

  useLayoutEffect(() => {
    const field = fieldRef.current
    if (!field) return
    const message = leadFieldError(field)
    setError((current) => (current === null ? null : message))
    const reset = () => {
      field.setCustomValidity('')
      setError(null)
    }
    const form = field.form
    form?.addEventListener('reset', reset)
    return () => form?.removeEventListener('reset', reset)
  }, [required, minLength, maxLength])

  function onInput(event: FormEvent<LeadFieldElement>) {
    const message = leadFieldError(event.currentTarget)
    setError((current) => (current === null ? null : message))
  }

  function onInvalid(event: FormEvent<LeadFieldElement>) {
    event.preventDefault()
    const field = event.currentTarget
    setError(leadFieldError(field))
    if (field.form?.querySelector('input:invalid, textarea:invalid') === field) field.focus()
  }

  const shared = {
    ...attributes,
    id,
    ref: (field: LeadFieldElement | null) => {
      fieldRef.current = field
    },
    'aria-invalid': error ? (true as const) : undefined,
    'aria-describedby': error ? `${id}-error` : undefined,
    onInput,
    onInvalid,
  }

  return (
    <div className="cf-lead-field">
      <label htmlFor={id}>
        <span>
          {label}
          {!required && (
            <>
              {' '}
              <small>opcjonalnie</small>
            </>
          )}
        </span>
      </label>
      {rows ? <textarea {...shared} rows={rows} /> : <input {...shared} type={type} />}
      {error && (
        <small id={`${id}-error`} className="cf-field-error" role="alert">
          {error}
        </small>
      )}
    </div>
  )
}
