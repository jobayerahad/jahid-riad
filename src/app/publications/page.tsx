import type { Metadata } from 'next'
import { Container, Text, Title } from '@mantine/core'
import Header from '@/components/header'
import Footer from '@/components/footer'
import PublicationCard from '@/components/publication-card'
import { getPortfolioContent } from '@/data/portfolio'
import classes from './styles.module.css'

export const metadata: Metadata = {
  title: 'Publications',
  description:
    'Research publications by Md. Jahid Alam Riad across applied AI, NLP, language models, and medical imaging.',
  alternates: { canonical: '/publications' }
}

const createScholarlyArticles = (
  publications: Awaited<ReturnType<typeof getPortfolioContent>>['publications'],
  siteUrl: string
) =>
  publications.map((publication) => ({
    '@type': 'ScholarlyArticle',
    '@id': `${siteUrl}/publications#${publication.id}`,
    headline: publication.title,
    datePublished: String(publication.year),
    author: publication.authors?.map((name) => ({ '@type': 'Person', name })),
    isPartOf: publication.venue ? { '@type': 'PublicationIssue', name: publication.venue } : undefined,
    pagination: publication.pages,
    sameAs: publication.paperUrl,
    identifier: publication.doi ? `https://doi.org/${publication.doi}` : undefined,
    keywords: publication.topics.join(', '),
    publisher: publication.type.toLowerCase().includes('ieee') ? { '@type': 'Organization', name: 'IEEE' } : undefined
  }))

const createJsonLd = (
  scholarlyArticles: ReturnType<typeof createScholarlyArticles>,
  siteUrl: string,
  name: string
) => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      '@id': `${siteUrl}/publications#page`,
      url: `${siteUrl}/publications`,
      name: `Publications by ${name}`,
      mainEntity: scholarlyArticles.map((article) => ({ '@id': article['@id'] }))
    },
    ...scholarlyArticles
  ]
})

const PublicationsPage = async () => {
  const content = await getPortfolioContent()
  const publications = content.publications.filter((publication) => publication.enabled)
  const scholarlyArticles = createScholarlyArticles(publications, content.settings.siteUrl)
  const jsonLd = createJsonLd(scholarlyArticles, content.settings.siteUrl, content.profile.name)

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
            <Text className={classes.eyebrow}>Research index</Text>
            <Title order={1}>Publications</Title>
            <Text className={classes.intro}>
              A consolidated list of currently documented research, with the available author, venue, and DOI details.
            </Text>
          </Container>
        </header>

        <section className={`section ${classes.listSection}`} aria-label="Publication list">
          <Container size="xl">
            <div className={classes.list}>
              {publications.map((publication) => (
                <PublicationCard publication={publication} headingOrder={2} key={publication.id} />
              ))}
            </div>
          </Container>
        </section>
      </main>
      <Footer content={content} />
    </>
  )
}

export default PublicationsPage
