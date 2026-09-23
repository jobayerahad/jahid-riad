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
    {eyebrow && <p className={classes.eyebrow}>{eyebrow}</p>}
    <h2 id={id} className={classes.title}>
      {title}
    </h2>
    {description && <p className={classes.description}>{description}</p>}
  </header>
)

export default SectionHeader
