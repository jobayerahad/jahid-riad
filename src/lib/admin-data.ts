import { ensureCmsInitialized, readDraftSnapshot } from '@/lib/cms'
import { prisma } from '@/lib/prisma'

export const getAdminData = async (email: string) => {
  await ensureCmsInitialized(email)
  const [draft, state, revisions, media, profile, hero, settings, messages] = await Promise.all([
    readDraftSnapshot(),
    prisma.publishState.findUnique({ where: { id: 'primary' }, include: { activeRevision: true } }),
    prisma.contentRevision.findMany({ orderBy: { version: 'desc' }, take: 30 }),
    prisma.mediaAsset.findMany({ where: { archivedAt: null }, orderBy: { createdAt: 'desc' } }),
    prisma.profileDraft.findUnique({ where: { id: 'primary' } }),
    prisma.heroCopyDraft.findUnique({ where: { id: 'primary' } }),
    prisma.siteSettings.findUnique({ where: { id: 'primary' } }),
    prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' }, take: 50 })
  ])

  return {
    draft,
    state: {
      hasUnpublishedChanges: state?.hasUnpublishedChanges ?? true,
      version: state?.activeRevision?.version ?? 0,
      publishedAt: state?.publishedAt?.toISOString() ?? null,
      draftUpdatedAt: state?.draftUpdatedAt.toISOString() ?? null,
      draftUpdatedBy: state?.draftUpdatedBy ?? null
    },
    revisions: revisions.map((revision) => ({
      id: revision.id,
      version: revision.version,
      schemaVersion: revision.schemaVersion,
      note: revision.note,
      publishedAt: revision.publishedAt.toISOString(),
      publishedBy: revision.publishedBy,
      active: revision.id === state?.activeRevisionId
    })),
    media: media.map((asset) => ({
      id: asset.id,
      source: asset.source,
      kind: asset.kind,
      publicId: asset.publicId,
      secureUrl: asset.secureUrl,
      width: asset.width,
      height: asset.height,
      bytes: asset.bytes,
      format: asset.format,
      originalFilename: asset.originalFilename,
      altText: asset.altText,
      createdAt: asset.createdAt.toISOString()
    })),
    messages: messages.map((message) => ({
      id: message.id,
      name: message.name,
      email: message.email,
      subject: message.subject,
      message: message.message,
      status: message.status,
      emailDelivered: message.emailDelivered,
      createdAt: message.createdAt.toISOString()
    })),
    timestamps: {
      profile: profile?.updatedAt.toISOString(),
      hero: hero?.updatedAt.toISOString(),
      copy: hero?.updatedAt.toISOString(),
      settings: settings?.updatedAt.toISOString()
    }
  }
}

export type AdminData = Awaited<ReturnType<typeof getAdminData>>
