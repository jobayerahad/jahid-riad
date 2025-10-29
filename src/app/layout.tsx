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

export const metadata = {
  title: 'MD. Jahid Alam Riad | Researcher & Engineer',
  description: 'Personal website of Jahid Riad - Computer Science Researcher and Engineer'
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
