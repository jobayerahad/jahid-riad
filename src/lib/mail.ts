import 'server-only'

import { Resend } from 'resend'
import { ContactNotification } from '@/emails/contact-notification'

export type ContactMailPayload = {
  id: string
  name: string
  email: string
  subject: string
  message: string
}

export type ContactMailConfig = {
  RESEND_API_KEY: string
  CONTACT_FROM_EMAIL: string
  CONTACT_TO_EMAIL: string
}

export type ContactMailResult = { ok: true; id: string | null } | { ok: false; message: string }

let resendClient: Resend | null = null

const getResend = (apiKey: string) => {
  if (!resendClient) resendClient = new Resend(apiKey)
  return resendClient
}

export const sendContactNotification = async (
  message: ContactMailPayload,
  config: ContactMailConfig
): Promise<ContactMailResult> => {
  const text = `Name: ${message.name}\nEmail: ${message.email}\nSubject: ${message.subject}\n\n${message.message}`

  const { data, error } = await getResend(config.RESEND_API_KEY).emails.send(
    {
      from: config.CONTACT_FROM_EMAIL,
      to: config.CONTACT_TO_EMAIL,
      replyTo: message.email,
      subject: `[Portfolio] ${message.subject}`,
      react: ContactNotification({
        name: message.name,
        email: message.email,
        subject: message.subject,
        message: message.message
      }),
      text
    },
    { idempotencyKey: `contact/${message.id}` }
  )

  if (error) {
    return { ok: false, message: error.message }
  }

  return { ok: true, id: data?.id ?? null }
}
