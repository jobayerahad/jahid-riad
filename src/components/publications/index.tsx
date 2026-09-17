import { Container } from '@mantine/core'
import { HiArrowRight } from 'react-icons/hi2'
import { getPortfolioContent } from '@/data/portfolio'
import PublicationCard from '@/components/publication-card'
import SectionHeader from '@/components/ui/section-header'
import Reveal from '@/components/ui/reveal'
import classes from './styles.module.css'
import type { PublishedPortfolioSnapshot } from '@/schemas/portfolio-content'

const Publications = async ({ content }: { content?: PublishedPortfolioSnapshot }) => {
  const { publications, copy } = content ?? (await getPortfolioContent())
  const featuredPublications = publications.filter((publication) => publication.featured && publication.enabled)

  return (
    <section id="publications" className={`section ${classes.publications}`} aria-labelledby="publications-title">
      <Container size="xl">
        <SectionHeader
          id="publications-title"
          eyebrow={copy.publicationsEyebrow}
          title={copy.publicationsTitle}
          description={copy.publicationsDescription}
        />
        <div className={classes.list}>
          {featuredPublications.map((publication, index) => (
            <Reveal key={publication.id} delay={index * 50}>
              <PublicationCard publication={publication} />
            </Reveal>
          ))}
        </div>
        <Reveal className={classes.action}>
          <a href="/publications" className={classes.allLink}>
            {copy.publicationsActionLabel}
            <HiArrowRight aria-hidden="true" />
          </a>
        </Reveal>
      </Container>
    </section>
  )
}

export default Publications
