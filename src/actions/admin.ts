'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { Prisma } from '@/generated/prisma/client'
import { auth } from '@/lib/auth'
import { isAdminConfigured } from '@/lib/admin-config'
import { getCloudinaryConfig } from '@/lib/cloudinary'
import { readDraftSnapshot, replaceDraftFromSnapshot } from '@/lib/cms'
import { prisma } from '@/lib/prisma'
import {
  aboutFormSchema,
  capabilityFormSchema,
  educationFormSchema,
  experienceFormSchema,
  idSchema,
  mediaRegistrationSchema,
  profileHeroFormSchema,
  publicationFormSchema,
  publishSchema,
  sectionCopyFormSchema,
  settingsFormSchema
} from '@/schemas/admin'
import { publishedPortfolioSnapshotSchema } from '@/schemas/portfolio-content'
import type { AdminActionResult, CmsItemKind } from '@/types/admin'

export type { AdminActionResult } from '@/types/admin'

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
  const session = await auth.api.getSession({ headers: await headers() })
  const allowedEmail = process.env.ADMIN_EMAIL?.toLowerCase()
  return session?.user.email.toLowerCase() === allowedEmail ? session : null
}

const requireAdmin = async () => {
  const session = await getAdminSession()
  return session?.user ?? null
}

const markDraftChanged = (tx: Prisma.TransactionClient, email: string) =>
  tx.publicationState.upsert({
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

const validAssetReference = async (id: string | null | undefined, kind: 'IMAGE' | 'PDF') => {
  if (!id) return true
  const asset = await prisma.mediaAsset.findFirst({ where: { id, kind, archivedAt: null }, select: { id: true } })
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

export const saveProfileHero = async (input: unknown): Promise<AdminActionResult> => {
  const user = await requireAdmin()
  if (!user) return unauthorized()
  const parsed = profileHeroFormSchema.safeParse(input)
  if (!parsed.success) return validationFailure(parsed.error)
  const { socialLinks, expectedUpdatedAt, expectedCopyUpdatedAt, expectedSettingsUpdatedAt, heroImageId, ...values } =
    parsed.data
  if (!(await validAssetReference(heroImageId, 'IMAGE'))) return invalidAsset()
  const [current, currentCopy, currentSettings] = await Promise.all([
    prisma.profileDraft.findUnique({ where: { id: 'primary' } }),
    prisma.contentCopyDraft.findUnique({ where: { id: 'primary' } }),
    prisma.siteSettings.findUnique({ where: { id: 'primary' } })
  ])
  if (
    (current && stale(current.updatedAt, expectedUpdatedAt)) ||
    (currentCopy && stale(currentCopy.updatedAt, expectedCopyUpdatedAt)) ||
    (currentSettings && stale(currentSettings.updatedAt, expectedSettingsUpdatedAt))
  )
    return conflict()

  const profileData = {
    name: values.name,
    shortName: values.shortName,
    role: values.role,
    positioning: values.positioning,
    summary: values.summary,
    location: values.location,
    updatedBy: user.email
  }
  const heroData = {
    heroHeading: values.heroHeading,
    heroAccent: values.heroAccent,
    heroIntroduction: values.heroIntroduction,
    heroPrimaryLabel: values.heroPrimaryLabel,
    heroPrimaryHref: values.heroPrimaryHref,
    heroSecondaryLabel: values.heroSecondaryLabel,
    heroSecondaryHref: values.heroSecondaryHref,
    heroFocusLabel: values.heroFocusLabel,
    updatedBy: user.email
  }

  await prisma.$transaction(async (tx) => {
    await tx.profileDraft.update({ where: { id: 'primary' }, data: profileData })
    await tx.contentCopyDraft.update({ where: { id: 'primary' }, data: heroData })
    await tx.siteSettings.update({ where: { id: 'primary' }, data: { heroImageId, updatedBy: user.email } })
    await tx.socialLinkDraft.deleteMany()
    if (socialLinks.length) {
      await tx.socialLinkDraft.createMany({
        data: socialLinks.map((link, sortOrder) => ({
          id: crypto.randomUUID(),
          label: link.label,
          href: link.href,
          kind: link.kind.toUpperCase(),
          enabled: link.enabled,
          sortOrder
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
  const { expectedUpdatedAt, expectedSettingsUpdatedAt, aboutImageId, ...data } = parsed.data
  if (!(await validAssetReference(aboutImageId, 'IMAGE'))) return invalidAsset()
  const [current, currentSettings] = await Promise.all([
    prisma.contentCopyDraft.findUnique({ where: { id: 'primary' } }),
    prisma.siteSettings.findUnique({ where: { id: 'primary' } })
  ])
  if (
    (current && stale(current.updatedAt, expectedUpdatedAt)) ||
    (currentSettings && stale(currentSettings.updatedAt, expectedSettingsUpdatedAt))
  )
    return conflict()
  await prisma.$transaction(async (tx) => {
    await tx.contentCopyDraft.update({ where: { id: 'primary' }, data: { ...data, updatedBy: user.email } })
    await tx.siteSettings.update({ where: { id: 'primary' }, data: { aboutImageId, updatedBy: user.email } })
    await markDraftChanged(tx, user.email)
  })
  return saved('About draft saved.')
}

export const saveSectionCopy = async (input: unknown): Promise<AdminActionResult> => {
  const user = await requireAdmin()
  if (!user) return unauthorized()
  const parsed = sectionCopyFormSchema.safeParse(input)
  if (!parsed.success) return validationFailure(parsed.error)
  const { expectedUpdatedAt, ...data } = parsed.data
  const current = await prisma.contentCopyDraft.findUnique({ where: { id: 'primary' } })
  if (current && stale(current.updatedAt, expectedUpdatedAt)) return conflict()
  await prisma.$transaction(async (tx) => {
    await tx.contentCopyDraft.update({ where: { id: 'primary' }, data: { ...data, updatedBy: user.email } })
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
    validAssetReference(data.logoImageId, 'IMAGE'),
    validAssetReference(data.openGraphImageId, 'IMAGE'),
    validAssetReference(data.cvAssetId, 'PDF')
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
  if (!value.current && !value.endDate) {
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
      role: value.role,
      location: value.location,
      startDate: new Date(`${value.startDate}T00:00:00.000Z`),
      endDate: value.current || !value.endDate ? null : new Date(`${value.endDate}T00:00:00.000Z`),
      current: value.current,
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
      endYear: value.endYear,
      detail: value.detail,
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
  if (!(await validAssetReference(value.mediaAssetId, 'IMAGE'))) return invalidAsset()
  const id = value.id ?? crypto.randomUUID()
  const current = value.id ? await prisma.publicationDraft.findUnique({ where: { id } }) : null
  if (value.id && !current) return missingRecord()
  if (current && stale(current.updatedAt, value.updatedAt)) return conflict()
  await prisma.$transaction(async (tx) => {
    const data = {
      title: value.title,
      year: value.year,
      type: value.type,
      venue: value.venue || null,
      pages: value.pages || null,
      doi: value.doi || null,
      paperUrl: value.paperUrl || null,
      scholarUrl: value.scholarUrl,
      abstract: value.abstract || null,
      mediaAssetId: value.mediaAssetId || null,
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
          authors: { create: value.authors.map((name, sortOrder) => ({ name, sortOrder })) },
          topics: { create: value.topics.map((name, sortOrder) => ({ name, sortOrder })) }
        }
      })
    } else {
      await tx.publicationDraft.create({
        data: {
          id,
          ...data,
          sortOrder: await tx.publicationDraft.count(),
          authors: { create: value.authors.map((name, sortOrder) => ({ name, sortOrder })) },
          topics: { create: value.topics.map((name, sortOrder) => ({ name, sortOrder })) }
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

const modelFor = (kind: CmsItemKind) => {
  if (kind === 'experience') return prisma.experienceDraft
  if (kind === 'publication') return prisma.publicationDraft
  if (kind === 'capability') return prisma.capabilityGroupDraft
  return prisma.educationDraft
}

export const deleteCmsItem = async (kind: CmsItemKind, rawId: string): Promise<AdminActionResult> => {
  const user = await requireAdmin()
  if (!user) return unauthorized()
  const parsedId = idSchema.safeParse(rawId)
  if (!parsedId.success) return validationFailure(parsedId.error)
  await prisma.$transaction(async (tx) => {
    if (kind === 'experience') await tx.experienceDraft.delete({ where: { id: parsedId.data } })
    else if (kind === 'publication') await tx.publicationDraft.delete({ where: { id: parsedId.data } })
    else if (kind === 'capability') await tx.capabilityGroupDraft.delete({ where: { id: parsedId.data } })
    else await tx.educationDraft.delete({ where: { id: parsedId.data } })
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
  const parsedId = idSchema.safeParse(rawId)
  if (!parsedId.success) return validationFailure(parsedId.error)
  const model = modelFor(kind) as typeof prisma.educationDraft
  const items = await model.findMany({ orderBy: { sortOrder: 'asc' }, select: { id: true, sortOrder: true } })
  const index = items.findIndex((item) => item.id === parsedId.data)
  const targetIndex = direction === 'up' ? index - 1 : index + 1
  if (index < 0 || targetIndex < 0 || targetIndex >= items.length) return saved('Order is already at its limit.')
  const target = items[targetIndex]
  const current = items[index]
  await prisma.$transaction(async (tx) => {
    if (!target || !current) return
    const update = async (id: string, sortOrder: number) => {
      if (kind === 'experience') await tx.experienceDraft.update({ where: { id }, data: { sortOrder } })
      else if (kind === 'publication') await tx.publicationDraft.update({ where: { id }, data: { sortOrder } })
      else if (kind === 'capability') await tx.capabilityGroupDraft.update({ where: { id }, data: { sortOrder } })
      else await tx.educationDraft.update({ where: { id }, data: { sortOrder } })
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
  const parsedId = idSchema.safeParse(rawId)
  if (!parsedId.success) return validationFailure(parsedId.error)
  const snapshot = await readDraftSnapshot()
  if (kind === 'experience') {
    const source = snapshot.experiences.find((item) => item.id === parsedId.data)
    return source
      ? saveExperience({ ...source, id: undefined, role: `${source.role} (copy)`, updatedAt: undefined })
      : saved()
  }
  if (kind === 'publication') {
    const source = snapshot.publications.find((item) => item.id === parsedId.data)
    return source
      ? savePublication({ ...source, id: undefined, title: `${source.title} (copy)`, updatedAt: undefined })
      : saved()
  }
  if (kind === 'capability') {
    const source = snapshot.capabilities.find((item) => item.id === parsedId.data)
    return source
      ? saveCapability({ ...source, id: undefined, title: `${source.title} (copy)`, updatedAt: undefined })
      : saved()
  }
  const source = snapshot.education.find((item) => item.id === parsedId.data)
  return source
    ? saveEducation({ ...source, id: undefined, degree: `${source.degree} (copy)`, updatedAt: undefined })
    : saved()
}

const revalidatePublicContent = () => {
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
    const snapshot = await readDraftSnapshot(tx)
    const validated = publishedPortfolioSnapshotSchema.parse(snapshot)
    const latest = await tx.contentRevision.aggregate({ _max: { version: true } })
    const nextVersion = (latest._max.version ?? 0) + 1
    const revision = await tx.contentRevision.create({
      data: {
        version: nextVersion,
        snapshot: validated as Prisma.InputJsonValue,
        note: parsed.data.note || null,
        publishedBy: user.email
      }
    })
    await tx.publicationState.upsert({
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
    return nextVersion
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
  const snapshot = publishedPortfolioSnapshotSchema.safeParse(source.snapshot)
  if (!snapshot.success) return { ok: false, code: 'VALIDATION', message: 'The selected revision is not compatible.' }

  const version = await prisma.$transaction(async (tx) => {
    await replaceDraftFromSnapshot(tx, snapshot.data, user.email)
    const latest = await tx.contentRevision.aggregate({ _max: { version: true } })
    const nextVersion = (latest._max.version ?? 0) + 1
    const revision = await tx.contentRevision.create({
      data: {
        version: nextVersion,
        snapshot: snapshot.data as Prisma.InputJsonValue,
        note: `Rollback to version ${source.version}`,
        publishedBy: user.email
      }
    })
    await tx.publicationState.update({
      where: { id: 'primary' },
      data: {
        activeRevisionId: revision.id,
        hasUnpublishedChanges: false,
        draftUpdatedAt: new Date(),
        draftUpdatedBy: user.email,
        publishedAt: revision.publishedAt
      }
    })
    return nextVersion
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
    const resourceType = parsed.data.kind === 'PDF' ? 'raw' : 'image'
    const resource = await config.client.api.resource(parsed.data.publicId, { resource_type: resourceType })
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
      resourceType === 'image' && ['jpg', 'jpeg', 'png', 'webp'].includes(format) && bytes <= 5 * 1024 * 1024
    const validPdf =
      resourceType === 'raw' &&
      (format === 'pdf' || secureUrl.toLowerCase().endsWith('.pdf')) &&
      bytes <= 10 * 1024 * 1024
    if (!validHost || (!validImage && !validPdf)) {
      await config.client.uploader.destroy(parsed.data.publicId, { resource_type: resourceType, invalidate: true })
      return { ok: false, code: 'VALIDATION', message: 'The uploaded asset failed server-side type or size checks.' }
    }

    const asset = await prisma.mediaAsset.create({
      data: {
        source: 'CLOUDINARY',
        kind: parsed.data.kind,
        publicId: parsed.data.publicId,
        secureUrl,
        resourceType,
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
  const settings = await prisma.siteSettings.findUnique({ where: { id: 'primary' } })
  const publicationReference = await prisma.publicationDraft.findFirst({
    where: { mediaAssetId: parsedId.data },
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
  if (referenced) return { ok: false, code: 'REFERENCE', message: 'This asset is in use. Replace it before archiving.' }
  const asset = await prisma.mediaAsset.findUnique({ where: { id: parsedId.data } })
  if (!asset || asset.source === 'LOCAL')
    return { ok: false, code: 'REFERENCE', message: 'Bundled assets cannot be archived.' }
  await prisma.mediaAsset.update({ where: { id: parsedId.data }, data: { archivedAt: new Date() } })
  return saved('Media archived.')
}
