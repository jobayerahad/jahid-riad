import { z } from 'zod'

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1).optional(),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(12).optional(),
  GA_TRACKING_ID: z.string().optional(),
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY: z.string().optional(),
  RECAPTCHA_SECRET_KEY: z.string().optional(),
  RECAPTCHA_HOSTNAME: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  CONTACT_FROM_EMAIL: z.string().optional(),
  CONTACT_TO_EMAIL: z.string().email().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional()
})

const contactEnvSchema = z.object({
  RESEND_API_KEY: z.string().min(1),
  CONTACT_FROM_EMAIL: z.string().min(3),
  CONTACT_TO_EMAIL: z.string().email(),
  RECAPTCHA_SECRET_KEY: z.string().min(1),
  RECAPTCHA_HOSTNAME: z.string().min(1)
})

export const getServerEnv = () => serverEnvSchema.safeParse(process.env)

export const getContactEnv = () => {
  const result = contactEnvSchema.safeParse(process.env)
  if (!result.success) return null
  return result.data
}

export type ContactEnv = z.infer<typeof contactEnvSchema>
