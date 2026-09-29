import { z } from 'zod'

const isSafeRelativeHref = (value: string) =>
  (value.startsWith('/') && !value.startsWith('//')) || value.startsWith('#')

const isAllowedAbsoluteUrl = (value: string, schemes: readonly string[]) => {
  try {
    const parsed = new URL(value)
    return schemes.includes(parsed.protocol)
  } catch {
    return false
  }
}

/** Allows https, http, mailto, same-origin paths, and in-page anchors. Blocks javascript:/data:. */
export const safeHref = z
  .string()
  .trim()
  .min(1, 'Enter a link')
  .max(500)
  .refine(
    (value) => isSafeRelativeHref(value) || isAllowedAbsoluteUrl(value, ['https:', 'http:', 'mailto:']),
    'Enter a valid http(s), mailto, path, or anchor link'
  )

/** External links must be https only. */
export const externalUrl = z
  .string()
  .trim()
  .max(500)
  .refine((value) => isAllowedAbsoluteUrl(value, ['https:']), 'Enter a valid https URL')

export const optionalExternalUrl = z
  .string()
  .trim()
  .max(500)
  .optional()
  .or(z.literal(''))
  .refine((value) => !value || isAllowedAbsoluteUrl(value, ['https:']), 'Enter a valid https URL')

export const socialPlatformSchema = z.enum([
  'linkedin',
  'scholar',
  'github',
  'orcid',
  'researchgate',
  'x',
  'email',
  'website'
])

export const publicationTypeSchema = z.enum([
  'JOURNAL_ARTICLE',
  'CONFERENCE_PAPER',
  'WORKSHOP_PAPER',
  'BOOK_CHAPTER',
  'PREPRINT',
  'THESIS',
  'OTHER'
])

export const publicationStatusSchema = z.enum(['PUBLISHED', 'ACCEPTED', 'UNDER_REVIEW', 'PREPRINT'])

export const siteSectionSchema = z.enum([
  'ABOUT',
  'EXPERIENCE',
  'PUBLICATIONS',
  'CAPABILITIES',
  'EDUCATION',
  'LEARNING',
  'CONTACT',
  'WORK'
])

export const socialLinkSchema = z.object({
  id: z.string().optional(),
  label: z.string().trim().min(1, 'Label is required').max(80),
  href: externalUrl,
  kind: socialPlatformSchema,
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

export const heroCopySchema = z.object({
  heading: z.string().trim().min(1).max(180),
  accent: z.string().trim().min(1).max(100),
  introduction: z.string().trim().min(1).max(600),
  primaryLabel: z.string().trim().min(1).max(80),
  primaryHref: safeHref,
  secondaryLabel: z.string().trim().min(1).max(80),
  secondaryHref: safeHref,
  focusLabel: z.string().trim().min(1).max(80)
})

export const sectionCopySchema = z.object({
  section: siteSectionSchema,
  eyebrow: z.string().trim().min(1).max(80),
  title: z.string().trim().min(1).max(180),
  description: z.string().trim().min(1).max(500),
  actionLabel: z.string().trim().max(80).optional().or(z.literal(''))
})

export const aboutPrincipleSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1).max(120),
  text: z.string().trim().min(1).max(500),
  enabled: z.boolean().default(true)
})

export const experienceSchema = z.object({
  id: z.string().optional(),
  organization: z.string().trim().min(1, 'Organization is required').max(160),
  organizationUrl: optionalExternalUrl,
  role: z.string().trim().min(1, 'Role is required').max(160),
  location: z.string().trim().min(1, 'Location is required').max(160),
  startDate: z.iso.date(),
  endDate: z.iso.date().optional().or(z.literal('')),
  period: z.string().optional(),
  current: z.boolean().optional(),
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
  endYear: z.number().int().min(1900).max(2200).nullable().optional(),
  detail: z.string().trim().max(1200).optional().or(z.literal('')),
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

export const publicationAuthorSchema = z.object({
  name: z.string().trim().min(1).max(160),
  isSelf: z.boolean().default(false)
})

export const publicationSchema = z.object({
  id: z.string().optional(),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use a lowercase kebab-case slug'),
  title: z.string().trim().min(1, 'Title is required').max(500),
  year: z.number().int().min(1900).max(2200),
  month: z.number().int().min(1).max(12).nullable().optional(),
  authors: z.array(publicationAuthorSchema).max(50),
  venue: z.string().trim().max(500).optional().or(z.literal('')),
  pages: z.string().trim().max(50).optional().or(z.literal('')),
  doi: z.string().trim().max(200).optional().or(z.literal('')),
  type: publicationTypeSchema,
  status: publicationStatusSchema.default('PUBLISHED'),
  paperUrl: optionalExternalUrl,
  scholarUrl: optionalExternalUrl,
  abstract: z.string().trim().max(2000).optional().or(z.literal('')),
  bibtex: z.string().trim().max(8000).optional().or(z.literal('')),
  coverImageId: z.string().nullable().optional(),
  pdfAssetId: z.string().nullable().optional(),
  coverImage: mediaReferenceSchema.optional(),
  pdfAsset: mediaReferenceSchema.optional(),
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

export const learningSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1).max(200),
  issuer: z.string().trim().min(1).max(160),
  year: z.number().int().min(1900).max(2200).nullable().optional(),
  credentialUrl: optionalExternalUrl,
  enabled: z.boolean().default(true),
  updatedAt: z.string().optional()
})

export const workStorySchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1).max(120),
  body: z.string().trim().min(1).max(800),
  evidence: z.string().trim().min(1).max(200),
  href: safeHref,
  linkLabel: z.string().trim().min(1).max(80),
  visualLabel: z.string().trim().min(1).max(40),
  enabled: z.boolean().default(true),
  updatedAt: z.string().optional()
})

export const siteSettingsSchema = z.object({
  siteName: z.string().trim().min(1).max(120),
  siteUrl: externalUrl,
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
  heroPrimaryHref: safeHref,
  heroSecondaryLabel: z.string().trim().min(1).max(80),
  heroSecondaryHref: safeHref,
  heroFocusLabel: z.string().trim().min(1).max(80),
  aboutEyebrow: z.string().trim().min(1).max(80),
  aboutTitle: z.string().trim().min(1).max(180),
  aboutBody: z.string().trim().min(1).max(1600),
  aboutImageAlt: z.string().trim().min(1).max(240),
  aboutCaptionLabel: z.string().trim().min(1).max(80),
  principles: z.array(aboutPrincipleSchema).max(8),
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
  learningEyebrow: z.string().trim().min(1).max(80),
  learningTitle: z.string().trim().min(1).max(180),
  learningDescription: z.string().trim().min(1).max(500),
  workEyebrow: z.string().trim().min(1).max(80),
  workTitle: z.string().trim().min(1).max(180),
  workDescription: z.string().trim().min(1).max(500),
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
const publishedLearningSchema = learningSchema.extend({ id: z.string().min(1) })
const publishedWorkStorySchema = workStorySchema.extend({ id: z.string().min(1) })

export const publishedPortfolioSnapshotSchema = z.object({
  schemaVersion: z.literal(2),
  settings: siteSettingsSchema,
  copy: contentCopySchema,
  hero: heroCopySchema,
  sections: z.array(sectionCopySchema),
  principles: z.array(aboutPrincipleSchema.extend({ id: z.string().min(1) })),
  profile: profileSchema,
  experiences: z.array(publishedExperienceSchema),
  education: z.array(publishedEducationSchema),
  publications: z.array(publishedPublicationSchema),
  capabilities: z.array(publishedCapabilitySchema),
  learning: z.array(publishedLearningSchema),
  workStories: z.array(publishedWorkStorySchema)
})

export type ProfileInput = z.input<typeof profileSchema>
export type ExperienceInput = z.input<typeof experienceSchema>
export type EducationInput = z.input<typeof educationSchema>
export type PublicationInput = z.input<typeof publicationSchema>
export type CapabilityInput = z.input<typeof capabilitySchema>
export type LearningInput = z.input<typeof learningSchema>
export type WorkStoryInput = z.input<typeof workStorySchema>
export type SiteSettingsInput = z.input<typeof siteSettingsSchema>
export type ContentCopyInput = z.input<typeof contentCopySchema>
export type HeroCopyInput = z.input<typeof heroCopySchema>
export type SectionCopyInput = z.input<typeof sectionCopySchema>
export type AboutPrincipleInput = z.input<typeof aboutPrincipleSchema>
export type PublishedPortfolioSnapshot = z.infer<typeof publishedPortfolioSnapshotSchema>

const publicationTypeFromLegacy = (type: string): z.infer<typeof publicationTypeSchema> => {
  const lower = type.toLowerCase()
  if (lower.includes('journal')) return 'JOURNAL_ARTICLE'
  if (lower.includes('workshop')) return 'WORKSHOP_PAPER'
  if (lower.includes('chapter') || lower.includes('book')) return 'BOOK_CHAPTER'
  if (lower.includes('preprint')) return 'PREPRINT'
  if (lower.includes('thesis')) return 'THESIS'
  if (lower.includes('conference') || lower.includes('ieee')) return 'CONFERENCE_PAPER'
  return 'OTHER'
}

const authorFromLegacy = (author: string | { name: string; isSelf?: boolean }) => {
  if (typeof author === 'string') {
    const isSelf = /jahid|riad/i.test(author)
    return { name: author, isSelf }
  }
  return { name: author.name, isSelf: Boolean(author.isSelf) }
}

/** Upgrades a v1 snapshot (or unknown legacy JSON) to the current v2 shape. */
export const upgradeSnapshot = (raw: unknown): PublishedPortfolioSnapshot => {
  if (
    raw &&
    typeof raw === 'object' &&
    'schemaVersion' in raw &&
    (raw as { schemaVersion: number }).schemaVersion === 2
  ) {
    return publishedPortfolioSnapshotSchema.parse(raw)
  }

  const v1 = raw as {
    schemaVersion?: number
    settings?: SiteSettingsInput
    copy?: Record<string, string>
    profile?: ProfileInput
    experiences?: Array<ExperienceInput & { current?: boolean }>
    education?: EducationInput[]
    publications?: Array<
      Omit<PublicationInput, 'authors' | 'type' | 'slug'> & {
        id?: string
        type?: string
        authors?: Array<string | { name: string; isSelf?: boolean }>
        mediaAssetId?: string | null
        media?: z.infer<typeof mediaReferenceSchema>
        scholarUrl?: string
      }
    >
    capabilities?: CapabilityInput[]
  }

  const copy = v1.copy ?? {}
  const principles = [
    {
      id: 'principle-1',
      title: copy.principleOneTitle || 'Clarity before complexity',
      text: copy.principleOneText || 'Define the problem before choosing technology.',
      enabled: true
    },
    {
      id: 'principle-2',
      title: copy.principleTwoTitle || 'Evidence over claims',
      text: copy.principleTwoText || 'Use research and observable outcomes.',
      enabled: true
    }
  ]

  const hero = {
    heading: copy.heroHeading || 'Turning complex problems into',
    accent: copy.heroAccent || 'systems that work.',
    introduction: copy.heroIntroduction || '',
    primaryLabel: copy.heroPrimaryLabel || 'Explore work',
    primaryHref: copy.heroPrimaryHref || '#work',
    secondaryLabel: copy.heroSecondaryLabel || 'View research',
    secondaryHref: copy.heroSecondaryHref || '#research',
    focusLabel: copy.heroFocusLabel || 'Business · Technology · Research'
  }

  const sections = [
    {
      section: 'ABOUT' as const,
      eyebrow: copy.aboutEyebrow || 'Profile',
      title: copy.aboutTitle || 'About',
      description: copy.aboutBody || '',
      actionLabel: ''
    },
    {
      section: 'EXPERIENCE' as const,
      eyebrow: copy.experienceEyebrow || 'Experience',
      title: copy.experienceTitle || 'Experience',
      description: copy.experienceDescription || '',
      actionLabel: ''
    },
    {
      section: 'PUBLICATIONS' as const,
      eyebrow: copy.publicationsEyebrow || 'Research',
      title: copy.publicationsTitle || 'Publications',
      description: copy.publicationsDescription || '',
      actionLabel: copy.publicationsActionLabel || 'View all publications'
    },
    {
      section: 'CAPABILITIES' as const,
      eyebrow: copy.capabilitiesEyebrow || 'Capabilities',
      title: copy.capabilitiesTitle || 'Capabilities',
      description: copy.capabilitiesDescription || '',
      actionLabel: ''
    },
    {
      section: 'EDUCATION' as const,
      eyebrow: copy.educationEyebrow || 'Education',
      title: copy.educationTitle || 'Education',
      description: copy.educationDescription || '',
      actionLabel: ''
    },
    {
      section: 'LEARNING' as const,
      eyebrow: 'Learning',
      title: 'Professional learning',
      description: 'Courses, reviewing practice, and language skills.',
      actionLabel: ''
    },
    {
      section: 'WORK' as const,
      eyebrow: 'Selected work',
      title: 'Selected work',
      description: 'Stories that connect analysis, systems, and research.',
      actionLabel: ''
    },
    {
      section: 'CONTACT' as const,
      eyebrow: copy.contactEyebrow || 'Contact',
      title: copy.contactTitle || 'Contact',
      description: copy.contactDescription || '',
      actionLabel: ''
    }
  ]

  const flatCopy = {
    heroHeading: hero.heading,
    heroAccent: hero.accent,
    heroIntroduction: hero.introduction,
    heroPrimaryLabel: hero.primaryLabel,
    heroPrimaryHref: hero.primaryHref,
    heroSecondaryLabel: hero.secondaryLabel,
    heroSecondaryHref: hero.secondaryHref,
    heroFocusLabel: hero.focusLabel,
    aboutEyebrow: sections[0]!.eyebrow,
    aboutTitle: sections[0]!.title,
    aboutBody: copy.aboutBody || sections[0]!.description,
    aboutImageAlt: copy.aboutImageAlt || 'Portrait',
    aboutCaptionLabel: copy.aboutCaptionLabel || 'Based in',
    principles,
    experienceEyebrow: sections[1]!.eyebrow,
    experienceTitle: sections[1]!.title,
    experienceDescription: sections[1]!.description,
    publicationsEyebrow: sections[2]!.eyebrow,
    publicationsTitle: sections[2]!.title,
    publicationsDescription: sections[2]!.description,
    publicationsActionLabel: sections[2]!.actionLabel || 'View all publications',
    capabilitiesEyebrow: sections[3]!.eyebrow,
    capabilitiesTitle: sections[3]!.title,
    capabilitiesDescription: sections[3]!.description,
    educationEyebrow: sections[4]!.eyebrow,
    educationTitle: sections[4]!.title,
    educationDescription: sections[4]!.description,
    learningEyebrow: sections[5]!.eyebrow,
    learningTitle: sections[5]!.title,
    learningDescription: sections[5]!.description,
    workEyebrow: sections[6]!.eyebrow,
    workTitle: sections[6]!.title,
    workDescription: sections[6]!.description,
    contactEyebrow: sections[7]!.eyebrow,
    contactTitle: sections[7]!.title,
    contactDescription: sections[7]!.description,
    contactPanelTitle: copy.contactPanelTitle || 'Get in touch',
    contactPrivacyCopy: copy.contactPrivacyCopy || 'Messages are used only to respond to your request.'
  }

  const publications = (v1.publications ?? []).map((item, index) => {
    const authors = (item.authors ?? []).map(authorFromLegacy)
    const slug = (item as { slug?: string }).slug || item.id || `publication-${index + 1}`
    return {
      ...item,
      slug,
      type: publicationTypeFromLegacy(String(item.type ?? 'OTHER')),
      status: 'PUBLISHED' as const,
      authors,
      scholarUrl: item.scholarUrl || '',
      coverImageId: item.mediaAssetId ?? null,
      coverImage: item.media,
      topics: item.topics ?? [],
      enabled: item.enabled ?? true
    }
  })

  const experiences = (v1.experiences ?? []).map((item) => ({
    ...item,
    current: item.current ?? !item.endDate,
    enabled: item.enabled ?? true
  }))

  return publishedPortfolioSnapshotSchema.parse({
    schemaVersion: 2,
    settings: v1.settings,
    copy: flatCopy,
    hero,
    sections,
    principles,
    profile: v1.profile,
    experiences,
    education: (v1.education ?? []).map((item) => ({ ...item, enabled: item.enabled ?? true })),
    publications,
    capabilities: (v1.capabilities ?? []).map((item) => ({ ...item, enabled: item.enabled ?? true })),
    learning: [],
    workStories: []
  })
}
