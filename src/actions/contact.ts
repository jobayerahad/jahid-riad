'use server'

import { contactSchema } from '@/schemas/contact'
import type { ContactResult } from '@/types'
import { getClientIp } from '@/lib/client-ip'
import { getContactEnv } from '@/lib/env'
import { sendContactNotification } from '@/lib/mail'
import { isDatabaseConfigured, prisma } from '@/lib/prisma'
import { isContactRateLimited } from '@/lib/rate-limit'

type RecaptchaResponse = {
  success?: boolean
  score?: number
  action?: string
  hostname?: string
}

const CONFIG_UNAVAILABLE: ContactResult = {
  ok: false,
  code: 'CONFIG',
  message: 'The contact form is temporarily unavailable. Please try again later.'
}

const getClientKey = async () => (await getClientIp()) ?? 'unknown'

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
  if (!env) return CONFIG_UNAVAILABLE

  const hasDatabase = isDatabaseConfigured()
  if (!hasDatabase) {
    if (process.env.NODE_ENV === 'production') return CONFIG_UNAVAILABLE
  } else {
    try {
      if (await isContactRateLimited(await getClientKey())) {
        return {
          ok: false,
          code: 'RATE_LIMIT',
          message: 'Too many attempts. Please wait a few minutes and try again.'
        }
      }
    } catch {
      return CONFIG_UNAVAILABLE
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

    if (!hasDatabase) {
      const delivery = await sendContactNotification(
        {
          id: crypto.randomUUID(),
          name: parsed.data.name,
          email: parsed.data.email,
          subject: parsed.data.subject,
          message: parsed.data.message
        },
        env
      )

      if (!delivery.ok) {
        return {
          ok: false,
          code: 'DELIVERY',
          message: 'Something went wrong while sending your message. Please try again.'
        }
      }

      return { ok: true, message: 'Message sent. Thank you for reaching out.' }
    }

    const saved = await prisma.contactMessage.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        subject: parsed.data.subject,
        message: parsed.data.message,
        emailDelivered: false
      }
    })

    const delivery = await sendContactNotification(
      {
        id: saved.id,
        name: saved.name,
        email: saved.email,
        subject: saved.subject,
        message: saved.message
      },
      env
    )

    if (!delivery.ok) {
      return {
        ok: false,
        code: 'DELIVERY',
        message: 'Your message was saved, but email delivery failed. Please try again later.'
      }
    }

    await prisma.contactMessage.update({
      where: { id: saved.id },
      data: { emailDelivered: true }
    })

    return { ok: true, message: 'Message sent. Thank you for reaching out.' }
  } catch {
    return {
      ok: false,
      code: 'DELIVERY',
      message: 'Something went wrong while sending your message. Please try again.'
    }
  }
}
