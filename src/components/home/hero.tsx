import { Anchor, Badge, Divider, Group, Stack, Text, Title } from '@mantine/core'
import { FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa'
import { DATA } from '@/config/data'

const Hero = () => (
  <>
    <Stack align="center" gap="sm" my="xl">
      <Title order={1}>{DATA.name}</Title>

      <Text size="lg" c="dimmed">
        {DATA.title}
      </Text>

      <Group>
        {DATA.heroTags.map((tag, i) => (
          <Badge key={i} color="blue" variant="light">
            {tag}
          </Badge>
        ))}
      </Group>

      <Group mt="md">
        <Anchor href={DATA.linkedin} target="_blank">
          <FaLinkedin />
        </Anchor>

        <Anchor href={`mailto:${DATA.email}`}>
          <FaEnvelope />
        </Anchor>

        <Text size="sm">
          <FaPhone /> {DATA.phone}
        </Text>

        <Text size="sm">
          <FaMapMarkerAlt /> {DATA.location}
        </Text>
      </Group>
    </Stack>

    <Divider my="xl" label="About" labelPosition="center" />
    <Text ta="center" maw={600} mx="auto">
      {DATA.summary}
    </Text>
  </>
)

export default Hero
