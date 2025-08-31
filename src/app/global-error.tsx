'use client'

import Link from 'next/link'
import { Center, Card, Title, Text, Button, Stack, Group } from '@mantine/core'
import { motion } from 'framer-motion'

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

const GlobalError = ({ error, reset }: Props) => (
  <html>
    <body>
      <Center style={{ minHeight: '100vh', padding: 40 }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          <Card shadow="xl" padding="xl">
            <Stack align="center" gap="md">
              <Title order={2}>Application Error</Title>

              <Text c="dimmed">{error?.message || 'An unexpected error occurred.'}</Text>

              <Group>
                <Button onClick={() => reset()}>Try again</Button>
                <Button component={Link} href="/" variant="outline">
                  Home
                </Button>
              </Group>
            </Stack>
          </Card>
        </motion.div>
      </Center>
    </body>
  </html>
)

export default GlobalError
