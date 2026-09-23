import Link from 'next/link'
import { HiArrowRight, HiArrowUpRight, HiOutlineBeaker } from 'react-icons/hi2'
import { getPortfolioContent } from '@/data/portfolio'
import { Container } from '@/components/ui/container'
import Reveal, { MotionGroup } from '@/components/ui/reveal'
import classes from './styles.module.css'
import type { PublishedPortfolioSnapshot } from '@/schemas/portfolio-content'

const concise = (value: string, limit = 138) => {
  if (value.length <= limit) return value
  const excerpt = value.slice(0, limit)
  const lastSpace = excerpt.lastIndexOf(' ')
  return `${excerpt.slice(0, lastSpace > 90 ? lastSpace : limit).trimEnd()}…`
}

const Publications = async ({ content }: { content?: PublishedPortfolioSnapshot }) => {
  const { publications, copy } = content ?? (await getPortfolioContent())
  const featuredPublications = publications
    .filter((publication) => publication.featured && publication.enabled)
    .slice(0, 3)

  return (
    <section id="research" className={classes.section} aria-labelledby="research-title">
      <span id="publications" className={classes.legacyAnchor} aria-hidden="true" />
      <Container size="xl">
        <div className={classes.layout}>
          <Reveal as="header" className={classes.heading} direction="left">
            <p className={classes.eyebrow}>
              <HiOutlineBeaker aria-hidden="true" /> {copy.publicationsEyebrow}
            </p>
            <h2 id="research-title">{copy.publicationsTitle}</h2>
            <p>{copy.publicationsDescription}</p>
            <Link href="/publications" className={classes.indexLink}>
              {copy.publicationsActionLabel} <HiArrowRight aria-hidden="true" />
            </Link>
          </Reveal>

          <MotionGroup className={classes.list} stagger={0.09}>
            {featuredPublications.map((publication, index) => {
              const destination = `/publications/${publication.slug}`
              const context = publication.abstract ?? `Research spanning ${publication.topics.join(', ')}.`
              const venue = publication.venue?.replace(new RegExp(`^${publication.year}\\s*`), '')

              return (
                <Reveal as="article" className={classes.item} grouped key={publication.id}>
                  <Link
                    href={destination}
                    className={classes.itemLink}
                    aria-label={`View research: ${publication.title}`}
                  >
                    <p className={classes.number}>0{index + 1}</p>
                    <div className={classes.copy}>
                      <p className={classes.meta}>
                        <time dateTime={String(publication.year)}>{publication.year}</time>
                        {venue ? ` · ${venue}` : ''}
                      </p>
                      <h3>{publication.title}</h3>
                      <p className={classes.context}>{concise(context)}</p>
                    </div>
                    <span className={classes.paperLink}>
                      <span>View</span>
                      <HiArrowUpRight aria-hidden="true" />
                    </span>
                  </Link>
                </Reveal>
              )
            })}
          </MotionGroup>
        </div>
      </Container>
    </section>
  )
}

export default Publications
