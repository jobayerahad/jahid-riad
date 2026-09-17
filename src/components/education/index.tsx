import { Container, Text, Title } from '@mantine/core'
import { getPortfolioContent } from '@/data/portfolio'
import SectionHeader from '@/components/ui/section-header'
import Reveal from '@/components/ui/reveal'
import classes from './styles.module.css'
import type { PublishedPortfolioSnapshot } from '@/schemas/portfolio-content'

const EducationSection = async ({ content }: { content?: PublishedPortfolioSnapshot }) => {
  const snapshot = content ?? (await getPortfolioContent())
  const education = snapshot.education.filter((item) => item.enabled)
  const { copy } = snapshot

  return (
    <section id="education" className={`section ${classes.education}`} aria-labelledby="education-title">
      <Container size="xl">
        <SectionHeader
          id="education-title"
          eyebrow={copy.educationEyebrow}
          title={copy.educationTitle}
          description={copy.educationDescription}
        />
        <div className={classes.list}>
          {education.map((item) => (
            <Reveal as="article" className={classes.row} key={item.id}>
              <Text className={classes.period}>
                {item.startYear} – {item.endYear}
              </Text>
              <div className={classes.content}>
                <Title order={3}>{item.degree}</Title>
                <Text className={classes.institution}>{item.institution}</Text>
                <Text className={classes.detail}>{item.detail}</Text>
              </div>
              <Text className={classes.location}>{item.location}</Text>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}

export default EducationSection
