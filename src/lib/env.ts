import { z } from 'zod'

const contactEnvSchema = z.object({
  RESEND_API_KEY: z.string().min(1),
  CONTACT_FROM_EMAIL: z.string().min(3),
  CONTACT_TO_EMAIL: z.string().email(),
  RECAPTCHA_SECRET_KEY: z.string().min(1),
  RECAPTCHA_HOSTNAME: z.string().min(1)
})

export const getContactEnv = () => {
  const result = contactEnvSchema.safeParse(process.env)
  if (!result.success) return null
  return result.data
}
