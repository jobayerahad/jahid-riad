'use client'

import { ActionIcon, Anchor, Box, Container, Divider, Group, Image, Text } from '@mantine/core'
import { motion } from 'framer-motion'
import { FaGithub, FaLinkedinIn } from 'react-icons/fa'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const copyright = (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      viewport={{ once: true }}
    >
      <Text size="sm" c="gray">
        &copy; {currentYear} Jahid Riad. All Rights Reserved.
      </Text>
    </motion.div>
  )

  return (
    <footer className="bg-dark">
      <Container size="xl" pb="md">
        <Divider color="gray" mb="sm" />

        <Group justify="space-between">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Image src="/logo-flat.png" alt="Jahid Alam Riad" h="2.5rem" w="auto" />
          </motion.div>

          <Box visibleFrom="md">{copyright}</Box>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Group>
              <ActionIcon
                component="a"
                href="https://www.linkedin.com/in/md-jahid-alam-riad-6937aa11a/"
                target="_blank"
                size="lg"
                aria-label="LinkedIn"
              >
                <FaLinkedinIn />
              </ActionIcon>

              <ActionIcon size="lg" aria-label="GitHub">
                <FaGithub />
              </ActionIcon>
            </Group>
          </motion.div>
        </Group>

        <Group justify="center" hiddenFrom="md" mt="md">
          {copyright}
        </Group>
      </Container>
    </footer>
  )
}

export default Footer
