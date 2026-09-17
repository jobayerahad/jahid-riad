import { Container, Text, Title } from '@mantine/core'
import { getPortfolioContent } from '@/data/portfolio'
import SectionHeader from '@/components/ui/section-header'
import Reveal from '@/components/ui/reveal'
import classes from './styles.module.css'
import type { PublishedPortfolioSnapshot } from '@/schemas/portfolio-content'

const ExperienceSection = async ({ content }: { content?: PublishedPortfolioSnapshot }) => {
  const { experiences, copy } = content ?? (await getPortfolioContent())
  const visibleExperiences = experiences.filter((item) => item.enabled)

  return (
    <section id="experience" className={`section ${classes.experience}`} aria-labelledby="experience-title">
      <Container size="xl">
        <SectionHeader
          id="experience-title"
          eyebrow={copy.experienceEyebrow}
          title={copy.experienceTitle}
          description={copy.experienceDescription}
        />
        <ol className={classes.list}>
          {visibleExperiences.map((experience, index) => (
            <Reveal as="li" className={classes.item} delay={index * 60} key={experience.id}>
              <div className={classes.period}>
                <time dateTime={experience.startDate}>{experience.period}</time>
                {experience.current && <span className={classes.current}>Current role</span>}
              </div>
              <article className={classes.record}>
                <Title order={3}>{experience.role}</Title>
                <Text className={classes.organization}>{experience.organization}</Text>
                <Text className={classes.summary}>{experience.summary}</Text>
                {experience.highlights.length ? (
                  <ul className={classes.highlights}>
                    {experience.highlights.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                ) : null}
              </article>
              <Text className={classes.location}>{experience.location}</Text>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  )
}

export default ExperienceSection
