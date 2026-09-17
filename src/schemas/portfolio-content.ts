import { z } from 'zod'

export const socialLinkSchema = z.object({
  id: z.string().optional(),
  label: z.string().trim().min(1, 'Label is required').max(80),
  href: z.string().trim().url('Enter a valid URL').max(500),
  kind: z.enum(['linkedin', 'scholar']),
  enabled: z.boolean().default(true)
})

export const profileSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  shortName: z.string().trim().min(1, 'Short name is required').max(80),
  role: z.string().trim().min(1, 'Role is required').max(120),
  positioning: z.string().trim().min(1, 'Positioning is required').max(180),
  summary: z.string().trim().min(1, 'Summary is required').max(1200),
  location: z.string().trim().min(1, 'Location is required').max(160),
  socialLinks: z.array(socialLinkSchema).max(10)
})

export const experienceSchema = z.object({
  id: z.string().optional(),
  organization: z.string().trim().min(1, 'Organization is required').max(160),
  role: z.string().trim().min(1, 'Role is required').max(160),
  location: z.string().trim().min(1, 'Location is required').max(160),
  startDate: z.iso.date(),
  endDate: z.iso.date().optional().or(z.literal('')),
  period: z.string().optional(),
  current: z.boolean().default(false),
  summary: z.string().trim().min(1, 'Summary is required').max(1200),
  highlights: z.array(z.string().trim().min(1).max(500)).max(12),
  enabled: z.boolean().default(true),
  updatedAt: z.string().optional()
})

export const educationSchema = z.object({
  id: z.string().optional(),
  institution: z.string().trim().min(1, 'Institution is required').max(200),
  degree: z.string().trim().min(1, 'Degree is required').max(240),
  location: z.string().trim().min(1, 'Location is required').max(160),
  startYear: z.number().int().min(1900).max(2200),
  endYear: z.number().int().min(1900).max(2200),
  detail: z.string().trim().min(1, 'Detail is required').max(1200),
  enabled: z.boolean().default(true),
  updatedAt: z.string().optional()
})

export const mediaReferenceSchema = z.object({
  id: z.string(),
  url: z.string(),
  kind: z.enum(['IMAGE', 'PDF']),
  width: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
  altText: z.string().nullable().optional(),
  originalFilename: z.string().nullable().optional()
})

export const publicationSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, 'Title is required').max(500),
  year: z.number().int().min(1900).max(2200),
  authors: z.array(z.string().trim().min(1).max(160)).max(50),
  venue: z.string().trim().max(500).optional(),
  pages: z.string().trim().max(50).optional(),
  doi: z.string().trim().max(200).optional(),
  type: z.string().trim().min(1, 'Publication type is required').max(100),
  paperUrl: z.string().trim().url('Enter a valid paper URL').max(500).optional().or(z.literal('')),
  scholarUrl: z.string().trim().url('Enter a valid Scholar URL').max(500),
  abstract: z.string().trim().max(2000).optional(),
  mediaAssetId: z.string().nullable().optional(),
  media: mediaReferenceSchema.optional(),
  topics: z.array(z.string().trim().min(1).max(100)).max(20),
  featured: z.boolean().default(false),
  enabled: z.boolean().default(true),
  updatedAt: z.string().optional()
})

export const capabilitySchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, 'Title is required').max(120),
  description: z.string().trim().min(1, 'Description is required').max(500),
  items: z.array(z.string().trim().min(1).max(100)).max(30),
  enabled: z.boolean().default(true),
  updatedAt: z.string().optional()
})

export const siteSettingsSchema = z.object({
  siteName: z.string().trim().min(1).max(120),
  siteUrl: z.string().trim().url().max(500),
  defaultTitle: z.string().trim().min(1).max(160),
  titleTemplate: z.string().trim().min(1).max(160),
  metaDescription: z.string().trim().min(50).max(320),
  keywords: z.array(z.string().trim().min(1).max(80)).max(30),
  openGraphTitle: z.string().trim().min(1).max(160),
  openGraphDescription: z.string().trim().min(1).max(320),
  twitterTitle: z.string().trim().min(1).max(160),
  twitterDescription: z.string().trim().min(1).max(320),
  heroImageId: z.string().nullable().optional(),
  aboutImageId: z.string().nullable().optional(),
  logoImageId: z.string().nullable().optional(),
  openGraphImageId: z.string().nullable().optional(),
  cvAssetId: z.string().nullable().optional(),
  heroImage: mediaReferenceSchema.optional(),
  aboutImage: mediaReferenceSchema.optional(),
  logoImage: mediaReferenceSchema.optional(),
  openGraphImage: mediaReferenceSchema.optional(),
  cvAsset: mediaReferenceSchema.optional()
})

export const contentCopySchema = z.object({
  heroHeading: z.string().trim().min(1).max(180),
  heroAccent: z.string().trim().min(1).max(100),
  heroIntroduction: z.string().trim().min(1).max(600),
  heroPrimaryLabel: z.string().trim().min(1).max(80),
  heroPrimaryHref: z.string().trim().min(1).max(500),
  heroSecondaryLabel: z.string().trim().min(1).max(80),
  heroSecondaryHref: z.string().trim().min(1).max(500),
  heroFocusLabel: z.string().trim().min(1).max(80),
  aboutEyebrow: z.string().trim().min(1).max(80),
  aboutTitle: z.string().trim().min(1).max(180),
  aboutBody: z.string().trim().min(1).max(1600),
  aboutImageAlt: z.string().trim().min(1).max(240),
  aboutCaptionLabel: z.string().trim().min(1).max(80),
  principleOneTitle: z.string().trim().min(1).max(120),
  principleOneText: z.string().trim().min(1).max(500),
  principleTwoTitle: z.string().trim().min(1).max(120),
  principleTwoText: z.string().trim().min(1).max(500),
  experienceEyebrow: z.string().trim().min(1).max(80),
  experienceTitle: z.string().trim().min(1).max(180),
  experienceDescription: z.string().trim().min(1).max(500),
  publicationsEyebrow: z.string().trim().min(1).max(80),
  publicationsTitle: z.string().trim().min(1).max(180),
  publicationsDescription: z.string().trim().min(1).max(500),
  publicationsActionLabel: z.string().trim().min(1).max(80),
  capabilitiesEyebrow: z.string().trim().min(1).max(80),
  capabilitiesTitle: z.string().trim().min(1).max(180),
  capabilitiesDescription: z.string().trim().min(1).max(500),
  educationEyebrow: z.string().trim().min(1).max(80),
  educationTitle: z.string().trim().min(1).max(180),
  educationDescription: z.string().trim().min(1).max(500),
  contactEyebrow: z.string().trim().min(1).max(80),
  contactTitle: z.string().trim().min(1).max(180),
  contactDescription: z.string().trim().min(1).max(500),
  contactPanelTitle: z.string().trim().min(1).max(120),
  contactPrivacyCopy: z.string().trim().min(1).max(800)
})

const publishedExperienceSchema = experienceSchema.extend({ id: z.string().min(1) })
const publishedEducationSchema = educationSchema.extend({ id: z.string().min(1) })
const publishedPublicationSchema = publicationSchema.extend({ id: z.string().min(1) })
const publishedCapabilitySchema = capabilitySchema.extend({ id: z.string().min(1) })

export const publishedPortfolioSnapshotSchema = z.object({
  schemaVersion: z.literal(1),
  settings: siteSettingsSchema,
  copy: contentCopySchema,
  profile: profileSchema,
  experiences: z.array(publishedExperienceSchema),
  education: z.array(publishedEducationSchema),
  publications: z.array(publishedPublicationSchema),
  capabilities: z.array(publishedCapabilitySchema)
})

export const legacyPortfolioContentSchema = z.object({
  profile: profileSchema
    .omit({ socialLinks: true })
    .extend({ socialLinks: z.array(socialLinkSchema.omit({ enabled: true })) }),
  experiences: z.array(experienceSchema.omit({ enabled: true, updatedAt: true })),
  education: z.array(educationSchema.omit({ enabled: true, updatedAt: true })),
  publications: z.array(publicationSchema.omit({ enabled: true, updatedAt: true })),
  capabilities: z.array(capabilitySchema.omit({ enabled: true, updatedAt: true }))
})

export type ProfileInput = z.input<typeof profileSchema>
export type ExperienceInput = z.input<typeof experienceSchema>
export type EducationInput = z.input<typeof educationSchema>
export type PublicationInput = z.input<typeof publicationSchema>
export type CapabilityInput = z.input<typeof capabilitySchema>
export type SiteSettingsInput = z.input<typeof siteSettingsSchema>
export type ContentCopyInput = z.input<typeof contentCopySchema>
export type PublishedPortfolioSnapshot = z.infer<typeof publishedPortfolioSnapshotSchema>
export type PortfolioContent = PublishedPortfolioSnapshot
