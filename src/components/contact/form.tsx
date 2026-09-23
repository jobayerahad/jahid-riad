'use client'

import { useState, useTransition } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type Resolver } from 'react-hook-form'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'
import { HiOutlinePaperAirplane } from 'react-icons/hi2'
import { sendMessage } from '@/actions/contact'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { contactClientSchema, type ContactClientInput } from '@/schemas/contact'
import type { ContactResult } from '@/types'
import classes from './styles.module.css'

type Props = { configured: boolean }

const INITIAL_VALUES: ContactClientInput = { name: '', email: '', subject: '', message: '' }

const ContactForm = ({ configured }: Props) => {
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<ContactResult | null>(null)
  const recaptcha = useGoogleReCaptcha()
  const form = useForm<ContactClientInput>({
    resolver: zodResolver(contactClientSchema) as Resolver<ContactClientInput>,
    defaultValues: INITIAL_VALUES
  })

  const focusFirstError = () => {
    requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('#contact-form [aria-invalid="true"]')?.focus()
    })
  }

  const handleSubmit = (values: ContactClientInput) => {
    setResult(null)
    startTransition(async () => {
      if (!recaptcha.executeRecaptcha) {
        setResult({ ok: false, code: 'BOT', message: 'Bot verification is still loading. Please try again.' })
        return
      }

      const token = await recaptcha.executeRecaptcha('contact_form')
      const response = await sendMessage({ ...values, token })
      setResult(response)

      if (response.ok) form.reset(INITIAL_VALUES)
      else if (response.fieldErrors) {
        for (const [name, message] of Object.entries(response.fieldErrors)) {
          form.setError(name as keyof ContactClientInput, { message })
        }
        focusFirstError()
      }
    })
  }

  return (
    <div className={classes.formCard}>
      <Form {...form}>
        <form
          id="contact-form"
          noValidate
          onSubmit={form.handleSubmit(handleSubmit, focusFirstError)}
          aria-describedby={result ? 'contact-result' : undefined}
          className="flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input required placeholder="Your name" autoComplete="name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    required
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    inputMode="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <FormControl>
                  <Input required placeholder="What would you like to discuss?" autoComplete="off" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea
                    required
                    placeholder="Share the context, goal, and any useful timeline."
                    className="min-h-24"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {result ? (
            <Alert
              id="contact-result"
              role={result.ok ? 'status' : 'alert'}
              variant={result.ok ? 'default' : 'destructive'}
              className={result.ok ? 'border-teal-200 bg-teal-50 text-teal-900' : undefined}
            >
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          ) : null}

          {!configured ? (
            <Alert role="status" className="border-amber-200 bg-amber-50 text-amber-900">
              <AlertDescription>
                The form is not configured in this environment. Please try again later.
              </AlertDescription>
            </Alert>
          ) : null}

          <Button type="submit" size="lg" loading={pending} disabled={!configured}>
            Send message
            <HiOutlinePaperAirplane aria-hidden="true" />
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default ContactForm
