import { ensureCmsInitialized, readDraftSnapshot } from '@/lib/cms'
import { prisma } from '@/lib/prisma'

export const getAdminData = async (email: string) => {
  await ensureCmsInitialized(email)
  const [draft, state, revisions, media, profile, copy, settings] = await Promise.all([
    readDraftSnapshot(),
    prisma.publicationState.findUnique({ where: { id: 'primary' }, include: { activeRevision: true } }),
    prisma.contentRevision.findMany({ orderBy: { version: 'desc' }, take: 30 }),
    prisma.mediaAsset.findMany({ where: { archivedAt: null }, orderBy: { createdAt: 'desc' } }),
    prisma.profileDraft.findUnique({ where: { id: 'primary' } }),
    prisma.contentCopyDraft.findUnique({ where: { id: 'primary' } }),
    prisma.siteSettings.findUnique({ where: { id: 'primary' } })
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
      resourceType: asset.resourceType,
      width: asset.width,
      height: asset.height,
      bytes: asset.bytes,
      format: asset.format,
      originalFilename: asset.originalFilename,
      altText: asset.altText,
      createdAt: asset.createdAt.toISOString()
    })),
    timestamps: {
      profile: profile?.updatedAt.toISOString(),
      copy: copy?.updatedAt.toISOString(),
      settings: settings?.updatedAt.toISOString()
    }
  }
}

export type AdminData = Awaited<ReturnType<typeof getAdminData>>
