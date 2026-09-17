import Home from '@/components/home'
import { getPortfolioContent } from '@/data/portfolio'
import { getHeroPortrait } from '@/lib/portfolio-presentation'

const createJsonLd = (content: Awaited<ReturnType<typeof getPortfolioContent>>) => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': `${content.settings.siteUrl}/#person`,
      name: content.profile.name,
      url: content.settings.siteUrl,
      image: getHeroPortrait(content.settings)?.url,
      jobTitle: content.profile.role,
      address: { '@type': 'PostalAddress', addressLocality: content.profile.location },
      sameAs: content.profile.socialLinks
        .filter((link) => link.enabled && link.href.startsWith('http'))
        .map((link) => link.href)
    },
    {
      '@type': 'ProfilePage',
      '@id': `${content.settings.siteUrl}/#profile`,
      url: content.settings.siteUrl,
      name: `${content.profile.name} - professional portfolio`,
      mainEntity: { '@id': `${content.settings.siteUrl}/#person` }
    },
    {
      '@type': 'WebSite',
      '@id': `${content.settings.siteUrl}/#website`,
      url: content.settings.siteUrl,
      name: content.settings.siteName
    }
  ]
})

const HomePage = async () => {
  const content = await getPortfolioContent()
  const jsonLd = createJsonLd(content)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <Home content={content} />
    </>
  )
}

export default HomePage
