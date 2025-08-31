import { Card, Divider, Grid, List, Title } from '@mantine/core'
import { FaBook, FaCertificate } from 'react-icons/fa'
import { DATA } from '@/config/data'

const Certificates = () => (
  <>
    <Divider my="xl" label="Certificates & Conferences" labelPosition="center" />

    <Grid>
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Card withBorder>
          <Title order={5}>
            <FaCertificate /> Certificates
          </Title>

          <List spacing="xs" size="sm" mt="sm">
            {DATA.certificates.map((c, i) => (
              <List.Item key={i}>
                {c.name} – {c.issuer}
              </List.Item>
            ))}
          </List>
        </Card>
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 6 }}>
        <Card withBorder>
          <Title order={5}>
            <FaBook /> Conferences
          </Title>

          <List spacing="xs" size="sm" mt="sm">
            {DATA.conferences.map((c, i) => (
              <List.Item key={i}>{c}</List.Item>
            ))}
          </List>
        </Card>
      </Grid.Col>
    </Grid>
  </>
)

export default Certificates
