import { Divider, Text } from '@mantine/core'
import { DATA } from '@/config/data'

const Footer = () => (
  <>
    <Divider my="xl" />

    <Text size="sm" ta="center">
      © {new Date().getFullYear()} {DATA.name}. All rights reserved.
    </Text>
  </>
)

export default Footer
