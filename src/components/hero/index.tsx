import Image from 'next/image'
import { Container, Text, Title } from '@mantine/core'
import { HiArrowUpRight } from 'react-icons/hi2'
import { getPortfolioContent } from '@/data/portfolio'
import { getHeroIntroduction, getHeroPortrait, getHeroStatement } from '@/lib/portfolio-presentation'
import classes from './styles.module.css'
import type { PublishedPortfolioSnapshot } from '@/schemas/portfolio-content'

const Hero = async ({ content }: { content?: PublishedPortfolioSnapshot }) => {
  const snapshot = content ?? (await getPortfolioContent())
  const { profile, copy } = snapshot
  const portrait = getHeroPortrait(snapshot.settings)
  const introduction = getHeroIntroduction(snapshot)
  const statement = getHeroStatement(snapshot)
  const degree = snapshot.education.find((item) => item.enabled)?.degree
  const publicationCount = snapshot.publications.filter((item) => item.enabled).length

  return (
    <section id="home" className={classes.hero} aria-labelledby="hero-title">
      <Container size="xl" className={classes.container}>
        <div className={classes.content}>
          <div className={classes.copy}>
            <Text className={classes.eyebrow}>
              {profile.role} <span aria-hidden="true">/</span> {profile.location}
            </Text>
            <Title order={1} id="hero-title" className={classes.title}>
              {profile.name}
            </Title>
            <Text className={classes.statement}>{statement}</Text>
            <Text className={classes.introduction}>{introduction}</Text>

            <div className={classes.actions}>
              <a href={copy.heroPrimaryHref} className={classes.primaryAction}>
                {copy.heroPrimaryLabel} <HiArrowUpRight aria-hidden="true" />
              </a>
              <a
                href={copy.heroSecondaryHref}
                className={classes.secondaryAction}
                target={copy.heroSecondaryHref.startsWith('http') ? '_blank' : undefined}
                rel={copy.heroSecondaryHref.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                {copy.heroSecondaryLabel} <HiArrowUpRight aria-hidden="true" />
              </a>
            </div>
            <div className={classes.credentials} aria-label="Professional profile">
              <div>
                <span>Academic background</span>
                <strong>{degree ?? profile.positioning}</strong>
              </div>
              <div>
                <span>Research record</span>
                <strong>{publicationCount ? `${publicationCount} documented publications` : 'Applied research'}</strong>
              </div>
            </div>
          </div>

          <figure className={classes.portraitFrame}>
            <div className={classes.imageCrop} data-conference-photo={portrait?.url === '/riad-02.jpg' || undefined}>
              <Image
                src={portrait?.url ?? '/riad-02.jpg'}
                alt={`Portrait of ${profile.name}`}
                width={portrait?.width ?? 824}
                height={portrait?.height ?? 1035}
                priority
                sizes="(max-width: 48em) 100vw, (max-width: 62em) 48vw, 33vw"
                className={classes.portrait}
              />
            </div>
            <figcaption className={classes.caption}>
              <span>{copy.heroFocusLabel}</span>
              <strong>{profile.role}</strong>
            </figcaption>
          </figure>
        </div>
      </Container>
    </section>
  )
}

export default Hero
