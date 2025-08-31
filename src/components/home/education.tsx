import { Card, Divider, Stack, Text, Title } from '@mantine/core'
import { DATA } from '@/config/data'

const Education = () => (
  <>
    <Divider my="xl" label="Education" labelPosition="center" />

    <Stack>
      {DATA.education.map((ed, i) => (
        <Card withBorder key={i}>
          <Title order={5}>{ed.degree}</Title>

          <Text size="sm" c="dimmed">
            {ed.school} – {ed.location}
          </Text>

          <Text size="xs">{ed.period}</Text>

          {ed.note && (
            <Text size="sm" mt="xs">
              {ed.note}
            </Text>
          )}
        </Card>
      ))}
    </Stack>
  </>
)

export default Education
