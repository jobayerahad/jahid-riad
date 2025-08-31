'use client'

import Link from 'next/link'
import { Center, Card, Title, Text, Button, Stack, Group } from '@mantine/core'
import { motion } from 'framer-motion'

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

const Error = ({ error, reset }: Props) => (
  <Center style={{ minHeight: '70vh', padding: 40 }}>
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
      <Card shadow="lg" padding="xl">
        <Stack align="center">
          <Title order={2}>Something went wrong</Title>

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
)

export default Error
