'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Alert, Button, Paper, PasswordInput, Stack, TextInput, Title } from '@mantine/core'
import { signInAdmin } from '@/actions/auth'

const AdminLoginForm = () => {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const submit = (formData: FormData) => {
    setError('')
    startTransition(async () => {
      const response = await signInAdmin(formData)

      if (!response.ok) {
        setError(response.message)
        return
      }

      router.replace('/admin')
      router.refresh()
    })
  }

  return (
    <Paper component="form" action={submit} withBorder radius="md" p="xl" maw={440} w="100%">
      <Stack>
        <Title order={1} size="h2">
          Portfolio admin
        </Title>
        {error && <Alert color="red">{error}</Alert>}
        <TextInput name="email" type="email" label="Admin email" autoComplete="username" required />
        <PasswordInput name="password" label="Password" autoComplete="current-password" required />
        <Button type="submit" loading={pending}>
          Sign in
        </Button>
      </Stack>
    </Paper>
  )
}

export default AdminLoginForm
