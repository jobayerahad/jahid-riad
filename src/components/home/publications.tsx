import { Badge, Card, Divider, Flex, Stack, Text } from '@mantine/core'
import { DATA } from '@/config/data'

const Publications = () => (
  <>
    <Divider my="xl" label="Publications" labelPosition="center" />

    <Stack>
      {DATA.publications.map((p, i) => (
        <Card key={i} withBorder>
          <Flex justify="space-between" align="center">
            <Text>{p.title}</Text>
            <Badge color="gray" variant="light">
              {p.year}
            </Badge>
          </Flex>
        </Card>
      ))}
    </Stack>
  </>
)

export default Publications
