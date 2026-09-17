import { Text, Title } from '@mantine/core'
import { HiArrowUpRight } from 'react-icons/hi2'
import type { Publication } from '@/types/content'
import classes from './styles.module.css'

type Props = { publication: Publication; headingOrder?: 2 | 3 }

const PublicationCard = ({ publication, headingOrder = 3 }: Props) => {
  const destination = publication.paperUrl ?? publication.scholarUrl
  const linkLabel = publication.paperUrl
    ? 'Open paper'
    : publication.scholarUrl.includes('view_op=view_citation')
      ? 'Open Scholar record'
      : 'View Scholar profile'

  return (
    <article id={publication.id} className={classes.row}>
      <div className={classes.year}>
        <time dateTime={String(publication.year)}>{publication.year}</time>
        <span>{publication.type}</span>
      </div>
      <div className={classes.content}>
        <Title order={headingOrder}>{publication.title}</Title>
        {publication.authors?.length ? <Text className={classes.authors}>{publication.authors.join(', ')}</Text> : null}
        {publication.venue ? (
          <Text className={classes.venue}>
            {publication.venue}
            {publication.pages ? `, pp. ${publication.pages}` : ''}
          </Text>
        ) : null}
        {publication.abstract ? <Text className={classes.abstract}>{publication.abstract}</Text> : null}
        {publication.topics.length ? <Text className={classes.topics}>{publication.topics.join(' / ')}</Text> : null}
        <a href={destination} target="_blank" rel="noopener noreferrer" className={classes.link}>
          {linkLabel}
          <HiArrowUpRight aria-hidden="true" />
        </a>
      </div>
    </article>
  )
}

export default PublicationCard
