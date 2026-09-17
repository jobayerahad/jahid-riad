import { z } from 'zod'

const singleLine = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min, `${label} must be at least ${min} characters`)
    .max(max, `${label} must be ${max} characters or fewer`)
    .refine((value) => !/[\r\n\u0000-\u001f\u007f]/.test(value), `${label} contains unsupported characters`)

export const contactSchema = z.object({
  name: singleLine('Name', 2, 80),
  email: z.string().trim().email('Enter a valid email address').max(254, 'Email is too long'),
  subject: singleLine('Subject', 5, 120),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(3000, 'Message is too long'),
  token: z.string().min(1, 'Bot verification is required').max(4096, 'Bot verification token is invalid')
})

export type ContactInput = z.infer<typeof contactSchema>
