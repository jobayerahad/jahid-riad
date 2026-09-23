import type { Metadata } from 'next'
import { Container, Text, Title } from '@mantine/core'
import Header from '@/components/header'
import Footer from '@/components/footer'
import PublicationFilters from '@/components/publications/filters'
import { getPortfolioContent } from '@/data/portfolio'
import { normalizeAuthors } from '@/lib/bibtex'
import classes from './styles.module.css'

export const generateMetadata = async (): Promise<Metadata> => {
  const content = await getPortfolioContent()
  return {
    title: 'Publications',
    description: content.copy.publicationsDescription,
    alternates: { canonical: '/publications' }
  }
}

const createScholarlyArticles = (
  publications: Awaited<ReturnType<typeof getPortfolioContent>>['publications'],
  siteUrl: string
) =>
  publications.map((publication) => ({
    '@type': 'ScholarlyArticle',
    '@id': `${siteUrl}/publications/${publication.slug}`,
    headline: publication.title,
    datePublished: String(publication.year),
    author: normalizeAuthors(publication.authors).map((author) => ({ '@type': 'Person', name: author.name })),
    isPartOf: publication.venue ? { '@type': 'PublicationIssue', name: publication.venue } : undefined,
    pagination: publication.pages || undefined,
    sameAs: publication.paperUrl || undefined,
    identifier: publication.doi ? `https://doi.org/${publication.doi}` : undefined,
    keywords: publication.topics.join(', ')
  }))

const PublicationsPage = async () => {
  const content = await getPortfolioContent()
  const publications = content.publications.filter((publication) => publication.enabled)
  const siteUrl = content.settings.siteUrl.replace(/\/$/, '')
  const scholarlyArticles = createScholarlyArticles(publications, siteUrl)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${siteUrl}/publications#page`,
        url: `${siteUrl}/publications`,
        name: `Publications by ${content.profile.name}`,
        mainEntity: scholarlyArticles.map((article) => ({ '@id': article['@id'] }))
      },
      ...scholarlyArticles
    ]
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
        <header className={classes.hero}>
          <Container size="xl">
            <Text className={classes.eyebrow}>{content.copy.publicationsEyebrow}</Text>
            <Title order={1}>{content.copy.publicationsTitle}</Title>
            <Text className={classes.intro}>{content.copy.publicationsDescription}</Text>
          </Container>
        </header>

        <section className={`section ${classes.listSection}`} aria-label="Publication list">
          <Container size="xl">
            <PublicationFilters publications={publications} />
          </Container>
        </section>
      </main>
      <Footer content={content} />
    </>
  )
}

export default PublicationsPage
