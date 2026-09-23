'use client'

import { useEffect, type ReactNode } from 'react'
import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi2'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { AnyAdminActionResult } from '@/types/admin'
import classes from './styles.module.css'

export function applyServerErrors(
  form: { setError: (name: never, error: { message: string }) => void },
  fieldErrors?: Record<string, string>
) {
  if (!fieldErrors) return
  for (const [name, message] of Object.entries(fieldErrors)) {
    form.setError(name as never, { message })
  }
}

export const ResultAlert = ({ result }: { result: AnyAdminActionResult | null }) =>
  result ? (
    <Alert
      variant={result.ok ? 'default' : 'destructive'}
      role={result.ok ? 'status' : 'alert'}
      className={result.ok ? 'border-teal-200 bg-teal-50 text-teal-900' : undefined}
    >
      <AlertDescription>
        {result.message}
        {!result.ok && result.fieldErrors ? (
          <ul className="mt-2 list-disc pl-4">
            {Object.entries(result.fieldErrors).map(([field, message]) => (
              <li key={field}>
                <strong>{field.replaceAll('.', ' → ')}:</strong> {message}
              </li>
            ))}
          </ul>
        ) : null}
      </AlertDescription>
    </Alert>
  ) : null

export const FormFooter = ({ pending, dirty }: { pending: boolean; dirty: boolean }) => (
  <div className={cn('flex flex-wrap items-center justify-end gap-3', classes.formFooter)}>
    {dirty && <p className="text-sm text-orange-600">Unsaved changes</p>}
    <Button type="submit" loading={pending} disabled={!dirty}>
      Save draft
    </Button>
  </div>
)

export const useUnsavedWarning = (dirty: boolean) => {
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!dirty) return
      event.preventDefault()
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])
}

type FieldProps = {
  label?: string
  description?: string
  error?: string
  htmlFor?: string
  className?: string
  children: ReactNode
}

export const Field = ({ label, description, error, htmlFor, className, children }: FieldProps) => (
  <div className={cn('grid gap-2', className)}>
    {label ? (
      <Label htmlFor={htmlFor} className="font-semibold">
        {label}
      </Label>
    ) : null}
    {children}
    {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
    {error ? <p className="text-sm text-destructive">{error}</p> : null}
  </div>
)

type RepeaterProps = {
  label: string
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  error?: string
}

export const RepeaterField = ({ label, values, onChange, placeholder, error }: RepeaterProps) => (
  <div className="flex flex-col gap-2">
    <p className="text-sm font-semibold">{label}</p>
    {values.map((value, index) => (
      <div key={`${label}-${index}`} className="flex items-start gap-2">
        <Input
          aria-label={`${label} ${index + 1}`}
          value={value}
          placeholder={placeholder}
          onChange={(event) =>
            onChange(values.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)))
          }
          className={classes.grow}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive"
          aria-label={`Remove ${label.toLowerCase()} ${index + 1}`}
          onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))}
        >
          <HiOutlineTrash aria-hidden="true" />
        </Button>
      </div>
    ))}
    <Button
      type="button"
      variant="light"
      size="xs"
      onClick={() => onChange([...values, ''])}
      className={classes.addRow}
    >
      <HiOutlinePlus aria-hidden="true" />
      Add {label.toLowerCase()}
    </Button>
    {error ? <p className="text-sm text-destructive">{error}</p> : null}
  </div>
)

type TagsInputProps = {
  label?: string
  description?: string
  value: string[]
  onChange: (values: string[]) => void
  placeholder?: string
}

export const TagsInput = ({ label, description, value, onChange, placeholder }: TagsInputProps) => {
  const commit = (raw: string) => {
    const next = raw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
    if (!next.length) return
    onChange([...value, ...next.filter((item) => !value.includes(item))])
  }

  return (
    <Field label={label} description={description}>
      <div className="flex flex-wrap gap-2 rounded-sm border border-input bg-white p-2 shadow-xs">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium"
          >
            {tag}
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground"
              aria-label={`Remove ${tag}`}
              onClick={() => onChange(value.filter((item) => item !== tag))}
            >
              ×
            </button>
          </span>
        ))}
        <Input
          className="h-8 min-w-[8rem] flex-1 border-0 shadow-none focus-visible:ring-0"
          placeholder={placeholder ?? 'Type and press Enter'}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ',') {
              event.preventDefault()
              commit(event.currentTarget.value)
              event.currentTarget.value = ''
            } else if (event.key === 'Backspace' && !event.currentTarget.value && value.length) {
              onChange(value.slice(0, -1))
            }
          }}
          onBlur={(event) => {
            if (event.currentTarget.value.trim()) {
              commit(event.currentTarget.value)
              event.currentTarget.value = ''
            }
          }}
        />
      </div>
    </Field>
  )
}
