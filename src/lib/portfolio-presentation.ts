import type { PublishedPortfolioSnapshot } from '@/schemas/portfolio-content'

type Snapshot = PublishedPortfolioSnapshot

export const getHeroPortrait = (settings: Snapshot['settings']) => {
  if (settings.heroImage?.url === '/riad-01.jpg' && settings.aboutImage) return settings.aboutImage
  return settings.heroImage
}

export const getHeroStatement = (snapshot: Snapshot) => {
  const { copy, profile } = snapshot
  if (copy.heroHeading === 'Business insight, engineered into' && copy.heroAccent === 'practical solutions.') {
    return profile.positioning
  }
  return [copy.heroHeading, copy.heroAccent].filter(Boolean).join(' ')
}

export const getHeroIntroduction = (snapshot: Snapshot) => {
  const { copy, profile } = snapshot
  if (
    copy.heroIntroduction ===
    "I'm {name}, an {role} working across requirements, software systems, data, and applied AI research."
  ) {
    return profile.summary
  }
  return copy.heroIntroduction.replaceAll('{name}', profile.name).replaceAll('{role}', profile.role)
}
