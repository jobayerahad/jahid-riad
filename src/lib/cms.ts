import { cache } from 'react'
import { Prisma } from '@/generated/prisma/client'
import { capabilityGroups } from '@/data/capabilities'
import { defaultContentCopy, defaultSiteSettings } from '@/data/cms-defaults'
import { education } from '@/data/education'
import { experiences } from '@/data/experience'
import { profile } from '@/data/profile'
import { publications } from '@/data/publications'
import { isDatabaseConfigured, prisma } from '@/lib/prisma'
import {
  legacyPortfolioContentSchema,
  publishedPortfolioSnapshotSchema,
  type PublishedPortfolioSnapshot
} from '@/schemas/portfolio-content'

type DbClient = Prisma.TransactionClient | typeof prisma

const localMedia = [
  {
    id: 'local-hero',
    source: 'LOCAL',
    kind: 'IMAGE',
    secureUrl: '/riad-01.jpg',
    resourceType: 'image',
    width: 959,
    height: 959,
    originalFilename: 'riad-01.jpg',
    altText: 'Professional portrait'
  },
  {
    id: 'local-about',
    source: 'LOCAL',
    kind: 'IMAGE',
    secureUrl: '/riad-02.jpg',
    resourceType: 'image',
    width: 824,
    height: 1035,
    originalFilename: 'riad-02.jpg',
    altText: 'Professional conference photograph'
  },
  {
    id: 'local-logo',
    source: 'LOCAL',
    kind: 'IMAGE',
    secureUrl: '/logo-flat.png',
    resourceType: 'image',
    width: 836,
    height: 298,
    originalFilename: 'logo-flat.png',
    altText: 'Jahid Riad logo'
  }
]

const mediaReference = (asset: {
  id: string
  secureUrl: string
  kind: string
  width: number | null
  height: number | null
  altText: string | null
  originalFilename: string | null
}) => ({
  id: asset.id,
  url: asset.secureUrl,
  kind: asset.kind === 'PDF' ? ('PDF' as const) : ('IMAGE' as const),
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

export const fallbackPublishedSnapshot: PublishedPortfolioSnapshot = publishedPortfolioSnapshotSchema.parse({
  schemaVersion: 1,
  settings: {
    ...defaultSiteSettings,
    heroImage: fallbackMedia['local-hero'],
    aboutImage: fallbackMedia['local-about'],
    logoImage: fallbackMedia['local-logo']
  },
  copy: defaultContentCopy,
  profile: {
    ...profile,
    socialLinks: profile.socialLinks.map((link, index) => ({ ...link, id: `social-${index + 1}`, enabled: true }))
  },
  experiences: experiences.map((item) => ({ ...item, enabled: true })),
  education: education.map((item) => ({ ...item, enabled: true })),
  publications: publications.map((item) => ({ ...item, authors: item.authors ?? [], enabled: true })),
  capabilities: capabilityGroups.map((item) => ({ ...item, enabled: true }))
})

const dateValue = (value: Date) => value.toISOString().slice(0, 10)

const monthYear = (value: Date) =>
  new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(value)

const experiencePeriod = (startDate: Date, endDate: Date | null, current: boolean) =>
  `${monthYear(startDate)} – ${current ? 'Present' : endDate ? monthYear(endDate) : 'Present'}`

const enrichLegacy = (data: unknown): PublishedPortfolioSnapshot => {
  const parsed = legacyPortfolioContentSchema.safeParse(data)
  if (!parsed.success) return fallbackPublishedSnapshot

  return publishedPortfolioSnapshotSchema.parse({
    ...fallbackPublishedSnapshot,
    profile: {
      ...parsed.data.profile,
      socialLinks: parsed.data.profile.socialLinks.map((link, index) => ({
        ...link,
        id: `social-${index + 1}`,
        enabled: true
      }))
    },
    experiences: parsed.data.experiences.map((item) => ({ ...item, enabled: true })),
    education: parsed.data.education.map((item) => ({ ...item, enabled: true })),
    publications: parsed.data.publications.map((item) => ({ ...item, authors: item.authors ?? [], enabled: true })),
    capabilities: parsed.data.capabilities.map((item) => ({ ...item, enabled: true }))
  })
}

export const readDraftSnapshot = async (db: DbClient = prisma): Promise<PublishedPortfolioSnapshot> => {
  const [
    settings,
    profileDraft,
    copy,
    socialLinks,
    experienceDrafts,
    educationDrafts,
    publicationDrafts,
    groups,
    assets
  ] = await Promise.all([
    db.siteSettings.findUnique({ where: { id: 'primary' } }),
    db.profileDraft.findUnique({ where: { id: 'primary' } }),
    db.contentCopyDraft.findUnique({ where: { id: 'primary' } }),
    db.socialLinkDraft.findMany({ orderBy: { sortOrder: 'asc' } }),
    db.experienceDraft.findMany({
      include: { highlights: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' }
    }),
    db.educationDraft.findMany({ orderBy: { sortOrder: 'asc' } }),
    db.publicationDraft.findMany({
      include: { authors: { orderBy: { sortOrder: 'asc' } }, topics: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' }
    }),
    db.capabilityGroupDraft.findMany({
      include: { items: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' }
    }),
    db.mediaAsset.findMany({ where: { archivedAt: null } })
  ])

  if (!settings || !profileDraft || !copy) throw new Error('CMS draft has not been initialized.')
  const assetMap = new Map(assets.map((asset) => [asset.id, mediaReference(asset)]))
  const resolvedSettings = {
    ...settings,
    heroImage: settings.heroImageId ? assetMap.get(settings.heroImageId) : undefined,
    aboutImage: settings.aboutImageId ? assetMap.get(settings.aboutImageId) : undefined,
    logoImage: settings.logoImageId ? assetMap.get(settings.logoImageId) : undefined,
    openGraphImage: settings.openGraphImageId ? assetMap.get(settings.openGraphImageId) : undefined,
    cvAsset: settings.cvAssetId ? assetMap.get(settings.cvAssetId) : undefined
  }

  return publishedPortfolioSnapshotSchema.parse({
    schemaVersion: 1,
    settings: resolvedSettings,
    copy,
    profile: {
      ...profileDraft,
      socialLinks: socialLinks.map((link) => ({ ...link, kind: link.kind.toLowerCase() }))
    },
    experiences: experienceDrafts.map((item) => ({
      ...item,
      startDate: dateValue(item.startDate),
      endDate: item.endDate ? dateValue(item.endDate) : undefined,
      period: experiencePeriod(item.startDate, item.endDate, item.current),
      highlights: item.highlights.map((highlight) => highlight.text),
      updatedAt: item.updatedAt.toISOString()
    })),
    education: educationDrafts.map((item) => ({ ...item, updatedAt: item.updatedAt.toISOString() })),
    publications: publicationDrafts.map((item) => ({
      ...item,
      venue: item.venue ?? undefined,
      pages: item.pages ?? undefined,
      doi: item.doi ?? undefined,
      paperUrl: item.paperUrl ?? undefined,
      abstract: item.abstract ?? undefined,
      mediaAssetId: item.mediaAssetId,
      media: item.mediaAssetId ? assetMap.get(item.mediaAssetId) : undefined,
      authors: item.authors.map((author) => author.name),
      topics: item.topics.map((topic) => topic.name),
      updatedAt: item.updatedAt.toISOString()
    })),
    capabilities: groups.map((group) => ({
      ...group,
      items: group.items.map((item) => item.label),
      updatedAt: group.updatedAt.toISOString()
    }))
  })
}

const settingsData = (snapshot: PublishedPortfolioSnapshot, email: string) => {
  const { heroImage, aboutImage, logoImage, openGraphImage, cvAsset, ...settings } = snapshot.settings
  return { ...settings, updatedBy: email }
}

export const replaceDraftFromSnapshot = async (
  db: Prisma.TransactionClient,
  snapshot: PublishedPortfolioSnapshot,
  email: string
) => {
  await db.experienceDraft.deleteMany()
  await db.educationDraft.deleteMany()
  await db.publicationDraft.deleteMany()
  await db.capabilityGroupDraft.deleteMany()
  await db.socialLinkDraft.deleteMany()

  await db.siteSettings.upsert({
    where: { id: 'primary' },
    create: { id: 'primary', ...settingsData(snapshot, email) },
    update: settingsData(snapshot, email)
  })
  await db.profileDraft.upsert({
    where: { id: 'primary' },
    create: { id: 'primary', ...snapshot.profile, socialLinks: undefined, updatedBy: email },
    update: { ...snapshot.profile, socialLinks: undefined, updatedBy: email }
  })
  await db.contentCopyDraft.upsert({
    where: { id: 'primary' },
    create: { id: 'primary', ...snapshot.copy, updatedBy: email },
    update: { ...snapshot.copy, updatedBy: email }
  })

  if (snapshot.profile.socialLinks.length) {
    await db.socialLinkDraft.createMany({
      data: snapshot.profile.socialLinks.map((link, index) => ({
        id: link.id ?? crypto.randomUUID(),
        label: link.label,
        href: link.href,
        kind: link.kind.toUpperCase(),
        enabled: link.enabled,
        sortOrder: index
      }))
    })
  }

  for (const [index, item] of snapshot.experiences.entries()) {
    await db.experienceDraft.create({
      data: {
        id: item.id ?? crypto.randomUUID(),
        organization: item.organization,
        role: item.role,
        location: item.location,
        startDate: new Date(`${item.startDate}T00:00:00.000Z`),
        endDate: item.endDate ? new Date(`${item.endDate}T00:00:00.000Z`) : null,
        current: item.current,
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
        endYear: item.endYear,
        detail: item.detail,
        enabled: item.enabled,
        sortOrder,
        updatedBy: email
      }))
    })
  }

  for (const [index, item] of snapshot.publications.entries()) {
    await db.publicationDraft.create({
      data: {
        id: item.id ?? crypto.randomUUID(),
        title: item.title,
        year: item.year,
        type: item.type,
        venue: item.venue || null,
        pages: item.pages || null,
        doi: item.doi || null,
        paperUrl: item.paperUrl || null,
        scholarUrl: item.scholarUrl,
        abstract: item.abstract || null,
        mediaAssetId: item.mediaAssetId || null,
        featured: item.featured,
        enabled: item.enabled,
        sortOrder: index,
        updatedBy: email,
        authors: { create: item.authors.map((name, sortOrder) => ({ name, sortOrder })) },
        topics: { create: item.topics.map((name, sortOrder) => ({ name, sortOrder })) }
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
}

export const ensureCmsInitialized = async (email: string) => {
  if (!isDatabaseConfigured()) return
  const existing = await prisma.siteSettings.findUnique({ where: { id: 'primary' }, select: { id: true } })
  if (existing) return

  const legacy = await prisma.siteContent.findUnique({ where: { id: 'primary' } })
  const snapshot = legacy ? enrichLegacy(legacy.data) : fallbackPublishedSnapshot

  await prisma.$transaction(async (tx) => {
    for (const asset of localMedia) {
      await tx.mediaAsset.upsert({ where: { id: asset.id }, create: { ...asset, createdBy: email }, update: {} })
    }
    await replaceDraftFromSnapshot(tx, snapshot, email)
    const revision = await tx.contentRevision.create({
      data: { version: 1, snapshot: snapshot as Prisma.InputJsonValue, note: 'Initial CMS import', publishedBy: email }
    })
    await tx.publicationState.upsert({
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

export const getPublishedSnapshot = cache(async (): Promise<PublishedPortfolioSnapshot> => {
  if (!isDatabaseConfigured()) return fallbackPublishedSnapshot
  try {
    const state = await prisma.publicationState.findUnique({
      where: { id: 'primary' },
      include: { activeRevision: true }
    })
    if (state?.activeRevision) {
      const parsed = publishedPortfolioSnapshotSchema.safeParse(state.activeRevision.snapshot)
      if (parsed.success) return parsed.data
    }
    const legacy = await prisma.siteContent.findUnique({ where: { id: 'primary' } })
    return legacy ? enrichLegacy(legacy.data) : fallbackPublishedSnapshot
  } catch {
    return fallbackPublishedSnapshot
  }
})
