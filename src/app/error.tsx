'use client'

import Link from 'next/link'
import { Button, Container, Group, Text, Title } from '@mantine/core'
import { IoHome } from 'react-icons/io5'
import { MdOutlineRefresh } from 'react-icons/md'
import classes from './error.module.css'

type Props = { error: Error & { digest?: string }; reset: () => void }

const Error = ({ reset }: Props) => (
  <div className={classes.wrapper}>
    <Container size="sm">
      <Title c="white" mb="lg">
        Something went wrong
      </Title>
      <Text size="lg" mb="xl" c="white">
        An unexpected error occurred. No technical details have been exposed. Please try again or return home.
      </Text>
      <Group>
        <Button variant="white" onClick={reset} size="md" leftSection={<MdOutlineRefresh aria-hidden="true" />}>
          Try again
        </Button>
        <Button
          color="white"
          component={Link}
          href="/"
          size="md"
          variant="outline"
          leftSection={<IoHome aria-hidden="true" />}
        >
          Go home
        </Button>
      </Group>
    </Container>
  </div>
)

export default Error
