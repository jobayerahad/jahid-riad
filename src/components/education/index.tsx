import { getPortfolioContent } from '@/data/portfolio'
import { Container } from '@/components/ui/container'
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
              <p className={classes.period}>
                {item.startYear} – {item.endYear}
              </p>
              <div className={classes.content}>
                <h3>{item.degree}</h3>
                <p className={classes.institution}>{item.institution}</p>
                <p className={classes.detail}>{item.detail}</p>
              </div>
              <p className={classes.location}>{item.location}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}

export default EducationSection
