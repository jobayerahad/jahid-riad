import Link from 'next/link'
import { Text, Title } from '@mantine/core'
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

  return (
    <article id={publication.id} className={classes.row}>
      <div className={classes.year}>
        <time dateTime={String(publication.year)}>{publication.year}</time>
        <span>{formatPublicationType(publication.type)}</span>
      </div>
      <div className={classes.content}>
        <Title order={headingOrder}>
          <Link href={`/publications/${slug}`} className={classes.titleLink}>
            {publication.title}
          </Link>
        </Title>
        {authors.length ? (
          <Text className={classes.authors}>
            {authors.map((author, index) => (
              <span key={`${author.name}-${index}`}>
                {index > 0 ? ', ' : ''}
                {author.isSelf ? <strong>{author.name}</strong> : author.name}
              </span>
            ))}
          </Text>
        ) : null}
        {publication.venue ? (
          <Text className={classes.venue}>
            {publication.venue}
            {publication.pages ? `, pp. ${publication.pages}` : ''}
          </Text>
        ) : null}
        {publication.doi ? (
          <Text className={classes.doi}>
            DOI:{' '}
            <a href={`https://doi.org/${publication.doi}`} target="_blank" rel="noopener noreferrer">
              {publication.doi}
            </a>
          </Text>
        ) : null}
        {publication.abstract ? <Text className={classes.abstract}>{publication.abstract}</Text> : null}
        {publication.topics.length ? <Text className={classes.topics}>{publication.topics.join(' / ')}</Text> : null}
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
