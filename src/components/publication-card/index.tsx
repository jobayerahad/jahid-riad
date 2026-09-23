import Link from 'next/link'
import { HiArrowUpRight } from 'react-icons/hi2'
import { formatPublicationType, normalizeAuthors } from '@/lib/bibtex'
import type { Publication } from '@/types/content'
import classes from './styles.module.css'

type Props = { publication: Publication; headingOrder?: 2 | 3 }

const PublicationCard = ({ publication, headingOrder = 3 }: Props) => {
  const destination = publication.paperUrl || publication.scholarUrl
  const slug = publication.slug || publication.id
  const authors = normalizeAuthors(publication.authors ?? [])
  const linkLabel = publication.paperUrl
    ? 'Open paper'
    : publication.scholarUrl?.includes('view_op=view_citation')
      ? 'Open Scholar record'
      : publication.scholarUrl
        ? 'View Scholar profile'
        : 'View details'
  const Heading = headingOrder === 2 ? 'h2' : 'h3'

  return (
    <article id={publication.id} className={classes.row}>
      <div className={classes.year}>
        <time dateTime={String(publication.year)}>{publication.year}</time>
        <span>{formatPublicationType(publication.type)}</span>
      </div>
      <div className={classes.content}>
        <Heading>
          <Link href={`/publications/${slug}`} className={classes.titleLink}>
            {publication.title}
          </Link>
        </Heading>
        {authors.length ? (
          <p className={classes.authors}>
            {authors.map((author, index) => (
              <span key={`${author.name}-${index}`}>
                {index > 0 ? ', ' : ''}
                {author.isSelf ? <strong>{author.name}</strong> : author.name}
              </span>
            ))}
          </p>
        ) : null}
        {publication.venue ? (
          <p className={classes.venue}>
            {publication.venue}
            {publication.pages ? `, pp. ${publication.pages}` : ''}
          </p>
        ) : null}
        {publication.doi ? (
          <p className={classes.doi}>
            DOI:{' '}
            <a href={`https://doi.org/${publication.doi}`} target="_blank" rel="noopener noreferrer">
              {publication.doi}
            </a>
          </p>
        ) : null}
        {publication.abstract ? <p className={classes.abstract}>{publication.abstract}</p> : null}
        {publication.topics.length ? <p className={classes.topics}>{publication.topics.join(' / ')}</p> : null}
        <div className={classes.actions}>
          <Link href={`/publications/${slug}`} className={classes.link}>
            View details
            <HiArrowUpRight aria-hidden="true" />
          </Link>
          {destination ? (
            <a href={destination} target="_blank" rel="noopener noreferrer" className={classes.link}>
              {linkLabel}
              <HiArrowUpRight aria-hidden="true" />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  )
}

export default PublicationCard
