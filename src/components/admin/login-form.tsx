'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
    <form action={submit} className="w-full max-w-[440px] rounded-md border bg-card p-8 shadow-sm">
      <div className="flex flex-col gap-4">
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold tracking-tight">
          Portfolio admin
        </h1>
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <div className="grid gap-2">
          <Label htmlFor="admin-email">Admin email</Label>
          <Input id="admin-email" name="email" type="email" autoComplete="username" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="admin-password">Password</Label>
          <Input id="admin-password" name="password" type="password" autoComplete="current-password" required />
        </div>
        <Button type="submit" loading={pending}>
          Sign in
        </Button>
      </div>
    </form>
  )
}

export default AdminLoginForm
