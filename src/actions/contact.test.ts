import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  getContactEnv,
  isDatabaseConfigured,
  isContactRateLimited,
  sendContactNotification,
  contactMessageCreate,
  contactMessageUpdate,
  getClientIp
} = vi.hoisted(() => ({
  getContactEnv: vi.fn(),
  isDatabaseConfigured: vi.fn(),
  isContactRateLimited: vi.fn(),
  sendContactNotification: vi.fn(),
  contactMessageCreate: vi.fn(),
  contactMessageUpdate: vi.fn(),
  getClientIp: vi.fn()
}))

vi.mock('@/lib/env', () => ({ getContactEnv }))
vi.mock('@/lib/prisma', () => ({
  isDatabaseConfigured,
  prisma: {
    contactMessage: {
      create: contactMessageCreate,
      update: contactMessageUpdate
    }
  }
}))
vi.mock('@/lib/rate-limit', () => ({ isContactRateLimited }))
vi.mock('@/lib/mail', () => ({ sendContactNotification }))
vi.mock('@/lib/client-ip', () => ({ getClientIp }))

import { sendMessage } from '@/actions/contact'

const validInput = {
  name: 'Jahid Riad',
  email: 'visitor@example.com',
  subject: 'Hello there',
  message: 'This is a long enough message.',
  token: 'recaptcha-token'
}

const contactEnv = {
  RESEND_API_KEY: 're_test',
  CONTACT_FROM_EMAIL: 'Jahid Riad Website <contact@jahidriad.com>',
  CONTACT_TO_EMAIL: 'inbox@jahidriad.com',
  RECAPTCHA_SECRET_KEY: 'secret',
  RECAPTCHA_HOSTNAME: 'www.jahidriad.com'
}

describe('sendMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getClientIp.mockResolvedValue('203.0.113.10')
    getContactEnv.mockReturnValue(contactEnv)
    isDatabaseConfigured.mockReturnValue(true)
    isContactRateLimited.mockResolvedValue(false)
    contactMessageCreate.mockResolvedValue({
      id: 'msg_1',
      name: validInput.name,
      email: validInput.email,
      subject: validInput.subject,
      message: validInput.message,
      emailDelivered: false
    })
    contactMessageUpdate.mockResolvedValue({})
    sendContactNotification.mockResolvedValue({ ok: true, id: 'email_1' })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          score: 0.9,
          action: 'contact_form',
          hostname: 'www.jahidriad.com'
        })
      })
    )
  })

  it('saves then marks delivered when Resend succeeds', async () => {
    const result = await sendMessage(validInput)

    expect(result).toEqual({ ok: true, message: 'Message sent. Thank you for reaching out.' })
    expect(contactMessageCreate).toHaveBeenCalledOnce()
    expect(sendContactNotification).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'msg_1', email: validInput.email }),
      contactEnv
    )
    expect(contactMessageUpdate).toHaveBeenCalledWith({
      where: { id: 'msg_1' },
      data: { emailDelivered: true }
    })
  })

  it('keeps the saved message and returns DELIVERY when Resend fails', async () => {
    sendContactNotification.mockResolvedValue({ ok: false, message: 'boom' })

    const result = await sendMessage(validInput)

    expect(result).toMatchObject({ ok: false, code: 'DELIVERY' })
    expect(contactMessageCreate).toHaveBeenCalledOnce()
    expect(contactMessageUpdate).not.toHaveBeenCalled()
  })

  it('returns RATE_LIMIT when the limiter blocks', async () => {
    isContactRateLimited.mockResolvedValue(true)

    const result = await sendMessage(validInput)

    expect(result).toMatchObject({ ok: false, code: 'RATE_LIMIT' })
    expect(contactMessageCreate).not.toHaveBeenCalled()
    expect(sendContactNotification).not.toHaveBeenCalled()
  })

  it('returns CONFIG when contact env is missing', async () => {
    getContactEnv.mockReturnValue(null)

    const result = await sendMessage(validInput)

    expect(result).toMatchObject({ ok: false, code: 'CONFIG' })
    expect(sendContactNotification).not.toHaveBeenCalled()
  })
})
