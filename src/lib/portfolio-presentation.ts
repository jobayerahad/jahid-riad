import type { PublishedPortfolioSnapshot } from '@/schemas/portfolio-content'

type Snapshot = PublishedPortfolioSnapshot

const localPortraitUrls = ['/riad-01.jpg', '/riad-02.jpg', '/riad-03.jpg']

const isLocalPortrait = (url?: string) => Boolean(url && localPortraitUrls.includes(url))

const conferencePortrait = {
  id: 'local-conference',
  url: '/riad-02.jpg',
  kind: 'IMAGE' as const,
  width: 824,
  height: 1035,
  altText: 'Md. Jahid Alam Riad at an applied AI conference in Washington, DC',
  originalFilename: 'riad-02.jpg'
}

const personalPortrait = {
  id: 'local-personal',
  url: '/riad-03.jpg',
  kind: 'IMAGE' as const,
  width: 959,
  height: 959,
  altText: 'Md. Jahid Alam Riad outdoors on a snowy Washington street',
  originalFilename: 'riad-03.jpg'
}

const formalPortrait = {
  id: 'local-formal',
  url: '/riad-01.jpg',
  kind: 'IMAGE' as const,
  width: 472,
  height: 472,
  altText: 'Formal portrait of Md. Jahid Alam Riad',
  originalFilename: 'riad-01.jpg'
}

export const getHeroPortrait = (settings: Snapshot['settings']) => {
  if (!settings.heroImage || isLocalPortrait(settings.heroImage.url)) return conferencePortrait
  return settings.heroImage
}

export const getHeroStatement = (snapshot: Snapshot) => {
  const { copy } = snapshot
  const knownResumeHeadings = [
    'Business insight, engineered into practical solutions.',
    'Business analysis, software engineering and applied AI research.'
  ]
  const statement = [copy.heroHeading, copy.heroAccent].filter(Boolean).join(' ')
  if (knownResumeHeadings.includes(statement)) return 'Turning complex problems into systems that work.'

  return statement
}

export const getAboutPortrait = (settings: Snapshot['settings']) => {
  if (settings.aboutImage && !isLocalPortrait(settings.aboutImage.url)) return settings.aboutImage
  return personalPortrait
}

export const getContactPortrait = () => formalPortrait

export const getHeroActions = (snapshot: Snapshot) => {
  const { copy } = snapshot
  const usesDefaultPrimary = ['Explore research', 'Explore selected work'].includes(copy.heroPrimaryLabel)
  const usesDefaultSecondary = ['LinkedIn', 'View research', 'Start a conversation'].includes(copy.heroSecondaryLabel)

  return {
    primary: usesDefaultPrimary
      ? { label: 'Explore work', href: '#work' }
      : { label: copy.heroPrimaryLabel, href: copy.heroPrimaryHref },
    secondary: usesDefaultSecondary
      ? { label: 'View research', href: '#research' }
      : { label: copy.heroSecondaryLabel, href: copy.heroSecondaryHref }
  }
}

export const getHeroIntroduction = (snapshot: Snapshot) => {
  const { copy, profile } = snapshot
  const knownIntroductions = [
    "I'm {name}, an {role} working across requirements, software systems, data, and applied AI research.",
    'Business analyst, software engineer, and applied AI researcher working across business needs, technology, data, and research.'
  ]
  if (knownIntroductions.includes(copy.heroIntroduction))
    return 'Business analyst, software engineer, and applied AI researcher connecting people, data, and systems.'

  return copy.heroIntroduction.replaceAll('{name}', profile.name).replaceAll('{role}', profile.role)
}

export const getAboutSummary = (snapshot: Snapshot) => {
  const { copy } = snapshot
  const knownAboutCopy =
    'My background spans business analysis, IT operations, teaching, software development, and applied machine-learning research. That range helps me communicate across technical and non-technical teams while keeping solutions grounded in real constraints.'

  if (copy.aboutBody === knownAboutCopy)
    return 'I bring business analysis, software engineering, and applied research together to make complex work clearer and more useful.'

  return copy.aboutBody
}

export type WorkStory = {
  number: string
  title: string
  body: string
  evidence: string
  visualLabel: string
  href: string
  linkLabel: string
}

export const getSelectedWorkStories = (snapshot: Snapshot): WorkStory[] => {
  const visibleExperiences = snapshot.experiences.filter((item) => item.enabled)
  const currentAnalysis =
    visibleExperiences.find((item) => item.current) ??
    visibleExperiences.find((item) => /business analyst/i.test(item.role)) ??
    visibleExperiences[0]
  const systemsWork =
    visibleExperiences.find((item) => /IT Executive/i.test(item.role)) ??
    visibleExperiences.find((item) => /software|systems/i.test(`${item.role} ${item.summary}`)) ??
    visibleExperiences[1]
  const softwareCapability = snapshot.capabilities.find(
    (item) => item.enabled && /software|systems/i.test(`${item.title} ${item.description}`)
  )
  const featuredResearch = snapshot.publications.filter((item) => item.enabled && item.featured)

  return [
    {
      number: '01',
      title: 'From needs to delivery',
      body:
        currentAnalysis?.highlights[0] ??
        'Translating business requirements into clear technical work and implementation plans.',
      evidence: currentAnalysis ? `${currentAnalysis.role} · ${currentAnalysis.organization}` : snapshot.profile.role,
      visualLabel: 'Analysis',
      href: '/profile#experience',
      linkLabel: 'View experience'
    },
    {
      number: '02',
      title: 'Systems with context',
      body:
        softwareCapability?.description ??
        systemsWork?.highlights[0] ??
        'Building and reasoning about maintainable software, data, and operational systems.',
      evidence: systemsWork ? `${systemsWork.role} · ${systemsWork.organization}` : 'Software engineering',
      visualLabel: 'Systems',
      href: '/profile#skills',
      linkLabel: 'View capabilities'
    },
    {
      number: '03',
      title: 'AI in human contexts',
      body: featuredResearch.length
        ? 'Research across conversational AI, Bangla NLP, sentiment, and cross-cultural sensitivity.'
        : snapshot.copy.publicationsDescription,
      evidence: 'Applied AI research',
      visualLabel: 'Research',
      href: '#research',
      linkLabel: 'View research'
    }
  ]
}
