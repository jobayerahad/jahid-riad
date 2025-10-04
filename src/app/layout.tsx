import clsx from 'clsx'
import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { Space_Grotesk, Inter } from 'next/font/google'

import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import './globals.css'
import { theme } from '@/config/theme'

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

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en" className={clsx(spaceGrotesk.variable, inter.variable)} {...mantineHtmlProps}>
    <head>
      <ColorSchemeScript forceColorScheme="light" />
    </head>

    <body suppressHydrationWarning>
      <MantineProvider forceColorScheme="light" theme={theme} classNamesPrefix="jr">
        <Notifications />
        {children}
      </MantineProvider>
    </body>
  </html>
)

export default RootLayout
