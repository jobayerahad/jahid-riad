import { Card, Divider, Grid, List, Text, Title } from '@mantine/core'
import { DATA } from '@/config/data'

const Experience = () => (
  <>
    <Divider my="xl" label="Experience" labelPosition="center" />

    <Grid>
      {DATA.experience.map((job, i) => (
        <Grid.Col span={{ base: 12, md: 6 }} key={i}>
          <Card shadow="sm" withBorder>
            <Title order={4}>{job.role}</Title>
            <Text size="sm" c="dimmed">
              {job.company} • {job.location}
            </Text>
            <Text size="xs" mt="xs">
              {job.period}
            </Text>
            <List spacing="xs" size="sm" mt="sm">
              {job.bullets.map((b, idx) => (
                <List.Item key={idx}>{b}</List.Item>
              ))}
            </List>
          </Card>
        </Grid.Col>
      ))}
    </Grid>
  </>
)

export default Experience
