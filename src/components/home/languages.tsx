import { Badge, Divider, Group } from '@mantine/core'
import { FaLanguage } from 'react-icons/fa'
import { DATA } from '@/config/data'

const Languages = () => (
  <>
    <Divider my="xl" label="Languages" labelPosition="center" />

    <Group>
      {DATA.languages.map((l, i) => (
        <Badge key={i} size="lg" variant="outline">
          <FaLanguage /> {l.name} – {l.level}
        </Badge>
      ))}
    </Group>
  </>
)

export default Languages
