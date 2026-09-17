import { z } from 'zod'
import {
  capabilitySchema,
  contentCopySchema,
  educationSchema,
  experienceSchema,
  profileSchema,
  publicationSchema,
  siteSettingsSchema,
  socialLinkSchema
} from '@/schemas/portfolio-content'

export const profileHeroFormSchema = profileSchema.extend({
  socialLinks: z.array(socialLinkSchema),
  heroHeading: contentCopySchema.shape.heroHeading,
  heroAccent: contentCopySchema.shape.heroAccent,
  heroIntroduction: contentCopySchema.shape.heroIntroduction,
  heroPrimaryLabel: contentCopySchema.shape.heroPrimaryLabel,
  heroPrimaryHref: contentCopySchema.shape.heroPrimaryHref,
  heroSecondaryLabel: contentCopySchema.shape.heroSecondaryLabel,
  heroSecondaryHref: contentCopySchema.shape.heroSecondaryHref,
  heroFocusLabel: contentCopySchema.shape.heroFocusLabel,
  heroImageId: z.string().nullable().optional(),
  expectedUpdatedAt: z.string().optional(),
  expectedCopyUpdatedAt: z.string().optional(),
  expectedSettingsUpdatedAt: z.string().optional()
})

export const aboutFormSchema = contentCopySchema
  .pick({
    aboutEyebrow: true,
    aboutTitle: true,
    aboutBody: true,
    aboutImageAlt: true,
    aboutCaptionLabel: true,
    principleOneTitle: true,
    principleOneText: true,
    principleTwoTitle: true,
    principleTwoText: true
  })
  .extend({
    aboutImageId: z.string().nullable().optional(),
    expectedUpdatedAt: z.string().optional(),
    expectedSettingsUpdatedAt: z.string().optional()
  })

export const sectionCopyFormSchema = contentCopySchema
  .pick({
    experienceEyebrow: true,
    experienceTitle: true,
    experienceDescription: true,
    publicationsEyebrow: true,
    publicationsTitle: true,
    publicationsDescription: true,
    publicationsActionLabel: true,
    capabilitiesEyebrow: true,
    capabilitiesTitle: true,
    capabilitiesDescription: true,
    educationEyebrow: true,
    educationTitle: true,
    educationDescription: true,
    contactEyebrow: true,
    contactTitle: true,
    contactDescription: true,
    contactPanelTitle: true,
    contactPrivacyCopy: true
  })
  .extend({ expectedUpdatedAt: z.string().optional() })

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
  if (!value.current && !value.endDate) {
    context.addIssue({ code: 'custom', path: ['endDate'], message: 'End date is required for a past role' })
  }
  if (value.endDate && value.endDate < value.startDate) {
    context.addIssue({ code: 'custom', path: ['endDate'], message: 'End date must not be before start date' })
  }
})
export const publicationFormSchema = publicationSchema
export const capabilityFormSchema = capabilitySchema
export const educationFormSchema = educationSchema.refine((value) => value.endYear >= value.startYear, {
  path: ['endYear'],
  message: 'End year must not be before start year'
})

export const publishSchema = z.object({ note: z.string().trim().max(160).optional() })
export const idSchema = z
  .string()
  .uuid()
  .or(z.string().regex(/^[a-z0-9][a-z0-9-]{1,119}$/i))

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
