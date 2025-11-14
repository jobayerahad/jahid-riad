import clsx from 'clsx'
import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { Space_Grotesk, Inter } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'

import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import './globals.css'
import { theme } from '@/config/theme'
import ReCaptchaProvider from '@/components/re-captcha-provider'
import { WrapperProps } from '@/types'
import { Metadata } from 'next'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk'
})

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: {
    default: 'MD. Jahid Alam Riad | Researcher & Engineer',
    template: '%s | MD. Jahid Alam Riad'
  },

  description:
    'MD. Jahid Alam Riad — Computer Science Researcher and Engineer specializing in machine learning, deep learning, and software engineering.',

  keywords: [
    'Jahid Riad',
    'Md Jahid Alam Riad',
    'Computer Science Researcher',
    'Machine Learning',
    'Deep Learning',
    'Software Engineer',
    'AI Research'
  ],

  authors: [{ name: 'MD. Jahid Alam Riad', url: 'https://www.jahidriad.com' }],

  creator: 'MD. Jahid Alam Riad',
  publisher: 'MD. Jahid Alam Riad',

  metadataBase: new URL('https://www.jahidriad.com'),
  alternates: {
    canonical: '/'
  },

  openGraph: {
    title: 'MD. Jahid Alam Riad | Researcher & Engineer',
    description:
      'Official website of MD. Jahid Alam Riad — Researcher in AI, Machine Learning, and Software Engineering.',
    url: 'https://www.jahidriad.com',
    siteName: 'MD. Jahid Alam Riad',
    images: [
      {
        url: '/logo-flat.png',
        width: 1200,
        height: 630,
        alt: 'MD. Jahid Alam Riad – Researcher & Engineer'
      }
    ],
    locale: 'en_US',
    type: 'website'
  },

  twitter: {
    card: 'summary_large_image',
    title: 'MD. Jahid Alam Riad | Researcher & Engineer',
    description: 'Computer Science Researcher specializing in ML, AI, and software engineering.',
    images: ['/logo.png']
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true
    }
  }
}

const RootLayout = ({ children }: WrapperProps) => (
  <html lang="en" className={clsx(spaceGrotesk.variable, inter.variable)} {...mantineHtmlProps}>
    <head>
      <ColorSchemeScript forceColorScheme="light" />
    </head>

    <body suppressHydrationWarning>
      <MantineProvider forceColorScheme="light" theme={theme} classNamesPrefix="jr">
        <Notifications />

        <ReCaptchaProvider>{children}</ReCaptchaProvider>
      </MantineProvider>

      {process.env.NODE_ENV === 'production' && <GoogleAnalytics gaId={process.env.GA_TRACKING_ID!} />}
    </body>
  </html>
)

export default RootLayout
