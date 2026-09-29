import type { PublishedPortfolioSnapshot } from '@/schemas/portfolio-content'

type Snapshot = PublishedPortfolioSnapshot

export const getHeroPortrait = (settings: Snapshot['settings']) => settings.heroImage

export const getHeroStatement = (snapshot: Snapshot) => {
  const { hero, copy } = snapshot
  return [hero?.heading ?? copy.heroHeading, hero?.accent ?? copy.heroAccent].filter(Boolean).join(' ')
}

export const getAboutPortrait = (settings: Snapshot['settings']) => settings.aboutImage

export const getContactPortrait = (settings: Snapshot['settings']) => settings.aboutImage ?? settings.heroImage ?? null

export const getHeroActions = (snapshot: Snapshot) => {
  const hero = snapshot.hero
  const { copy } = snapshot
  return {
    primary: {
      label: hero?.primaryLabel ?? copy.heroPrimaryLabel,
      href: hero?.primaryHref ?? copy.heroPrimaryHref
    },
    secondary: {
      label: hero?.secondaryLabel ?? copy.heroSecondaryLabel,
      href: hero?.secondaryHref ?? copy.heroSecondaryHref
    }
  }
}

export const getHeroIntroduction = (snapshot: Snapshot) => {
  const { hero, copy, profile } = snapshot
  const introduction = hero?.introduction ?? copy.heroIntroduction
  return introduction.replaceAll('{name}', profile.name).replaceAll('{role}', profile.role)
}

export const getAboutSummary = (snapshot: Snapshot) => snapshot.copy.aboutBody

type WorkStory = {
  id?: string
  number: string
  title: string
  body: string
  evidence: string
  visualLabel: string
  href: string
  linkLabel: string
}

export const getSelectedWorkStories = (snapshot: Snapshot): WorkStory[] => {
  const stories = snapshot.workStories?.filter((item) => item.enabled) ?? []
  if (stories.length) {
    return stories.map((item, index) => ({
      id: item.id,
      number: String(index + 1).padStart(2, '0'),
      title: item.title,
      body: item.body,
      evidence: item.evidence,
      visualLabel: item.visualLabel,
      href: item.href,
      linkLabel: item.linkLabel
    }))
  }

  return []
}
