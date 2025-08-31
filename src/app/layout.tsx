import '@mantine/core/styles.css'

import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from '@mantine/core'

export const metadata = {
  title: 'MD. Jahid Alam Riad',
  description: 'Business Analyst • IT Specialist'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>

      <body suppressHydrationWarning>
        <MantineProvider>{children}</MantineProvider>
      </body>
    </html>
  )
}
