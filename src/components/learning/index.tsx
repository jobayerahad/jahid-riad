import { Container, Text, Title } from '@mantine/core'
import SectionHeader from '@/components/ui/section-header'
import type { PublishedPortfolioSnapshot } from '@/schemas/portfolio-content'
import classes from './styles.module.css'

type Props = { content: PublishedPortfolioSnapshot }

const Learning = ({ content }: Props) => {
  const items = content.learning.filter((item) => item.enabled)
  const languages = [
    { name: 'Bengali', level: 'Mother tongue' },
    { name: 'English', level: 'Professional proficiency' }
  ]

  return (
    <section id="learning" className={`section ${classes.section}`} aria-labelledby="learning-title">
      <Container size="xl">
        <SectionHeader
          id="learning-title"
          eyebrow={content.copy.learningEyebrow}
          title={content.copy.learningTitle}
          description={content.copy.learningDescription}
        />
        <div className={classes.layout}>
          <div>
            <Title order={3}>Courses &amp; reviewing</Title>
            <ul className={classes.list}>
              {items.map((item) => (
                <li key={item.id}>
                  {item.credentialUrl ? (
                    <a href={item.credentialUrl} target="_blank" rel="noopener noreferrer">
                      {item.title}
                    </a>
                  ) : (
                    <span>{item.title}</span>
                  )}
                  <Text component="span">
                    {item.issuer}
                    {item.year ? ` · ${item.year}` : ''}
                  </Text>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <Title order={3}>Languages</Title>
            <ul className={classes.list}>
              {languages.map((item) => (
                <li key={item.name}>
                  <span>{item.name}</span>
                  <Text component="span">{item.level}</Text>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  )
}

export default Learning
