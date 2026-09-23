import clsx from 'clsx'
import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import AnalyticsConsent from '@/components/ui/analytics-consent'
import { getPortfolioContent } from '@/data/portfolio'
import type { WrapperProps } from '@/types'

const spaceGrotesk = localFont({
  src: '../assets/fonts/space-grotesk-latin.woff2',
  weight: '300 700',
  display: 'swap',
  variable: '--font-space-grotesk'
})
const inter = localFont({
  src: '../assets/fonts/inter-latin.woff2',
  weight: '100 900',
  display: 'swap',
  variable: '--font-inter'
})

export const generateMetadata = async (): Promise<Metadata> => {
  const { settings, profile } = await getPortfolioContent()
  const socialImage = settings.openGraphImage?.url ?? '/opengraph-image'

  return {
    metadataBase: new URL(settings.siteUrl),
    title: {
      default: settings.defaultTitle,
      template: `%s | ${profile.name}`
    },
    description: settings.metaDescription,
    keywords: settings.keywords,
    authors: [{ name: profile.name, url: settings.siteUrl }],
    creator: profile.name,
    alternates: { canonical: '/' },
    openGraph: {
      title: settings.openGraphTitle,
      description: settings.openGraphDescription,
      url: settings.siteUrl,
      siteName: profile.name,
      images: [{ url: socialImage, width: 1200, height: 630, alt: `${profile.name} portfolio` }],
      locale: 'en_US',
      type: 'profile'
    },
    twitter: {
      card: 'summary_large_image',
      title: settings.twitterTitle,
      description: settings.twitterDescription,
      images: [socialImage]
    },
    robots: { index: true, follow: true }
  }
}

const RootLayout = ({ children }: WrapperProps) => {
  const analyticsId = process.env.GA_TRACKING_ID

  return (
    <html lang="en" className={clsx(spaceGrotesk.variable, inter.variable)}>
      <body suppressHydrationWarning>
        {children}
        {process.env.NODE_ENV === 'production' && analyticsId ? <AnalyticsConsent gaId={analyticsId} /> : null}
      </body>
    </html>
  )
}

export default RootLayout
