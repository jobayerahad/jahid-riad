import { z } from 'zod'
import {
  aboutPrincipleSchema,
  capabilitySchema,
  educationSchema,
  experienceSchema,
  heroCopySchema,
  learningSchema,
  profileSchema,
  publicationSchema,
  sectionCopySchema,
  siteSettingsSchema,
  socialLinkSchema,
  workStorySchema
} from '@/schemas/portfolio-content'

export const profileHeroFormSchema = profileSchema.extend({
  socialLinks: z.array(socialLinkSchema),
  ...heroCopySchema.shape,
  heroImageId: z.string().nullable().optional(),
  expectedUpdatedAt: z.string().optional(),
  expectedHeroUpdatedAt: z.string().optional(),
  expectedSettingsUpdatedAt: z.string().optional()
})

export const aboutFormSchema = z.object({
  aboutEyebrow: z.string().trim().min(1).max(80),
  aboutTitle: z.string().trim().min(1).max(180),
  aboutBody: z.string().trim().min(1).max(1600),
  aboutImageAlt: z.string().trim().min(1).max(240),
  aboutCaptionLabel: z.string().trim().min(1).max(80),
  principles: z.array(aboutPrincipleSchema).min(1).max(8),
  aboutImageId: z.string().nullable().optional(),
  expectedUpdatedAt: z.string().optional(),
  expectedSettingsUpdatedAt: z.string().optional()
})

export const sectionCopyFormSchema = z.object({
  sections: z.array(sectionCopySchema).min(1),
  contactPanelTitle: z.string().trim().min(1).max(120),
  contactPrivacyCopy: z.string().trim().min(1).max(800),
  expectedUpdatedAt: z.string().optional()
})

export const settingsFormSchema = siteSettingsSchema
  .omit({
    heroImage: true,
    aboutImage: true,
    logoImage: true,
    openGraphImage: true,
    cvAsset: true,
    heroImageId: true,
    aboutImageId: true
  })
  .extend({ expectedUpdatedAt: z.string().optional() })

export const experienceFormSchema = experienceSchema.superRefine((value, context) => {
  const isCurrent = value.current ?? !value.endDate
  if (!isCurrent && !value.endDate) {
    context.addIssue({ code: 'custom', path: ['endDate'], message: 'End date is required for a past role' })
  }
  if (value.endDate && value.endDate < value.startDate) {
    context.addIssue({ code: 'custom', path: ['endDate'], message: 'End date must not be before start date' })
  }
})
export const publicationFormSchema = publicationSchema
export const capabilityFormSchema = capabilitySchema
export const learningFormSchema = learningSchema
export const workStoryFormSchema = workStorySchema
export const educationFormSchema = educationSchema.refine(
  (value) => value.endYear == null || value.endYear >= value.startYear,
  {
    path: ['endYear'],
    message: 'End year must not be before start year'
  }
)

export const publishSchema = z.object({ note: z.string().trim().max(160).optional() })
export const idSchema = z
  .string()
  .uuid()
  .or(z.string().regex(/^[a-z0-9][a-z0-9-]{1,119}$/i))

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(12).max(128),
    newPassword: z.string().min(12).max(128),
    confirmPassword: z.string().min(12).max(128)
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match'
  })

export const mediaRegistrationSchema = z
  .object({
    publicId: z.string().trim().startsWith('jahid-riad/').max(300),
    kind: z.enum(['IMAGE', 'PDF']),
    originalFilename: z
      .string()
      .trim()
      .min(1)
      .max(240)
      .refine((value) => !/[\\/\u0000-\u001f]/.test(value), 'Filename contains invalid characters'),
    altText: z.string().trim().max(240).optional()
  })
  .superRefine((value, context) => {
    if (value.kind === 'IMAGE' && !value.altText) {
      context.addIssue({ code: 'custom', path: ['altText'], message: 'Alt text is required for images' })
    }
  })
