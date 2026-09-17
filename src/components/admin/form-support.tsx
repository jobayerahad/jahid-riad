'use client'

import { useEffect } from 'react'
import { ActionIcon, Alert, Button, Group, Stack, Text, TextInput } from '@mantine/core'
import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi2'
import type { AnyAdminActionResult } from '@/types/admin'
import classes from './styles.module.css'

export const ResultAlert = ({ result }: { result: AnyAdminActionResult | null }) =>
  result ? (
    <Alert color={result.ok ? 'teal' : 'red'} role={result.ok ? 'status' : 'alert'}>
      {result.message}
      {!result.ok && result.fieldErrors ? (
        <ul>
          {Object.entries(result.fieldErrors).map(([field, message]) => (
            <li key={field}>
              <strong>{field.replaceAll('.', ' → ')}:</strong> {message}
            </li>
          ))}
        </ul>
      ) : null}
    </Alert>
  ) : null

export const FormFooter = ({ pending, dirty }: { pending: boolean; dirty: boolean }) => (
  <Group justify="flex-end" className={classes.formFooter}>
    {dirty && (
      <Text size="sm" c="orange">
        Unsaved changes
      </Text>
    )}
    <Button type="submit" loading={pending} disabled={!dirty}>
      Save draft
    </Button>
  </Group>
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

type RepeaterProps = {
  label: string
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  error?: string
}

export const RepeaterField = ({ label, values, onChange, placeholder, error }: RepeaterProps) => (
  <Stack gap="xs">
    <Text fw={600} size="sm">
      {label}
    </Text>
    {values.map((value, index) => (
      <Group key={`${label}-${index}`} align="flex-start" wrap="nowrap">
        <TextInput
          aria-label={`${label} ${index + 1}`}
          value={value}
          placeholder={placeholder}
          onChange={(event) =>
            onChange(values.map((item, itemIndex) => (itemIndex === index ? event.currentTarget.value : item)))
          }
          className={classes.grow}
        />
        <ActionIcon
          variant="subtle"
          color="red"
          size={42}
          aria-label={`Remove ${label.toLowerCase()} ${index + 1}`}
          onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))}
        >
          <HiOutlineTrash aria-hidden="true" />
        </ActionIcon>
      </Group>
    ))}
    <Button
      type="button"
      variant="light"
      size="xs"
      leftSection={<HiOutlinePlus aria-hidden="true" />}
      onClick={() => onChange([...values, ''])}
      className={classes.addRow}
    >
      Add {label.toLowerCase()}
    </Button>
    {error && (
      <Text c="red" size="xs">
        {error}
      </Text>
    )}
  </Stack>
)
