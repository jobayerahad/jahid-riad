'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Container, Title, Text, Button, SimpleGrid, Group, Flex } from '@mantine/core'
import { IoHome } from 'react-icons/io5'
import { FaArrowLeft } from 'react-icons/fa6'
import classes from './not-found.module.css'

const NotFound = () => {
  const { back } = useRouter()

  return (
    <main className={classes.wrapper}>
      <Container size="md">
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          <Flex direction="column" justify="center">
            <Title size="2rem" c="white" mb="lg">
              Page not found
            </Title>

            <Text mb="md" c="white">
              The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </Text>

            <Group>
              <Button component={Link} href="/" size="md" leftSection={<IoHome aria-hidden="true" />}>
                Go Home
              </Button>

              <Button
                color="white"
                variant="outline"
                size="md"
                leftSection={<FaArrowLeft aria-hidden="true" />}
                onClick={back}
              >
                Go Back
              </Button>
            </Group>
          </Flex>

          <div className={classes.illustration} aria-hidden="true">
            <div className={classes.orbit}></div>
            <div className={classes.planet}></div>
            <div className={classes.rocket}>
              <div className={classes.rocketBody}></div>
              <div className={classes.rocketWing}></div>
              <div className={classes.rocketFire}></div>
            </div>
          </div>
        </SimpleGrid>
      </Container>
    </main>
  )
}

export default NotFound
