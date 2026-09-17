import { Text, Title } from '@mantine/core'
import classes from './section-header.module.css'

type Props = {
  id: string
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  inverse?: boolean
}

const SectionHeader = ({ id, eyebrow, title, description, align = 'center', inverse = false }: Props) => (
  <header className={classes.header} data-align={align} data-inverse={inverse || undefined}>
    {eyebrow && <Text className={classes.eyebrow}>{eyebrow}</Text>}
    <Title order={2} id={id} className={classes.title}>
      {title}
    </Title>
    {description && <Text className={classes.description}>{description}</Text>}
  </header>
)

export default SectionHeader
