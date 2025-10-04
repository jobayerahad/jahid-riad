'use client'

import Link from 'next/link'
import { Container, Title, Text, Button, SimpleGrid, Group, Code } from '@mantine/core'
import { MdOutlineRefresh } from 'react-icons/md'
import { IoHome } from 'react-icons/io5'
import classes from './error.module.css'

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

const Error = ({ error, reset }: Props) => (
  <div className={classes.wrapper}>
    <Container size="md">
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <div>
          <Title size="2rem" c="white" mb="lg">
            ⚠️ Something went wrong!
          </Title>

          <Text size="lg" mb="md" c="white">
            We apologize for the inconvenience. An unexpected error has occurred.
          </Text>

          <Code bg="rgba(0, 0, 0, 0.2)" c="white" block mb="lg">
            Error: {error.message || 'Unknown error'}
          </Code>

          <Group>
            <Button variant="white" onClick={reset} size="md" leftSection={<MdOutlineRefresh />}>
              Try Again
            </Button>

            <Button color="white" component={Link} href="/" size="md" variant="outline" leftSection={<IoHome />}>
              Go Home
            </Button>
          </Group>
        </div>

        <div className={classes.illustration}>
          <div className={classes.circuit}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className={classes.circuitLine} style={{ '--delay': i * 0.1 } as React.CSSProperties}></div>
            ))}
          </div>
          <div className={classes.bug}>
            <div className={classes.bugBody}></div>
            <div className={classes.bugAntenna}></div>
            <div className={classes.bugAntenna}></div>
          </div>
        </div>
      </SimpleGrid>
    </Container>
  </div>
)

export default Error
