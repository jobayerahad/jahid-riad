import { z } from 'zod'

const contactEnvSchema = z.object({
  GMAIL_USER: z.string().email(),
  GMAIL_APP_PASSWORD: z.string().min(1),
  RECEIVER_EMAIL: z.string().email(),
  RECAPTCHA_SECRET_KEY: z.string().min(1),
  RECAPTCHA_HOSTNAME: z.string().min(1),
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1)
})

export const getContactEnv = () => {
  const result = contactEnvSchema.safeParse(process.env)

  if (!result.success) return null

  return result.data
}

export type ContactEnv = z.infer<typeof contactEnvSchema>
