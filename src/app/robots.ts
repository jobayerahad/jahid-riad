import type { MetadataRoute } from 'next'
import { getPortfolioContent } from '@/data/portfolio'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { settings } = await getPortfolioContent()
  const siteUrl = settings.siteUrl.replace(/\/$/, '')
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/admin/']
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl
  }
}
