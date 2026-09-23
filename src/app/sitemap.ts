import type { MetadataRoute } from 'next'
import { getPortfolioContent } from '@/data/portfolio'
import { getPublishedMeta } from '@/lib/cms'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ settings, publications }, meta] = await Promise.all([getPortfolioContent(), getPublishedMeta()])
  const siteUrl = settings.siteUrl.replace(/\/$/, '')
  const lastModified = meta.publishedAt ? new Date(meta.publishedAt) : new Date()

  return [
    { url: siteUrl, lastModified, changeFrequency: 'monthly', priority: 1 },
    { url: `${siteUrl}/profile`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/publications`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    ...publications
      .filter((item) => item.enabled)
      .map((item) => ({
        url: `${siteUrl}/publications/${item.slug}`,
        lastModified,
        changeFrequency: 'yearly' as const,
        priority: 0.6
      }))
  ]
}
