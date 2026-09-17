'use server'

import { headers } from 'next/headers'
import { contactSchema } from '@/schemas/contact'
import type { ContactResult } from '@/types'
import { createContactEmail } from '@/lib/email-template'
import { getContactEnv } from '@/lib/env'
import { isContactRateLimited } from '@/lib/rate-limit'
import { sendEmail } from './utilities'

type RecaptchaResponse = {
  success?: boolean
  score?: number
  action?: string
  hostname?: string
}

const getClientKey = async () => {
  const requestHeaders = await headers()
  return (
    requestHeaders.get('cf-connecting-ip') ?? requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  )
}

export const sendMessage = async (input: unknown): Promise<ContactResult> => {
  const parsed = contactSchema.safeParse(input)

  if (!parsed.success) {
    const flattened = parsed.error.flatten().fieldErrors
    return {
      ok: false,
      code: 'VALIDATION',
      message: 'Please review the highlighted fields.',
      fieldErrors: Object.fromEntries(Object.entries(flattened).map(([field, messages]) => [field, messages?.[0]]))
    }
  }

  const env = getContactEnv()
  if (!env)
    return {
      ok: false,
      code: 'CONFIG',
      message: 'The contact form is temporarily unavailable. Please try again later.'
    }

  try {
    if (await isContactRateLimited(await getClientKey(), env)) {
      return {
        ok: false,
        code: 'RATE_LIMIT',
        message: 'Too many attempts. Please wait a few minutes and try again.'
      }
    }
  } catch {
    return {
      ok: false,
      code: 'CONFIG',
      message: 'The contact form is temporarily unavailable. Please try again later.'
    }
  }

  try {
    const verification = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: env.RECAPTCHA_SECRET_KEY, response: parsed.data.token }),
      cache: 'no-store'
    })
    const result = (await verification.json()) as RecaptchaResponse

    if (
      !verification.ok ||
      !result.success ||
      (result.score ?? 0) < 0.5 ||
      result.action !== 'contact_form' ||
      result.hostname !== env.RECAPTCHA_HOSTNAME
    ) {
      return { ok: false, code: 'BOT', message: 'Bot verification failed. Please refresh and try again.' }
    }

    const email = createContactEmail(parsed.data)
    await sendEmail(
      { user: env.GMAIL_USER, password: env.GMAIL_APP_PASSWORD },
      {
        to: env.RECEIVER_EMAIL,
        replyTo: parsed.data.email,
        subject: `[Portfolio] ${parsed.data.subject}`,
        ...email
      }
    )

    return { ok: true, message: 'Your message was sent. Thank you for getting in touch.' }
  } catch {
    return {
      ok: false,
      code: 'DELIVERY',
      message: 'The message could not be sent right now. Please try again later.'
    }
  }
}
