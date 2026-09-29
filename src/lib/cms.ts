import { cacheTag } from 'next/cache'
import { cache } from 'react'
import {
  MediaKind,
  MediaSource,
  Prisma,
  PublicationStatus,
  PublicationType,
  SiteSection,
  SocialPlatform
} from '@/generated/prisma/client'
import { capabilityGroups } from '@/data/capabilities'
import {
  defaultAboutPrinciples,
  defaultContentCopy,
  defaultHeroCopy,
  defaultLearning,
  defaultSectionCopy,
  defaultSiteSettings,
  defaultWorkStories
} from '@/data/cms-defaults'
import { education } from '@/data/education'
import { experiences } from '@/data/experience'
import { profile } from '@/data/profile'
import { publications } from '@/data/publications'
import { isDatabaseConfigured, prisma } from '@/lib/prisma'
import {
  publicationTypeSchema,
  publishedPortfolioSnapshotSchema,
  upgradeSnapshot,
  type PublishedPortfolioSnapshot
} from '@/schemas/portfolio-content'

type DbClient = Prisma.TransactionClient | typeof prisma

const localMedia = [
  {
    id: 'local-hero',
    source: MediaSource.LOCAL,
    kind: MediaKind.IMAGE,
    secureUrl: '/riad-01.jpg',
    width: 472,
    height: 472,
    originalFilename: 'riad-01.jpg',
    altText: 'Formal portrait of Md. Jahid Alam Riad'
  },
  {
    id: 'local-about',
    source: MediaSource.LOCAL,
    kind: MediaKind.IMAGE,
    secureUrl: '/riad-02.jpg',
    width: 824,
    height: 1035,
    originalFilename: 'riad-02.jpg',
    altText: 'Md. Jahid Alam Riad at an applied AI conference in Washington, DC'
  },
  {
    id: 'local-personal',
    source: MediaSource.LOCAL,
    kind: MediaKind.IMAGE,
    secureUrl: '/riad-03.jpg',
    width: 959,
    height: 959,
    originalFilename: 'riad-03.jpg',
    altText: 'Md. Jahid Alam Riad outdoors on a snowy Washington street'
  },
  {
    id: 'local-logo',
    source: MediaSource.LOCAL,
    kind: MediaKind.IMAGE,
    secureUrl: '/logo-flat.png',
    width: 836,
    height: 298,
    originalFilename: 'logo-flat.png',
    altText: 'Jahid Riad logo'
  }
]

const mediaReference = (asset: {
  id: string
  secureUrl: string
  kind: MediaKind | string
  width: number | null
  height: number | null
  altText: string | null
  originalFilename: string | null
}) => ({
  id: asset.id,
  url: asset.secureUrl,
  kind: asset.kind === 'PDF' || asset.kind === MediaKind.PDF ? ('PDF' as const) : ('IMAGE' as const),
  width: asset.width,
  height: asset.height,
  altText: asset.altText,
  originalFilename: asset.originalFilename
})

const fallbackMedia = Object.fromEntries(
  localMedia.map((asset) => [
    asset.id,
    mediaReference({
      ...asset,
      width: asset.width,
      height: asset.height,
      altText: asset.altText,
      originalFilename: asset.originalFilename
    })
  ])
)

const publicationTypeFromLabel = (type: string) => {
  const lower = type.toLowerCase()
  if (lower.includes('journal')) return 'JOURNAL_ARTICLE' as const
  if (lower.includes('workshop')) return 'WORKSHOP_PAPER' as const
  if (lower.includes('chapter') || lower.includes('book')) return 'BOOK_CHAPTER' as const
  if (lower.includes('preprint')) return 'PREPRINT' as const
  if (lower.includes('thesis')) return 'THESIS' as const
  if (lower.includes('conference') || lower.includes('ieee')) return 'CONFERENCE_PAPER' as const
  return 'OTHER' as const
}

const toSocialPlatform = (kind: string): SocialPlatform => {
  const upper = kind.toUpperCase() as SocialPlatform
  if (Object.values(SocialPlatform).includes(upper)) return upper
  return SocialPlatform.WEBSITE
}

const fromSocialPlatform = (kind: SocialPlatform | string) =>
  String(kind).toLowerCase() as 'linkedin' | 'scholar' | 'github' | 'orcid' | 'researchgate' | 'x' | 'email' | 'website'

export const fallbackPublishedSnapshot: PublishedPortfolioSnapshot = publishedPortfolioSnapshotSchema.parse({
  schemaVersion: 2,
  settings: {
    ...defaultSiteSettings,
    heroImage: fallbackMedia['local-about'],
    aboutImage: fallbackMedia['local-personal'],
    logoImage: fallbackMedia['local-logo']
  },
  copy: defaultContentCopy,
  hero: defaultHeroCopy,
  sections: defaultSectionCopy,
  principles: defaultAboutPrinciples.map((item, index) => ({ ...item, id: `principle-${index + 1}` })),
  profile: {
    ...profile,
    socialLinks: profile.socialLinks.map((link, index) => ({ ...link, id: `social-${index + 1}`, enabled: true }))
  },
  experiences: experiences.map((item) => ({
    ...item,
    current: item.current ?? !item.endDate,
    enabled: true
  })),
  education: education.map((item) => ({ ...item, enabled: true })),
  publications: publications.map((item) => ({
    ...item,
    slug: item.id,
    type: publicationTypeFromLabel(item.type),
    status: 'PUBLISHED' as const,
    authors: (item.authors ?? []).map((author) => {
      const name = typeof author === 'string' ? author : author.name
      return { name, isSelf: /jahid|riad/i.test(name) }
    }),
    scholarUrl: item.scholarUrl || '',
    enabled: true
  })),
  capabilities: capabilityGroups.map((item) => ({ ...item, enabled: true })),
  learning: defaultLearning.map((item, index) => ({ ...item, id: `learning-${index + 1}`, enabled: true })),
  workStories: defaultWorkStories.map((item, index) => ({ ...item, id: `work-${index + 1}`, enabled: true }))
})

const dateValue = (value: Date) => value.toISOString().slice(0, 10)

const monthYear = (value: Date) =>
  new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(value)

const experiencePeriod = (startDate: Date, endDate: Date | null) =>
  `${monthYear(startDate)} – ${endDate ? monthYear(endDate) : 'Present'}`

const sectionMap = (
  sections: Array<{
    section: SiteSection
    eyebrow: string
    title: string
    description: string
    actionLabel: string | null
  }>
) => Object.fromEntries(sections.map((section) => [section.section, section]))

const buildFlatCopy = (
  hero: {
    heading: string
    accent: string
    introduction: string
    primaryLabel: string
    primaryHref: string
    secondaryLabel: string
    secondaryHref: string
    focusLabel: string
  },
  sections: Array<{
    section: SiteSection
    eyebrow: string
    title: string
    description: string
    actionLabel: string | null
  }>,
  principles: Array<{ id: string; title: string; text: string; enabled: boolean }>,
  aboutExtras: {
    aboutBody: string
    aboutImageAlt: string
    aboutCaptionLabel: string
    contactPanelTitle: string
    contactPrivacyCopy: string
  }
) => {
  const bySection = sectionMap(sections)
  const about = bySection[SiteSection.ABOUT] ?? bySection.ABOUT
  const experience = bySection[SiteSection.EXPERIENCE] ?? bySection.EXPERIENCE
  const publicationsSection = bySection[SiteSection.PUBLICATIONS] ?? bySection.PUBLICATIONS
  const capabilities = bySection[SiteSection.CAPABILITIES] ?? bySection.CAPABILITIES
  const educationSection = bySection[SiteSection.EDUCATION] ?? bySection.EDUCATION
  const learning = bySection[SiteSection.LEARNING] ?? bySection.LEARNING
  const work = bySection[SiteSection.WORK] ?? bySection.WORK
  const contact = bySection[SiteSection.CONTACT] ?? bySection.CONTACT

  return {
    heroHeading: hero.heading,
    heroAccent: hero.accent,
    heroIntroduction: hero.introduction,
    heroPrimaryLabel: hero.primaryLabel,
    heroPrimaryHref: hero.primaryHref,
    heroSecondaryLabel: hero.secondaryLabel,
    heroSecondaryHref: hero.secondaryHref,
    heroFocusLabel: hero.focusLabel,
    aboutEyebrow: about?.eyebrow ?? 'Profile',
    aboutTitle: about?.title ?? 'About',
    aboutBody: aboutExtras.aboutBody,
    aboutImageAlt: aboutExtras.aboutImageAlt,
    aboutCaptionLabel: aboutExtras.aboutCaptionLabel,
    principles,
    experienceEyebrow: experience?.eyebrow ?? 'Experience',
    experienceTitle: experience?.title ?? 'Experience',
    experienceDescription: experience?.description ?? '',
    publicationsEyebrow: publicationsSection?.eyebrow ?? 'Research',
    publicationsTitle: publicationsSection?.title ?? 'Publications',
    publicationsDescription: publicationsSection?.description ?? '',
    publicationsActionLabel: publicationsSection?.actionLabel || 'View all publications',
    capabilitiesEyebrow: capabilities?.eyebrow ?? 'Capabilities',
    capabilitiesTitle: capabilities?.title ?? 'Capabilities',
    capabilitiesDescription: capabilities?.description ?? '',
    educationEyebrow: educationSection?.eyebrow ?? 'Education',
    educationTitle: educationSection?.title ?? 'Education',
    educationDescription: educationSection?.description ?? '',
    learningEyebrow: learning?.eyebrow ?? 'Learning',
    learningTitle: learning?.title ?? 'Professional learning',
    learningDescription: learning?.description ?? '',
    workEyebrow: work?.eyebrow ?? 'Selected work',
    workTitle: work?.title ?? 'Selected work',
    workDescription: work?.description ?? '',
    contactEyebrow: contact?.eyebrow ?? 'Contact',
    contactTitle: contact?.title ?? 'Contact',
    contactDescription: contact?.description ?? '',
    contactPanelTitle: aboutExtras.contactPanelTitle,
    contactPrivacyCopy: aboutExtras.contactPrivacyCopy
  }
}

export const readDraftSnapshot = async (db: DbClient = prisma): Promise<PublishedPortfolioSnapshot> => {
  const [
    settings,
    profileDraft,
    hero,
    sections,
    principles,
    socialLinks,
    experienceDrafts,
    educationDrafts,
    publicationDrafts,
    groups,
    learningDrafts,
    workStories,
    assets
  ] = await Promise.all([
    db.siteSettings.findUnique({
      where: { id: 'primary' },
      include: {
        heroImage: true,
        aboutImage: true,
        logoImage: true,
        openGraphImage: true,
        cvAsset: true
      }
    }),
    db.profileDraft.findUnique({ where: { id: 'primary' } }),
    db.heroCopyDraft.findUnique({ where: { id: 'primary' } }),
    db.sectionCopyDraft.findMany(),
    db.aboutPrincipleDraft.findMany({ orderBy: { sortOrder: 'asc' } }),
    db.socialLinkDraft.findMany({ orderBy: { sortOrder: 'asc' } }),
    db.experienceDraft.findMany({
      include: { highlights: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' }
    }),
    db.educationDraft.findMany({ orderBy: { sortOrder: 'asc' } }),
    db.publicationDraft.findMany({
      include: {
        authors: { orderBy: { sortOrder: 'asc' } },
        topics: { include: { topic: true }, orderBy: { sortOrder: 'asc' } },
        coverImage: true,
        pdfAsset: true
      },
      orderBy: { sortOrder: 'asc' }
    }),
    db.capabilityGroupDraft.findMany({
      include: { items: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' }
    }),
    db.learningDraft.findMany({ orderBy: { sortOrder: 'asc' } }),
    db.workStoryDraft.findMany({ orderBy: { sortOrder: 'asc' } }),
    db.mediaAsset.findMany({ where: { archivedAt: null } })
  ])

  if (!settings || !profileDraft || !hero) throw new Error('CMS draft has not been initialized.')

  const aboutSection = sections.find((section) => section.section === SiteSection.ABOUT)
  const principleRows = principles.map((item) => ({
    id: item.id,
    title: item.title,
    text: item.text,
    enabled: item.enabled
  }))

  const copy = buildFlatCopy(hero, sections, principleRows, {
    aboutBody: aboutSection?.description ?? defaultContentCopy.aboutBody,
    aboutImageAlt: profileDraft.aboutImageAlt || settings.aboutImage?.altText || defaultContentCopy.aboutImageAlt,
    aboutCaptionLabel: profileDraft.aboutCaptionLabel || defaultContentCopy.aboutCaptionLabel,
    contactPanelTitle: profileDraft.contactPanelTitle || defaultContentCopy.contactPanelTitle,
    contactPrivacyCopy: profileDraft.contactPrivacyCopy || defaultContentCopy.contactPrivacyCopy
  })

  void assets

  return publishedPortfolioSnapshotSchema.parse({
    schemaVersion: 2,
    settings: {
      ...settings,
      heroImage: settings.heroImage ? mediaReference(settings.heroImage) : undefined,
      aboutImage: settings.aboutImage ? mediaReference(settings.aboutImage) : undefined,
      logoImage: settings.logoImage ? mediaReference(settings.logoImage) : undefined,
      openGraphImage: settings.openGraphImage ? mediaReference(settings.openGraphImage) : undefined,
      cvAsset: settings.cvAsset ? mediaReference(settings.cvAsset) : undefined
    },
    copy,
    hero: {
      heading: hero.heading,
      accent: hero.accent,
      introduction: hero.introduction,
      primaryLabel: hero.primaryLabel,
      primaryHref: hero.primaryHref,
      secondaryLabel: hero.secondaryLabel,
      secondaryHref: hero.secondaryHref,
      focusLabel: hero.focusLabel
    },
    sections: sections.map((section) => ({
      section: section.section,
      eyebrow: section.eyebrow,
      title: section.title,
      description: section.description,
      actionLabel: section.actionLabel ?? ''
    })),
    principles: principleRows,
    profile: {
      ...profileDraft,
      socialLinks: socialLinks.map((link) => ({
        ...link,
        kind: fromSocialPlatform(link.kind)
      }))
    },
    experiences: experienceDrafts.map((item) => ({
      ...item,
      organizationUrl: item.organizationUrl ?? '',
      startDate: dateValue(item.startDate),
      endDate: item.endDate ? dateValue(item.endDate) : undefined,
      current: !item.endDate,
      period: experiencePeriod(item.startDate, item.endDate),
      highlights: item.highlights.map((highlight) => highlight.text),
      updatedAt: item.updatedAt.toISOString()
    })),
    education: educationDrafts.map((item) => ({
      ...item,
      detail: item.detail ?? '',
      updatedAt: item.updatedAt.toISOString()
    })),
    publications: publicationDrafts.map((item) => ({
      ...item,
      venue: item.venue ?? '',
      pages: item.pages ?? '',
      doi: item.doi ?? '',
      paperUrl: item.paperUrl ?? '',
      scholarUrl: item.scholarUrl ?? '',
      abstract: item.abstract ?? '',
      bibtex: item.bibtex ?? '',
      coverImageId: item.coverImageId,
      pdfAssetId: item.pdfAssetId,
      coverImage: item.coverImage ? mediaReference(item.coverImage) : undefined,
      pdfAsset: item.pdfAsset ? mediaReference(item.pdfAsset) : undefined,
      authors: item.authors.map((author) => ({ name: author.name, isSelf: author.isSelf })),
      topics: item.topics.map((row) => row.topic.name),
      updatedAt: item.updatedAt.toISOString()
    })),
    capabilities: groups.map((group) => ({
      ...group,
      items: group.items.map((item) => item.label),
      updatedAt: group.updatedAt.toISOString()
    })),
    learning: learningDrafts.map((item) => ({
      ...item,
      credentialUrl: item.credentialUrl ?? '',
      updatedAt: item.updatedAt.toISOString()
    })),
    workStories: workStories.map((item) => ({
      ...item,
      updatedAt: item.updatedAt.toISOString()
    }))
  })
}

const settingsData = (snapshot: PublishedPortfolioSnapshot, email: string) => {
  const { heroImage, aboutImage, logoImage, openGraphImage, cvAsset, ...settings } = snapshot.settings
  void heroImage
  void aboutImage
  void logoImage
  void openGraphImage
  void cvAsset
  return { ...settings, updatedBy: email }
}

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)

export const replaceDraftFromSnapshot = async (
  db: Prisma.TransactionClient,
  snapshot: PublishedPortfolioSnapshot,
  email: string
) => {
  await db.experienceDraft.deleteMany()
  await db.educationDraft.deleteMany()
  await db.publicationTopicDraft.deleteMany()
  await db.publicationDraft.deleteMany()
  await db.capabilityGroupDraft.deleteMany()
  await db.socialLinkDraft.deleteMany()
  await db.aboutPrincipleDraft.deleteMany()
  await db.learningDraft.deleteMany()
  await db.workStoryDraft.deleteMany()
  await db.sectionCopyDraft.deleteMany()

  await db.siteSettings.upsert({
    where: { id: 'primary' },
    create: { id: 'primary', ...settingsData(snapshot, email) },
    update: settingsData(snapshot, email)
  })
  await db.profileDraft.upsert({
    where: { id: 'primary' },
    create: {
      id: 'primary',
      name: snapshot.profile.name,
      shortName: snapshot.profile.shortName,
      role: snapshot.profile.role,
      positioning: snapshot.profile.positioning,
      summary: snapshot.profile.summary,
      location: snapshot.profile.location,
      aboutImageAlt: snapshot.copy.aboutImageAlt,
      aboutCaptionLabel: snapshot.copy.aboutCaptionLabel,
      contactPanelTitle: snapshot.copy.contactPanelTitle,
      contactPrivacyCopy: snapshot.copy.contactPrivacyCopy,
      updatedBy: email
    },
    update: {
      name: snapshot.profile.name,
      shortName: snapshot.profile.shortName,
      role: snapshot.profile.role,
      positioning: snapshot.profile.positioning,
      summary: snapshot.profile.summary,
      location: snapshot.profile.location,
      aboutImageAlt: snapshot.copy.aboutImageAlt,
      aboutCaptionLabel: snapshot.copy.aboutCaptionLabel,
      contactPanelTitle: snapshot.copy.contactPanelTitle,
      contactPrivacyCopy: snapshot.copy.contactPrivacyCopy,
      updatedBy: email
    }
  })
  await db.heroCopyDraft.upsert({
    where: { id: 'primary' },
    create: { id: 'primary', ...snapshot.hero, updatedBy: email },
    update: { ...snapshot.hero, updatedBy: email }
  })

  for (const section of snapshot.sections) {
    await db.sectionCopyDraft.create({
      data: {
        section: section.section as SiteSection,
        eyebrow: section.eyebrow,
        title: section.title,
        description: section.description,
        actionLabel: section.actionLabel || null,
        updatedBy: email
      }
    })
  }

  await db.sectionCopyDraft.update({
    where: { section: SiteSection.ABOUT },
    data: { description: snapshot.copy.aboutBody, updatedBy: email }
  })

  if (snapshot.principles.length) {
    await db.aboutPrincipleDraft.createMany({
      data: snapshot.principles.map((item, sortOrder) => ({
        id: item.id ?? crypto.randomUUID(),
        title: item.title,
        text: item.text,
        enabled: item.enabled,
        sortOrder,
        updatedBy: email
      }))
    })
  }

  if (snapshot.profile.socialLinks.length) {
    await db.socialLinkDraft.createMany({
      data: snapshot.profile.socialLinks.map((link, index) => ({
        id: link.id ?? crypto.randomUUID(),
        label: link.label,
        href: link.href,
        kind: toSocialPlatform(link.kind),
        enabled: link.enabled,
        sortOrder: index,
        updatedBy: email
      }))
    })
  }

  for (const [index, item] of snapshot.experiences.entries()) {
    await db.experienceDraft.create({
      data: {
        id: item.id ?? crypto.randomUUID(),
        organization: item.organization,
        organizationUrl: item.organizationUrl || null,
        role: item.role,
        location: item.location,
        startDate: new Date(`${item.startDate}T00:00:00.000Z`),
        endDate: item.endDate ? new Date(`${item.endDate}T00:00:00.000Z`) : null,
        summary: item.summary,
        enabled: item.enabled,
        sortOrder: index,
        updatedBy: email,
        highlights: { create: item.highlights.map((text, sortOrder) => ({ text, sortOrder })) }
      }
    })
  }

  if (snapshot.education.length) {
    await db.educationDraft.createMany({
      data: snapshot.education.map((item, sortOrder) => ({
        id: item.id ?? crypto.randomUUID(),
        institution: item.institution,
        degree: item.degree,
        location: item.location,
        startYear: item.startYear,
        endYear: item.endYear ?? null,
        detail: item.detail || null,
        enabled: item.enabled,
        sortOrder,
        updatedBy: email
      }))
    })
  }

  for (const [index, item] of snapshot.publications.entries()) {
    const topicIds: string[] = []
    for (const [topicIndex, topicName] of item.topics.entries()) {
      const slug = slugify(topicName) || `topic-${topicIndex + 1}`
      const topic = await db.topic.upsert({
        where: { slug },
        create: { name: topicName, slug },
        update: { name: topicName }
      })
      topicIds.push(topic.id)
    }

    const type = publicationTypeSchema.parse(item.type) as PublicationType
    await db.publicationDraft.create({
      data: {
        id: item.id ?? crypto.randomUUID(),
        slug: item.slug,
        title: item.title,
        year: item.year,
        month: item.month ?? null,
        type,
        status: (item.status as PublicationStatus) ?? PublicationStatus.PUBLISHED,
        venue: item.venue || null,
        pages: item.pages || null,
        doi: item.doi || null,
        paperUrl: item.paperUrl || null,
        scholarUrl: item.scholarUrl || null,
        abstract: item.abstract || null,
        bibtex: item.bibtex || null,
        coverImageId: item.coverImageId || null,
        pdfAssetId: item.pdfAssetId || null,
        featured: item.featured,
        enabled: item.enabled,
        sortOrder: index,
        updatedBy: email,
        authors: {
          create: item.authors.map((author, sortOrder) => ({
            name: author.name,
            isSelf: author.isSelf,
            sortOrder
          }))
        },
        topics: {
          create: topicIds.map((topicId, sortOrder) => ({ topicId, sortOrder }))
        }
      }
    })
  }

  for (const [index, group] of snapshot.capabilities.entries()) {
    await db.capabilityGroupDraft.create({
      data: {
        id: group.id ?? crypto.randomUUID(),
        title: group.title,
        description: group.description,
        enabled: group.enabled,
        sortOrder: index,
        updatedBy: email,
        items: { create: group.items.map((label, sortOrder) => ({ label, sortOrder })) }
      }
    })
  }

  if (snapshot.learning.length) {
    await db.learningDraft.createMany({
      data: snapshot.learning.map((item, sortOrder) => ({
        id: item.id ?? crypto.randomUUID(),
        title: item.title,
        issuer: item.issuer,
        year: item.year ?? null,
        credentialUrl: item.credentialUrl || null,
        enabled: item.enabled,
        sortOrder,
        updatedBy: email
      }))
    })
  }

  if (snapshot.workStories.length) {
    await db.workStoryDraft.createMany({
      data: snapshot.workStories.map((item, sortOrder) => ({
        id: item.id ?? crypto.randomUUID(),
        title: item.title,
        body: item.body,
        evidence: item.evidence,
        href: item.href,
        linkLabel: item.linkLabel,
        visualLabel: item.visualLabel,
        enabled: item.enabled,
        sortOrder,
        updatedBy: email
      }))
    })
  }
}

export const ensureCmsInitialized = async (email: string) => {
  if (!isDatabaseConfigured()) return
  const existing = await prisma.siteSettings.findUnique({ where: { id: 'primary' }, select: { id: true } })
  if (existing) return

  const snapshot = fallbackPublishedSnapshot

  await prisma.$transaction(async (tx) => {
    for (const asset of localMedia) {
      await tx.mediaAsset.upsert({ where: { id: asset.id }, create: { ...asset, createdBy: email }, update: {} })
    }
    await replaceDraftFromSnapshot(tx, snapshot, email)
    const revision = await tx.contentRevision.create({
      data: {
        schemaVersion: 2,
        snapshot: snapshot as Prisma.InputJsonValue,
        note: 'Initial CMS seed',
        publishedBy: email
      }
    })
    await tx.publishState.upsert({
      where: { id: 'primary' },
      create: {
        id: 'primary',
        activeRevisionId: revision.id,
        hasUnpublishedChanges: false,
        draftUpdatedBy: email,
        publishedAt: revision.publishedAt
      },
      update: {}
    })
  })
}

async function loadPublishedSnapshot(): Promise<PublishedPortfolioSnapshot> {
  'use cache'
  cacheTag('portfolio')

  if (!isDatabaseConfigured()) return fallbackPublishedSnapshot
  try {
    const state = await prisma.publishState.findUnique({
      where: { id: 'primary' },
      include: { activeRevision: true }
    })
    if (state?.activeRevision) {
      return upgradeSnapshot(state.activeRevision.snapshot)
    }
    return fallbackPublishedSnapshot
  } catch {
    return fallbackPublishedSnapshot
  }
}

export const getPublishedSnapshot = cache(loadPublishedSnapshot)

export const getPublishedMeta = cache(async () => {
  'use cache'
  cacheTag('portfolio')
  const snapshot = await loadPublishedSnapshot()
  if (!isDatabaseConfigured()) {
    return { publishedAt: null as string | null, siteUrl: snapshot.settings.siteUrl }
  }
  try {
    const state = await prisma.publishState.findUnique({
      where: { id: 'primary' },
      include: { activeRevision: { select: { publishedAt: true } } }
    })
    return {
      publishedAt: state?.activeRevision?.publishedAt?.toISOString() ?? state?.publishedAt?.toISOString() ?? null,
      siteUrl: snapshot.settings.siteUrl
    }
  } catch {
    return { publishedAt: null as string | null, siteUrl: snapshot.settings.siteUrl }
  }
})
