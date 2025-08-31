import { Badge, Card, Divider, Grid, Group, Title } from '@mantine/core'
import { DATA } from '@/config/data'

const Skills = () => (
  <>
    <Divider my="xl" label="Skills" labelPosition="center" />

    <Grid>
      <Grid.Col span={{ base: 12, md: 4 }}>
        <Card withBorder>
          <Title order={5}>Languages</Title>

          <Group mt="sm">
            {DATA.skills.languages.map((s, i) => (
              <Badge key={i}>{s}</Badge>
            ))}
          </Group>
        </Card>
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 4 }}>
        <Card withBorder>
          <Title order={5}>Libraries & Frameworks</Title>
          <Group mt="sm">
            {DATA.skills.libs.map((s, i) => (
              <Badge key={i}>{s}</Badge>
            ))}
          </Group>
        </Card>
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 4 }}>
        <Card withBorder>
          <Title order={5}>Databases & Others</Title>
          <Group mt="sm">
            {DATA.skills.databases.concat(DATA.skills.others).map((s, i) => (
              <Badge key={i}>{s}</Badge>
            ))}
          </Group>
        </Card>
      </Grid.Col>
    </Grid>
  </>
)

export default Skills
