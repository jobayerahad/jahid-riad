import type { ContactInput } from '@/schemas/contact'

export type TContactForm = ContactInput

export type ContactResult =
  | { ok: true; message: string }
  | {
      ok: false
      code: 'VALIDATION' | 'BOT' | 'RATE_LIMIT' | 'CONFIG' | 'DELIVERY'
      message: string
      fieldErrors?: Partial<Record<keyof ContactInput, string>>
    }
