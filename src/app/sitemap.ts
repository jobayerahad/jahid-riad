import type { MetadataRoute } from 'next'
import { getPortfolioContent } from '@/data/portfolio'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { settings } = await getPortfolioContent()
  const siteUrl = settings.siteUrl.replace(/\/$/, '')
  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: `${siteUrl}/profile`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.7 },
    { url: `${siteUrl}/publications`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.8 }
  ]
}
