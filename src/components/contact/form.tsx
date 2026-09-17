'use client'

import { useState, useTransition } from 'react'
import { Alert, Button, Stack, TextInput, Textarea } from '@mantine/core'
import { schemaResolver, useForm } from '@mantine/form'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'
import { FaPaperPlane } from 'react-icons/fa'
import { sendMessage } from '@/actions/contact'
import { contactSchema, type ContactInput } from '@/schemas/contact'
import type { ContactResult } from '@/types'
import classes from './styles.module.css'

type Props = { configured: boolean }

const INITIAL_VALUES: ContactInput = { name: '', email: '', subject: '', message: '', token: '' }

const ContactForm = ({ configured }: Props) => {
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<ContactResult | null>(null)
  const recaptcha = useGoogleReCaptcha()
  const form = useForm<ContactInput>({
    mode: 'uncontrolled',
    initialValues: INITIAL_VALUES,
    validate: schemaResolver(contactSchema, { sync: true })
  })

  const focusFirstError = () => {
    requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('#contact-form [aria-invalid="true"]')?.focus()
    })
  }

  const handleSubmit = (values: ContactInput) => {
    setResult(null)
    startTransition(async () => {
      if (!recaptcha.executeRecaptcha) {
        setResult({ ok: false, code: 'BOT', message: 'Bot verification is still loading. Please try again.' })
        return
      }

      const token = await recaptcha.executeRecaptcha('contact_form')
      const response = await sendMessage({ ...values, token })
      setResult(response)

      if (response.ok) form.reset()
      else if (response.fieldErrors) {
        form.setErrors(response.fieldErrors)
        focusFirstError()
      }
    })
  }

  return (
    <div className={classes.formCard}>
      <form
        id="contact-form"
        noValidate
        onSubmit={form.onSubmit(handleSubmit, focusFirstError)}
        aria-describedby={result ? 'contact-result' : undefined}
      >
        <Stack gap="md">
          <TextInput
            required
            label="Name"
            placeholder="Your name"
            autoComplete="name"
            key={form.key('name')}
            {...form.getInputProps('name')}
          />
          <TextInput
            required
            type="email"
            label="Email"
            placeholder="you@example.com"
            autoComplete="email"
            inputMode="email"
            key={form.key('email')}
            {...form.getInputProps('email')}
          />
          <TextInput
            required
            label="Subject"
            placeholder="What would you like to discuss?"
            autoComplete="off"
            key={form.key('subject')}
            {...form.getInputProps('subject')}
          />
          <Textarea
            required
            label="Message"
            placeholder="Share the context, goal, and any useful timeline."
            minRows={6}
            autosize
            key={form.key('message')}
            {...form.getInputProps('message')}
          />

          {result && (
            <Alert id="contact-result" role={result.ok ? 'status' : 'alert'} color={result.ok ? 'teal' : 'red'}>
              {result.message}
            </Alert>
          )}

          {!configured && (
            <Alert role="status" color="yellow">
              The form is not configured in this environment. Please try again later.
            </Alert>
          )}

          <Button
            type="submit"
            size="md"
            rightSection={<FaPaperPlane aria-hidden="true" />}
            loading={pending}
            disabled={!configured}
          >
            Send message
          </Button>
        </Stack>
      </form>
    </div>
  )
}

export default ContactForm
