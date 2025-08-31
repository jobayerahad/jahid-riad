'use client'

import Link from 'next/link'
import { Center, Card, Title, Text, Button, Stack, Group } from '@mantine/core'
import { motion } from 'framer-motion'
import { FaHome } from 'react-icons/fa'

const NotFound = () => (
  <Center style={{ minHeight: '70vh', padding: 40 }}>
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
      <Card shadow="lg" padding="xl">
        <Stack align="center" gap="md">
          <Title order={2}>404 — Page Not Found</Title>

          <Text c="dimmed">We couldn’t find the page you’re looking for.</Text>

          <Group>
            <Button component={Link} href="/" leftSection={<FaHome />}>
              Back to Home
            </Button>
          </Group>
        </Stack>
      </Card>
    </motion.div>
  </Center>
)

export default NotFound
