import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Container, Text, Title } from '@mantine/core'
import { HiArrowUpRight, HiOutlineArrowLeft } from 'react-icons/hi2'
import Footer from '@/components/footer'
import Header from '@/components/header'
import BibtexBlock from '@/components/publications/bibtex'
import { getPortfolioContent } from '@/data/portfolio'
import { formatPublicationType, normalizeAuthors } from '@/lib/bibtex'
import classes from './styles.module.css'

type Props = { params: Promise<{ slug: string }> }

export const generateStaticParams = async () => {
  const content = await getPortfolioContent()
  return content.publications.filter((item) => item.enabled).map((item) => ({ slug: item.slug }))
}

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { slug } = await params
  const content = await getPortfolioContent()
  const publication = content.publications.find((item) => item.slug === slug && item.enabled)
  if (!publication) return { title: 'Publication' }

  return {
    title: publication.title,
    description: publication.abstract || `${publication.title} (${publication.year})`,
    alternates: { canonical: `/publications/${publication.slug}` },
    openGraph: {
      title: publication.title,
      description: publication.abstract || content.settings.openGraphDescription,
      type: 'article'
    }
  }
}

const PublicationDetailPage = async ({ params }: Props) => {
  const { slug } = await params
  const content = await getPortfolioContent()
  const publication = content.publications.find((item) => item.slug === slug && item.enabled)
  if (!publication) notFound()

  const authors = normalizeAuthors(publication.authors)
  const siteUrl = content.settings.siteUrl.replace(/\/$/, '')
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    '@id': `${siteUrl}/publications/${publication.slug}`,
    headline: publication.title,
    datePublished: publication.month
      ? `${publication.year}-${String(publication.month).padStart(2, '0')}`
      : String(publication.year),
    author: authors.map((author) => ({ '@type': 'Person', name: author.name })),
    isPartOf: publication.venue ? { '@type': 'PublicationIssue', name: publication.venue } : undefined,
    pagination: publication.pages || undefined,
    sameAs: [publication.paperUrl, publication.scholarUrl].filter(Boolean),
    identifier: publication.doi ? `https://doi.org/${publication.doi}` : undefined,
    keywords: publication.topics.join(', '),
    abstract: publication.abstract || undefined
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <a className="skipLink" href="#main-content">
        Skip to main content
      </a>
      <Header />
      <main id="main-content">
        <article className={classes.article}>
          <Container size="md">
            <Link href="/publications" className={classes.back}>
              <HiOutlineArrowLeft aria-hidden="true" /> All publications
            </Link>
            <Text className={classes.meta}>
              {publication.year} · {formatPublicationType(publication.type)}
              {publication.status && publication.status !== 'PUBLISHED' ? ` · ${publication.status}` : ''}
            </Text>
            <Title order={1}>{publication.title}</Title>
            <Text className={classes.authors}>
              {authors.map((author, index) => (
                <span key={`${author.name}-${index}`}>
                  {index > 0 ? ', ' : ''}
                  {author.isSelf ? <strong>{author.name}</strong> : author.name}
                </span>
              ))}
            </Text>
            {publication.venue ? (
              <Text className={classes.venue}>
                {publication.venue}
                {publication.pages ? `, pp. ${publication.pages}` : ''}
              </Text>
            ) : null}
            {publication.abstract ? <Text className={classes.abstract}>{publication.abstract}</Text> : null}
            {publication.topics.length ? (
              <Text className={classes.topics}>{publication.topics.join(' · ')}</Text>
            ) : null}
            <div className={classes.links}>
              {publication.doi ? (
                <a href={`https://doi.org/${publication.doi}`} target="_blank" rel="noopener noreferrer">
                  DOI {publication.doi}
                  <HiArrowUpRight aria-hidden="true" />
                </a>
              ) : null}
              {publication.paperUrl ? (
                <a href={publication.paperUrl} target="_blank" rel="noopener noreferrer">
                  Open paper
                  <HiArrowUpRight aria-hidden="true" />
                </a>
              ) : null}
              {publication.pdfAsset?.url ? (
                <a href={publication.pdfAsset.url} target="_blank" rel="noopener noreferrer">
                  Download PDF
                  <HiArrowUpRight aria-hidden="true" />
                </a>
              ) : null}
              {publication.scholarUrl ? (
                <a href={publication.scholarUrl} target="_blank" rel="noopener noreferrer">
                  Google Scholar
                  <HiArrowUpRight aria-hidden="true" />
                </a>
              ) : null}
            </div>
            <BibtexBlock publication={publication} />
          </Container>
        </article>
      </main>
      <Footer content={content} />
    </>
  )
}

export default PublicationDetailPage
