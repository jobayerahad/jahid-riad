import type { MetadataRoute } from 'next'
import { getPortfolioContent } from '@/data/portfolio'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { settings, profile } = await getPortfolioContent()
  return {
    name: settings.siteName,
    short_name: profile.shortName,
    description: settings.metaDescription,
    start_url: '/',
    display: 'standalone',
    background_color: '#f7f7f2',
    theme_color: '#285342',
    icons: [
      { src: '/icon', sizes: '32x32', type: 'image/png' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' }
    ]
  }
}
