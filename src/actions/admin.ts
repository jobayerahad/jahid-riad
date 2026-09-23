'use server'

import { revalidatePath, updateTag } from 'next/cache'
import {
  ContactMessageStatus,
  MediaKind,
  Prisma,
  PublicationStatus,
  PublicationType,
  SiteSection,
  SocialPlatform
} from '@/generated/prisma/client'
import { deleteAdminSession, readAdminSession } from '@/lib/admin-auth'
import { isAdminConfigured } from '@/lib/admin-config'
import { getCloudinaryConfig } from '@/lib/cloudinary'
import { readDraftSnapshot, replaceDraftFromSnapshot, slugify } from '@/lib/cms'
import { hashPassword, verifyPasswordSafe } from '@/lib/password'
import { prisma } from '@/lib/prisma'
import {
  aboutFormSchema,
  capabilityFormSchema,
  changePasswordSchema,
  educationFormSchema,
  experienceFormSchema,
  idSchema,
  learningFormSchema,
  mediaRegistrationSchema,
  profileHeroFormSchema,
  publicationFormSchema,
  publishSchema,
  sectionCopyFormSchema,
  settingsFormSchema,
  workStoryFormSchema
} from '@/schemas/admin'
import { publishedPortfolioSnapshotSchema, upgradeSnapshot } from '@/schemas/portfolio-content'
import type { AdminActionResult, CmsItemKind } from '@/types/admin'
import { z } from 'zod'

export type { AdminActionResult } from '@/types/admin'

const cmsItemKindSchema = z.enum(['experience', 'publication', 'capability', 'education', 'learning', 'work'])

const fieldErrors = (error: { issues: { path: PropertyKey[]; message: string }[] }) =>
  Object.fromEntries(error.issues.map((issue) => [issue.path.join('.'), issue.message]))

const validationFailure = (error: { issues: { path: PropertyKey[]; message: string }[] }): AdminActionResult => ({
  ok: false,
  code: 'VALIDATION',
  message: 'Please correct the highlighted fields.',
  fieldErrors: fieldErrors(error)
})

export const getAdminSession = async () => {
  if (!isAdminConfigured()) return null
  const session = await readAdminSession()
  const allowedEmail = process.env.ADMIN_EMAIL?.toLowerCase()
  if (!session || session.admin.email.toLowerCase() !== allowedEmail) return null
  return { user: { email: session.admin.email, id: session.admin.id }, sessionId: session.id }
}

const requireAdmin = async () => {
  const session = await getAdminSession()
  return session?.user ?? null
}

const markDraftChanged = (tx: Prisma.TransactionClient, email: string) =>
  tx.publishState.upsert({
    where: { id: 'primary' },
    create: { id: 'primary', hasUnpublishedChanges: true, draftUpdatedBy: email },
    update: { hasUnpublishedChanges: true, draftUpdatedAt: new Date(), draftUpdatedBy: email }
  })

const stale = (current: Date, expected?: string) =>
  Boolean(expected && current.getTime() !== new Date(expected).getTime())

const saved = (message = 'Draft saved.'): AdminActionResult => ({ ok: true, message })
const unauthorized = (): AdminActionResult => ({
  ok: false,
  code: 'UNAUTHORIZED',
  message: 'Your admin session is not authorized.'
})
const conflict = (): AdminActionResult => ({
  ok: false,
  code: 'CONFLICT',
  message: 'This content changed in another tab. Refresh before saving again.'
})

const validAssetReference = async (
  tx: Prisma.TransactionClient | typeof prisma,
  id: string | null | undefined,
  kind: MediaKind | 'IMAGE' | 'PDF'
) => {
  if (!id) return true
  const mediaKind = String(kind) === 'PDF' ? MediaKind.PDF : MediaKind.IMAGE
  const asset = await tx.mediaAsset.findFirst({
    where: { id, kind: mediaKind, archivedAt: null },
    select: { id: true }
  })
  return Boolean(asset)
}

const invalidAsset = (): AdminActionResult => ({
  ok: false,
  code: 'REFERENCE',
  message: 'The selected media asset is missing, archived, or has the wrong file type.'
})

const missingRecord = (): AdminActionResult => ({
  ok: false,
  code: 'REFERENCE',
  message: 'This draft item no longer exists. Refresh before editing it.'
})

const toSocialPlatform = (kind: string): SocialPlatform => {
  const upper = kind.toUpperCase() as SocialPlatform
  if (Object.values(SocialPlatform).includes(upper)) return upper
  return SocialPlatform.WEBSITE
}

const ensureTopics = async (tx: Prisma.TransactionClient, names: string[]) => {
  const topicIds: string[] = []
  for (const [index, name] of names.entries()) {
    const slug = slugify(name) || `topic-${index + 1}`
    const topic = await tx.topic.upsert({
      where: { slug },
      create: { name, slug },
      update: { name }
    })
    topicIds.push(topic.id)
  }
  return topicIds
}

export const saveProfileHero = async (input: unknown): Promise<AdminActionResult> => {
  const user = await requireAdmin()
  if (!user) return unauthorized()
  const parsed = profileHeroFormSchema.safeParse(input)
  if (!parsed.success) return validationFailure(parsed.error)
  const {
    socialLinks,
    expectedUpdatedAt,
    expectedHeroUpdatedAt,
    expectedSettingsUpdatedAt,
    heroImageId,
    heading,
    accent,
    introduction,
    primaryLabel,
    primaryHref,
    secondaryLabel,
    secondaryHref,
    focusLabel,
    name,
    shortName,
    role,
    positioning,
    summary,
    location
  } = parsed.data
  if (!(await validAssetReference(prisma, heroImageId, MediaKind.IMAGE))) return invalidAsset()

  const [current, currentHero, currentSettings] = await Promise.all([
    prisma.profileDraft.findUnique({ where: { id: 'primary' } }),
    prisma.heroCopyDraft.findUnique({ where: { id: 'primary' } }),
    prisma.siteSettings.findUnique({ where: { id: 'primary' } })
  ])
  if (
    (current && stale(current.updatedAt, expectedUpdatedAt)) ||
    (currentHero && stale(currentHero.updatedAt, expectedHeroUpdatedAt)) ||
    (currentSettings && stale(currentSettings.updatedAt, expectedSettingsUpdatedAt))
  )
    return conflict()

  await prisma.$transaction(async (tx) => {
    await tx.profileDraft.update({
      where: { id: 'primary' },
      data: { name, shortName, role, positioning, summary, location, updatedBy: user.email }
    })
    await tx.heroCopyDraft.update({
      where: { id: 'primary' },
      data: {
        heading,
        accent,
        introduction,
        primaryLabel,
        primaryHref,
        secondaryLabel,
        secondaryHref,
        focusLabel,
        updatedBy: user.email
      }
    })
    await tx.siteSettings.update({
      where: { id: 'primary' },
      data: { heroImageId: heroImageId ?? null, updatedBy: user.email }
    })
    await tx.socialLinkDraft.deleteMany()
    if (socialLinks.length) {
      await tx.socialLinkDraft.createMany({
        data: socialLinks.map((link, sortOrder) => ({
          id: link.id ?? crypto.randomUUID(),
          label: link.label,
          href: link.href,
          kind: toSocialPlatform(link.kind),
          enabled: link.enabled,
          sortOrder,
          updatedBy: user.email
        }))
      })
    }
    await markDraftChanged(tx, user.email)
  })
  return saved('Profile and Hero draft saved.')
}

export const saveAbout = async (input: unknown): Promise<AdminActionResult> => {
  const user = await requireAdmin()
  if (!user) return unauthorized()
  const parsed = aboutFormSchema.safeParse(input)
  if (!parsed.success) return validationFailure(parsed.error)
  const {
    expectedUpdatedAt,
    expectedSettingsUpdatedAt,
    aboutImageId,
    aboutEyebrow,
    aboutTitle,
    aboutBody,
    aboutImageAlt,
    aboutCaptionLabel,
    principles
  } = parsed.data
  if (!(await validAssetReference(prisma, aboutImageId, MediaKind.IMAGE))) return invalidAsset()

  const [aboutSection, currentSettings] = await Promise.all([
    prisma.sectionCopyDraft.findUnique({ where: { section: SiteSection.ABOUT } }),
    prisma.siteSettings.findUnique({ where: { id: 'primary' } })
  ])
  if (
    (aboutSection && stale(aboutSection.updatedAt, expectedUpdatedAt)) ||
    (currentSettings && stale(currentSettings.updatedAt, expectedSettingsUpdatedAt))
  )
    return conflict()

  await prisma.$transaction(async (tx) => {
    await tx.sectionCopyDraft.upsert({
      where: { section: SiteSection.ABOUT },
      create: {
        section: SiteSection.ABOUT,
        eyebrow: aboutEyebrow,
        title: aboutTitle,
        description: aboutBody,
        updatedBy: user.email
      },
      update: {
        eyebrow: aboutEyebrow,
        title: aboutTitle,
        description: aboutBody,
        updatedBy: user.email
      }
    })
    await tx.profileDraft.update({
      where: { id: 'primary' },
      data: { aboutImageAlt, aboutCaptionLabel, updatedBy: user.email }
    })
    await tx.aboutPrincipleDraft.deleteMany()
    if (principles.length) {
      await tx.aboutPrincipleDraft.createMany({
        data: principles.map((item, sortOrder) => ({
          id: item.id ?? crypto.randomUUID(),
          title: item.title,
          text: item.text,
          enabled: item.enabled,
          sortOrder,
          updatedBy: user.email
        }))
      })
    }
    await tx.siteSettings.update({
      where: { id: 'primary' },
      data: { aboutImageId: aboutImageId ?? null, updatedBy: user.email }
    })
    if (aboutImageId) {
      await tx.mediaAsset.update({
        where: { id: aboutImageId },
        data: { altText: aboutImageAlt }
      })
    }
    await markDraftChanged(tx, user.email)
  })
  return saved('About draft saved.')
}

export const saveSectionCopy = async (input: unknown): Promise<AdminActionResult> => {
  const user = await requireAdmin()
  if (!user) return unauthorized()
  const parsed = sectionCopyFormSchema.safeParse(input)
  if (!parsed.success) return validationFailure(parsed.error)
  const { expectedUpdatedAt, sections, contactPanelTitle, contactPrivacyCopy } = parsed.data

  const [profileDraft, existingSections] = await Promise.all([
    prisma.profileDraft.findUnique({ where: { id: 'primary' } }),
    prisma.sectionCopyDraft.findMany({ select: { updatedAt: true } })
  ])
  const latestSection = existingSections.reduce(
    (max, section) => (section.updatedAt > max ? section.updatedAt : max),
    new Date(0)
  )
  const latest = profileDraft && profileDraft.updatedAt > latestSection ? profileDraft.updatedAt : latestSection
  if (stale(latest, expectedUpdatedAt)) return conflict()

  await prisma.$transaction(async (tx) => {
    for (const section of sections) {
      await tx.sectionCopyDraft.upsert({
        where: { section: section.section as SiteSection },
        create: {
          section: section.section as SiteSection,
          eyebrow: section.eyebrow,
          title: section.title,
          description: section.description,
          actionLabel: section.actionLabel || null,
          updatedBy: user.email
        },
        update: {
          eyebrow: section.eyebrow,
          title: section.title,
          description: section.description,
          actionLabel: section.actionLabel || null,
          updatedBy: user.email
        }
      })
    }
    await tx.profileDraft.update({
      where: { id: 'primary' },
      data: { contactPanelTitle, contactPrivacyCopy, updatedBy: user.email }
    })
    await markDraftChanged(tx, user.email)
  })
  return saved('Section copy draft saved.')
}

export const saveSettings = async (input: unknown): Promise<AdminActionResult> => {
  const user = await requireAdmin()
  if (!user) return unauthorized()
  const parsed = settingsFormSchema.safeParse(input)
  if (!parsed.success) return validationFailure(parsed.error)
  const { expectedUpdatedAt, ...data } = parsed.data
  const validReferences = await Promise.all([
    validAssetReference(prisma, data.logoImageId, MediaKind.IMAGE),
    validAssetReference(prisma, data.openGraphImageId, MediaKind.IMAGE),
    validAssetReference(prisma, data.cvAssetId, MediaKind.PDF)
  ])
  if (validReferences.includes(false)) return invalidAsset()
  const current = await prisma.siteSettings.findUnique({ where: { id: 'primary' } })
  if (current && stale(current.updatedAt, expectedUpdatedAt)) return conflict()
  await prisma.$transaction(async (tx) => {
    await tx.siteSettings.update({ where: { id: 'primary' }, data: { ...data, updatedBy: user.email } })
    await markDraftChanged(tx, user.email)
  })
  return saved('SEO and site settings draft saved.')
}

export const saveExperience = async (input: unknown): Promise<AdminActionResult<{ id: string }>> => {
  const user = await requireAdmin()
  if (!user) return unauthorized()
  const parsed = experienceFormSchema.safeParse(input)
  if (!parsed.success) return validationFailure(parsed.error)
  const value = parsed.data
  const id = value.id ?? crypto.randomUUID()
  const current = value.id ? await prisma.experienceDraft.findUnique({ where: { id } }) : null
  if (value.id && !current) return missingRecord()
  if (current && stale(current.updatedAt, value.updatedAt)) return conflict()

  const isCurrent = value.current ?? !value.endDate
  if (!isCurrent && !value.endDate) {
    return {
      ok: false,
      code: 'VALIDATION',
      message: 'End date is required unless this is the current role.',
      fieldErrors: { endDate: 'End date is required' }
    }
  }

  await prisma.$transaction(async (tx) => {
    const data = {
      organization: value.organization,
      organizationUrl: value.organizationUrl || null,
      role: value.role,
      location: value.location,
      startDate: new Date(`${value.startDate}T00:00:00.000Z`),
      endDate: isCurrent || !value.endDate ? null : new Date(`${value.endDate}T00:00:00.000Z`),
      summary: value.summary,
      enabled: value.enabled,
      updatedBy: user.email
    }
    if (current) {
      await tx.experienceHighlightDraft.deleteMany({ where: { experienceId: id } })
      await tx.experienceDraft.update({
        where: { id },
        data: { ...data, highlights: { create: value.highlights.map((text, sortOrder) => ({ text, sortOrder })) } }
      })
    } else {
      const count = await tx.experienceDraft.count()
      await tx.experienceDraft.create({
        data: {
          id,
          ...data,
          sortOrder: count,
          highlights: { create: value.highlights.map((text, sortOrder) => ({ text, sortOrder })) }
        }
      })
    }
    await markDraftChanged(tx, user.email)
  })
  return { ok: true, message: 'Experience draft saved.', data: { id } }
}

export const saveEducation = async (input: unknown): Promise<AdminActionResult<{ id: string }>> => {
  const user = await requireAdmin()
  if (!user) return unauthorized()
  const parsed = educationFormSchema.safeParse(input)
  if (!parsed.success) return validationFailure(parsed.error)
  const value = parsed.data
  const id = value.id ?? crypto.randomUUID()
  const current = value.id ? await prisma.educationDraft.findUnique({ where: { id } }) : null
  if (value.id && !current) return missingRecord()
  if (current && stale(current.updatedAt, value.updatedAt)) return conflict()
  await prisma.$transaction(async (tx) => {
    const data = {
      institution: value.institution,
      degree: value.degree,
      location: value.location,
      startYear: value.startYear,
      endYear: value.endYear ?? null,
      detail: value.detail || null,
      enabled: value.enabled,
      updatedBy: user.email
    }
    if (current) await tx.educationDraft.update({ where: { id }, data })
    else await tx.educationDraft.create({ data: { id, ...data, sortOrder: await tx.educationDraft.count() } })
    await markDraftChanged(tx, user.email)
  })
  return { ok: true, message: 'Education draft saved.', data: { id } }
}

export const savePublication = async (input: unknown): Promise<AdminActionResult<{ id: string }>> => {
  const user = await requireAdmin()
  if (!user) return unauthorized()
  const parsed = publicationFormSchema.safeParse(input)
  if (!parsed.success) return validationFailure(parsed.error)
  const value = parsed.data
  const coverOk = await validAssetReference(prisma, value.coverImageId, MediaKind.IMAGE)
  const pdfOk = await validAssetReference(prisma, value.pdfAssetId, MediaKind.PDF)
  if (!coverOk || !pdfOk) return invalidAsset()

  const id = value.id ?? crypto.randomUUID()
  const current = value.id ? await prisma.publicationDraft.findUnique({ where: { id } }) : null
  if (value.id && !current) return missingRecord()
  if (current && stale(current.updatedAt, value.updatedAt)) return conflict()

  await prisma.$transaction(async (tx) => {
    const topicIds = await ensureTopics(tx, value.topics)
    const data = {
      slug: value.slug,
      title: value.title,
      year: value.year,
      month: value.month ?? null,
      type: value.type as PublicationType,
      status: (value.status as PublicationStatus) ?? PublicationStatus.PUBLISHED,
      venue: value.venue || null,
      pages: value.pages || null,
      doi: value.doi || null,
      paperUrl: value.paperUrl || null,
      scholarUrl: value.scholarUrl || null,
      abstract: value.abstract || null,
      bibtex: value.bibtex || null,
      coverImageId: value.coverImageId || null,
      pdfAssetId: value.pdfAssetId || null,
      featured: value.featured,
      enabled: value.enabled,
      updatedBy: user.email
    }
    if (current) {
      await tx.publicationAuthorDraft.deleteMany({ where: { publicationId: id } })
      await tx.publicationTopicDraft.deleteMany({ where: { publicationId: id } })
      await tx.publicationDraft.update({
        where: { id },
        data: {
          ...data,
          authors: {
            create: value.authors.map((author, sortOrder) => ({
              name: author.name,
              isSelf: author.isSelf,
              sortOrder
            }))
          },
          topics: { create: topicIds.map((topicId, sortOrder) => ({ topicId, sortOrder })) }
        }
      })
    } else {
      await tx.publicationDraft.create({
        data: {
          id,
          ...data,
          sortOrder: await tx.publicationDraft.count(),
          authors: {
            create: value.authors.map((author, sortOrder) => ({
              name: author.name,
              isSelf: author.isSelf,
              sortOrder
            }))
          },
          topics: { create: topicIds.map((topicId, sortOrder) => ({ topicId, sortOrder })) }
        }
      })
    }
    await markDraftChanged(tx, user.email)
  })
  return { ok: true, message: 'Publication draft saved.', data: { id } }
}

export const saveCapability = async (input: unknown): Promise<AdminActionResult<{ id: string }>> => {
  const user = await requireAdmin()
  if (!user) return unauthorized()
  const parsed = capabilityFormSchema.safeParse(input)
  if (!parsed.success) return validationFailure(parsed.error)
  const value = parsed.data
  const id = value.id ?? crypto.randomUUID()
  const current = value.id ? await prisma.capabilityGroupDraft.findUnique({ where: { id } }) : null
  if (value.id && !current) return missingRecord()
  if (current && stale(current.updatedAt, value.updatedAt)) return conflict()
  await prisma.$transaction(async (tx) => {
    const data = { title: value.title, description: value.description, enabled: value.enabled, updatedBy: user.email }
    if (current) {
      await tx.capabilityItemDraft.deleteMany({ where: { groupId: id } })
      await tx.capabilityGroupDraft.update({
        where: { id },
        data: { ...data, items: { create: value.items.map((label, sortOrder) => ({ label, sortOrder })) } }
      })
    } else {
      await tx.capabilityGroupDraft.create({
        data: {
          id,
          ...data,
          sortOrder: await tx.capabilityGroupDraft.count(),
          items: { create: value.items.map((label, sortOrder) => ({ label, sortOrder })) }
        }
      })
    }
    await markDraftChanged(tx, user.email)
  })
  return { ok: true, message: 'Capability draft saved.', data: { id } }
}

export const saveLearning = async (input: unknown): Promise<AdminActionResult<{ id: string }>> => {
  const user = await requireAdmin()
  if (!user) return unauthorized()
  const parsed = learningFormSchema.safeParse(input)
  if (!parsed.success) return validationFailure(parsed.error)
  const value = parsed.data
  const id = value.id ?? crypto.randomUUID()
  const current = value.id ? await prisma.learningDraft.findUnique({ where: { id } }) : null
  if (value.id && !current) return missingRecord()
  if (current && stale(current.updatedAt, value.updatedAt)) return conflict()
  await prisma.$transaction(async (tx) => {
    const data = {
      title: value.title,
      issuer: value.issuer,
      year: value.year ?? null,
      credentialUrl: value.credentialUrl || null,
      enabled: value.enabled,
      updatedBy: user.email
    }
    if (current) await tx.learningDraft.update({ where: { id }, data })
    else await tx.learningDraft.create({ data: { id, ...data, sortOrder: await tx.learningDraft.count() } })
    await markDraftChanged(tx, user.email)
  })
  return { ok: true, message: 'Learning draft saved.', data: { id } }
}

export const saveWorkStory = async (input: unknown): Promise<AdminActionResult<{ id: string }>> => {
  const user = await requireAdmin()
  if (!user) return unauthorized()
  const parsed = workStoryFormSchema.safeParse(input)
  if (!parsed.success) return validationFailure(parsed.error)
  const value = parsed.data
  const id = value.id ?? crypto.randomUUID()
  const current = value.id ? await prisma.workStoryDraft.findUnique({ where: { id } }) : null
  if (value.id && !current) return missingRecord()
  if (current && stale(current.updatedAt, value.updatedAt)) return conflict()
  await prisma.$transaction(async (tx) => {
    const data = {
      title: value.title,
      body: value.body,
      evidence: value.evidence,
      href: value.href,
      linkLabel: value.linkLabel,
      visualLabel: value.visualLabel,
      enabled: value.enabled,
      updatedBy: user.email
    }
    if (current) await tx.workStoryDraft.update({ where: { id }, data })
    else await tx.workStoryDraft.create({ data: { id, ...data, sortOrder: await tx.workStoryDraft.count() } })
    await markDraftChanged(tx, user.email)
  })
  return { ok: true, message: 'Work story draft saved.', data: { id } }
}

const assertCmsKind = (kind: unknown) => cmsItemKindSchema.safeParse(kind)

export const deleteCmsItem = async (kind: CmsItemKind, rawId: string): Promise<AdminActionResult> => {
  const user = await requireAdmin()
  if (!user) return unauthorized()
  const parsedKind = assertCmsKind(kind)
  if (!parsedKind.success) return validationFailure(parsedKind.error)
  const parsedId = idSchema.safeParse(rawId)
  if (!parsedId.success) return validationFailure(parsedId.error)
  const itemKind = parsedKind.data
  await prisma.$transaction(async (tx) => {
    if (itemKind === 'experience') await tx.experienceDraft.delete({ where: { id: parsedId.data } })
    else if (itemKind === 'publication') await tx.publicationDraft.delete({ where: { id: parsedId.data } })
    else if (itemKind === 'capability') await tx.capabilityGroupDraft.delete({ where: { id: parsedId.data } })
    else if (itemKind === 'education') await tx.educationDraft.delete({ where: { id: parsedId.data } })
    else if (itemKind === 'learning') await tx.learningDraft.delete({ where: { id: parsedId.data } })
    else await tx.workStoryDraft.delete({ where: { id: parsedId.data } })
    await markDraftChanged(tx, user.email)
  })
  return saved('Item removed from the draft.')
}

export const moveCmsItem = async (
  kind: CmsItemKind,
  rawId: string,
  direction: 'up' | 'down'
): Promise<AdminActionResult> => {
  const user = await requireAdmin()
  if (!user) return unauthorized()
  const parsedKind = assertCmsKind(kind)
  if (!parsedKind.success) return validationFailure(parsedKind.error)
  const parsedId = idSchema.safeParse(rawId)
  if (!parsedId.success) return validationFailure(parsedId.error)
  const itemKind = parsedKind.data

  await prisma.$transaction(async (tx) => {
    const loadOrdered = async () => {
      if (itemKind === 'experience')
        return tx.experienceDraft.findMany({ orderBy: { sortOrder: 'asc' }, select: { id: true, sortOrder: true } })
      if (itemKind === 'publication')
        return tx.publicationDraft.findMany({ orderBy: { sortOrder: 'asc' }, select: { id: true, sortOrder: true } })
      if (itemKind === 'capability')
        return tx.capabilityGroupDraft.findMany({
          orderBy: { sortOrder: 'asc' },
          select: { id: true, sortOrder: true }
        })
      if (itemKind === 'education')
        return tx.educationDraft.findMany({ orderBy: { sortOrder: 'asc' }, select: { id: true, sortOrder: true } })
      if (itemKind === 'learning')
        return tx.learningDraft.findMany({ orderBy: { sortOrder: 'asc' }, select: { id: true, sortOrder: true } })
      return tx.workStoryDraft.findMany({ orderBy: { sortOrder: 'asc' }, select: { id: true, sortOrder: true } })
    }

    const items = await loadOrdered()
    const index = items.findIndex((item) => item.id === parsedId.data)
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (index < 0 || targetIndex < 0 || targetIndex >= items.length) return
    const target = items[targetIndex]
    const current = items[index]
    if (!target || !current) return

    const update = async (id: string, sortOrder: number) => {
      if (itemKind === 'experience') await tx.experienceDraft.update({ where: { id }, data: { sortOrder } })
      else if (itemKind === 'publication') await tx.publicationDraft.update({ where: { id }, data: { sortOrder } })
      else if (itemKind === 'capability') await tx.capabilityGroupDraft.update({ where: { id }, data: { sortOrder } })
      else if (itemKind === 'education') await tx.educationDraft.update({ where: { id }, data: { sortOrder } })
      else if (itemKind === 'learning') await tx.learningDraft.update({ where: { id }, data: { sortOrder } })
      else await tx.workStoryDraft.update({ where: { id }, data: { sortOrder } })
    }
    await update(current.id, target.sortOrder)
    await update(target.id, current.sortOrder)
    await markDraftChanged(tx, user.email)
  })
  return saved('Display order updated.')
}

export const duplicateCmsItem = async (
  kind: CmsItemKind,
  rawId: string
): Promise<AdminActionResult<{ id: string }>> => {
  const user = await requireAdmin()
  if (!user) return unauthorized()
  const parsedKind = assertCmsKind(kind)
  if (!parsedKind.success) return validationFailure(parsedKind.error)
  const parsedId = idSchema.safeParse(rawId)
  if (!parsedId.success) return validationFailure(parsedId.error)
  const itemKind = parsedKind.data
  const snapshot = await readDraftSnapshot()

  if (itemKind === 'experience') {
    const source = snapshot.experiences.find((item) => item.id === parsedId.data)
    return source
      ? saveExperience({ ...source, id: undefined, role: `${source.role} (copy)`, updatedAt: undefined })
      : saved()
  }
  if (itemKind === 'publication') {
    const source = snapshot.publications.find((item) => item.id === parsedId.data)
    return source
      ? savePublication({
          ...source,
          id: undefined,
          slug: `${source.slug}-copy`,
          title: `${source.title} (copy)`,
          updatedAt: undefined
        })
      : saved()
  }
  if (itemKind === 'capability') {
    const source = snapshot.capabilities.find((item) => item.id === parsedId.data)
    return source
      ? saveCapability({ ...source, id: undefined, title: `${source.title} (copy)`, updatedAt: undefined })
      : saved()
  }
  if (itemKind === 'education') {
    const source = snapshot.education.find((item) => item.id === parsedId.data)
    return source
      ? saveEducation({ ...source, id: undefined, degree: `${source.degree} (copy)`, updatedAt: undefined })
      : saved()
  }
  if (itemKind === 'learning') {
    const source = snapshot.learning.find((item) => item.id === parsedId.data)
    return source
      ? saveLearning({ ...source, id: undefined, title: `${source.title} (copy)`, updatedAt: undefined })
      : saved()
  }
  const source = snapshot.workStories.find((item) => item.id === parsedId.data)
  return source
    ? saveWorkStory({ ...source, id: undefined, title: `${source.title} (copy)`, updatedAt: undefined })
    : saved()
}

const revalidatePublicContent = () => {
  updateTag('portfolio')
  revalidatePath('/', 'layout')
  revalidatePath('/publications')
  revalidatePath('/opengraph-image')
  revalidatePath('/sitemap.xml')
  revalidatePath('/robots.txt')
}

export const publishDraft = async (input: unknown): Promise<AdminActionResult<{ version: number }>> => {
  const user = await requireAdmin()
  if (!user) return unauthorized()
  const parsed = publishSchema.safeParse(input)
  if (!parsed.success) return validationFailure(parsed.error)
  const version = await prisma.$transaction(async (tx) => {
    const draft = await readDraftSnapshot(tx)
    const validated = publishedPortfolioSnapshotSchema.parse(upgradeSnapshot(draft))
    const revision = await tx.contentRevision.create({
      data: {
        schemaVersion: 2,
        snapshot: validated as Prisma.InputJsonValue,
        note: parsed.data.note || null,
        publishedBy: user.email
      }
    })
    await tx.publishState.upsert({
      where: { id: 'primary' },
      create: {
        id: 'primary',
        activeRevisionId: revision.id,
        hasUnpublishedChanges: false,
        draftUpdatedBy: user.email,
        publishedAt: revision.publishedAt
      },
      update: {
        activeRevisionId: revision.id,
        hasUnpublishedChanges: false,
        publishedAt: revision.publishedAt
      }
    })
    return revision.version
  })
  revalidatePublicContent()
  return { ok: true, message: `Version ${version} is now public.`, data: { version } }
}

export const rollbackRevision = async (rawId: string): Promise<AdminActionResult<{ version: number }>> => {
  const user = await requireAdmin()
  if (!user) return unauthorized()
  const parsedId = idSchema.safeParse(rawId)
  if (!parsedId.success) return validationFailure(parsedId.error)
  const source = await prisma.contentRevision.findUnique({ where: { id: parsedId.data } })
  if (!source) return { ok: false, code: 'REFERENCE', message: 'The selected revision no longer exists.' }

  let snapshot
  try {
    snapshot = upgradeSnapshot(source.snapshot)
  } catch {
    return { ok: false, code: 'VALIDATION', message: 'The selected revision is not compatible.' }
  }

  const version = await prisma.$transaction(async (tx) => {
    await replaceDraftFromSnapshot(tx, snapshot, user.email)
    const revision = await tx.contentRevision.create({
      data: {
        schemaVersion: 2,
        snapshot: snapshot as Prisma.InputJsonValue,
        note: `Rollback to version ${source.version}`,
        publishedBy: user.email
      }
    })
    await tx.publishState.update({
      where: { id: 'primary' },
      data: {
        activeRevisionId: revision.id,
        hasUnpublishedChanges: false,
        draftUpdatedAt: new Date(),
        draftUpdatedBy: user.email,
        publishedAt: revision.publishedAt
      }
    })
    return revision.version
  })
  revalidatePublicContent()
  return { ok: true, message: `Rollback published as version ${version}.`, data: { version } }
}

export const createMediaUploadSignature = async (
  kind: 'IMAGE' | 'PDF'
): Promise<
  AdminActionResult<{
    cloudName: string
    apiKey: string
    timestamp: number
    signature: string
    folder: string
    resourceType: 'image' | 'raw'
    allowedFormats: string
  }>
> => {
  const user = await requireAdmin()
  if (!user) return unauthorized()
  const config = getCloudinaryConfig()
  if (!config) return { ok: false, code: 'DELIVERY', message: 'Cloudinary is not configured.' }
  const timestamp = Math.floor(Date.now() / 1000)
  const folder = 'jahid-riad'
  const allowedFormats = kind === 'PDF' ? 'pdf' : 'jpg,jpeg,png,webp'
  const signature = config.client.utils.api_sign_request(
    { timestamp, folder, allowed_formats: allowedFormats },
    config.CLOUDINARY_API_SECRET
  )
  return {
    ok: true,
    message: 'Upload authorized.',
    data: {
      cloudName: config.CLOUDINARY_CLOUD_NAME,
      apiKey: config.CLOUDINARY_API_KEY,
      timestamp,
      signature,
      folder,
      resourceType: kind === 'PDF' ? 'raw' : 'image',
      allowedFormats
    }
  }
}

export const registerMediaAsset = async (input: unknown): Promise<AdminActionResult<{ id: string }>> => {
  const user = await requireAdmin()
  if (!user) return unauthorized()
  const parsed = mediaRegistrationSchema.safeParse(input)
  if (!parsed.success) return validationFailure(parsed.error)
  const config = getCloudinaryConfig()
  if (!config) return { ok: false, code: 'DELIVERY', message: 'Cloudinary is not configured.' }

  try {
    const cloudinaryResourceType = parsed.data.kind === 'PDF' ? 'raw' : 'image'
    const resource = await config.client.api.resource(parsed.data.publicId, {
      resource_type: cloudinaryResourceType
    })
    const bytes = Number(resource.bytes)
    const format = String(resource.format || '').toLowerCase()
    const secureUrl = String(resource.secure_url || '')
    const validHost = (() => {
      try {
        return new URL(secureUrl).hostname === 'res.cloudinary.com'
      } catch {
        return false
      }
    })()
    const validImage =
      cloudinaryResourceType === 'image' && ['jpg', 'jpeg', 'png', 'webp'].includes(format) && bytes <= 5 * 1024 * 1024
    const validPdf =
      cloudinaryResourceType === 'raw' &&
      (format === 'pdf' || secureUrl.toLowerCase().endsWith('.pdf')) &&
      bytes <= 10 * 1024 * 1024
    if (!validHost || (!validImage && !validPdf)) {
      await config.client.uploader.destroy(parsed.data.publicId, {
        resource_type: cloudinaryResourceType,
        invalidate: true
      })
      return { ok: false, code: 'VALIDATION', message: 'The uploaded asset failed server-side type or size checks.' }
    }

    const asset = await prisma.mediaAsset.create({
      data: {
        source: 'CLOUDINARY',
        kind: parsed.data.kind === 'PDF' ? MediaKind.PDF : MediaKind.IMAGE,
        publicId: parsed.data.publicId,
        secureUrl,
        width: typeof resource.width === 'number' ? resource.width : null,
        height: typeof resource.height === 'number' ? resource.height : null,
        bytes,
        format: format || (parsed.data.kind === 'PDF' ? 'pdf' : null),
        originalFilename: parsed.data.originalFilename,
        altText: parsed.data.altText || null,
        createdBy: user.email
      }
    })
    return { ok: true, message: 'Media uploaded.', data: { id: asset.id } }
  } catch {
    return { ok: false, code: 'DELIVERY', message: 'The uploaded asset could not be verified with Cloudinary.' }
  }
}

export const archiveMediaAsset = async (rawId: string): Promise<AdminActionResult> => {
  const user = await requireAdmin()
  if (!user) return unauthorized()
  const parsedId = idSchema.safeParse(rawId)
  if (!parsedId.success) return validationFailure(parsedId.error)

  try {
    await prisma.$transaction(async (tx) => {
      const settings = await tx.siteSettings.findUnique({ where: { id: 'primary' } })
      const publicationReference = await tx.publicationDraft.findFirst({
        where: {
          OR: [{ coverImageId: parsedId.data }, { pdfAssetId: parsedId.data }]
        },
        select: { id: true }
      })
      const referenced =
        publicationReference ||
        (settings
          ? [
              settings.heroImageId,
              settings.aboutImageId,
              settings.logoImageId,
              settings.openGraphImageId,
              settings.cvAssetId
            ].includes(parsedId.data)
          : false)
      if (referenced) throw new Error('REFERENCED')
      const asset = await tx.mediaAsset.findUnique({ where: { id: parsedId.data } })
      if (!asset || asset.source === 'LOCAL') throw new Error('LOCAL_OR_MISSING')
      await tx.mediaAsset.update({ where: { id: parsedId.data }, data: { archivedAt: new Date() } })
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'REFERENCED')
      return { ok: false, code: 'REFERENCE', message: 'This asset is in use. Replace it before archiving.' }
    if (error instanceof Error && error.message === 'LOCAL_OR_MISSING')
      return { ok: false, code: 'REFERENCE', message: 'Bundled assets cannot be archived.' }
    throw error
  }
  return saved('Media archived.')
}

export const updateContactMessageStatus = async (
  id: string,
  status: 'NEW' | 'READ' | 'ARCHIVED'
): Promise<AdminActionResult> => {
  const user = await requireAdmin()
  if (!user) return unauthorized()
  const parsedId = idSchema.safeParse(id)
  if (!parsedId.success) return validationFailure(parsedId.error)
  const parsedStatus = z.enum(['NEW', 'READ', 'ARCHIVED']).safeParse(status)
  if (!parsedStatus.success) return validationFailure(parsedStatus.error)

  const existing = await prisma.contactMessage.findUnique({ where: { id: parsedId.data }, select: { id: true } })
  if (!existing) return missingRecord()

  await prisma.contactMessage.update({
    where: { id: parsedId.data },
    data: { status: parsedStatus.data as ContactMessageStatus }
  })
  return saved('Message status updated.')
}

export const changeAdminPassword = async (input: unknown): Promise<AdminActionResult> => {
  const user = await requireAdmin()
  if (!user) return unauthorized()
  const parsed = changePasswordSchema.safeParse(input)
  if (!parsed.success) return validationFailure(parsed.error)

  const admin = await prisma.adminUser.findUnique({ where: { email: user.email.toLowerCase() } })
  if (!admin) return unauthorized()

  const currentOk = await verifyPasswordSafe(parsed.data.currentPassword, admin.passwordHash)
  if (!currentOk) {
    return {
      ok: false,
      code: 'VALIDATION',
      message: 'Current password is incorrect.',
      fieldErrors: { currentPassword: 'Current password is incorrect' }
    }
  }

  const nextHash = await hashPassword(parsed.data.newPassword)
  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { passwordHash: nextHash, passwordChangedAt: new Date() }
  })
  return saved('Password updated.')
}

export const revokeAllAdminSessions = async (): Promise<AdminActionResult> => {
  const user = await requireAdmin()
  if (!user) return unauthorized()
  await prisma.adminSession.deleteMany({ where: { adminId: user.id } })
  await deleteAdminSession()
  return saved('All admin sessions have been signed out.')
}
