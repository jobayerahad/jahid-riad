import Image from 'next/image'
import { Container, Text, Title } from '@mantine/core'
import { HiArrowDown, HiArrowRight } from 'react-icons/hi2'
import { getPortfolioContent } from '@/data/portfolio'
import { getHeroActions, getHeroIntroduction, getHeroPortrait, getHeroStatement } from '@/lib/portfolio-presentation'
import Reveal, { MotionGroup } from '@/components/ui/reveal'
import classes from './styles.module.css'
import type { PublishedPortfolioSnapshot } from '@/schemas/portfolio-content'

const Hero = async ({ content }: { content?: PublishedPortfolioSnapshot }) => {
  const snapshot = content ?? (await getPortfolioContent())
  const { profile } = snapshot
  const portrait = getHeroPortrait(snapshot.settings)
  const actions = getHeroActions(snapshot)

  return (
    <section id="home" className={classes.hero} aria-labelledby="hero-title">
      <Container size="xl" className={classes.container}>
        <div className={classes.layout}>
          <MotionGroup className={classes.copy} trigger="load" stagger={0.09} delayChildren={0.06}>
            <Reveal grouped>
              <Text className={classes.eyebrow}>
                {profile.shortName} <span aria-hidden="true">·</span> {profile.location}
              </Text>
            </Reveal>
            <Reveal grouped>
              <Title order={1} id="hero-title" className={classes.title}>
                {getHeroStatement(snapshot)}
              </Title>
            </Reveal>
            <Reveal grouped>
              <Text className={classes.introduction}>{getHeroIntroduction(snapshot)}</Text>
            </Reveal>

            <Reveal grouped className={classes.actions}>
              <a href={actions.primary.href} className={classes.primaryAction}>
                {actions.primary.label} <HiArrowRight aria-hidden="true" />
              </a>
              <a
                href={actions.secondary.href}
                className={classes.secondaryAction}
                target={actions.secondary.href.startsWith('http') ? '_blank' : undefined}
                rel={actions.secondary.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                {actions.secondary.label} <HiArrowDown aria-hidden="true" />
              </a>
              {snapshot.settings.cvAsset?.url ? (
                <a
                  href={snapshot.settings.cvAsset.url}
                  className={classes.secondaryAction}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download CV <HiArrowRight aria-hidden="true" />
                </a>
              ) : null}
            </Reveal>
          </MotionGroup>

          <Reveal as="figure" className={classes.portraitFrame} trigger="load" variant="image" delay={140}>
            <div className={classes.imageFrame} style={{ position: 'relative' }}>
              <Image
                src={portrait?.url ?? '/riad-02.jpg'}
                alt={portrait?.altText ?? `${profile.name} at a professional technology conference`}
                fill
                priority
                sizes="(max-width: 42em) 100vw, (max-width: 75em) 40vw, 27rem"
                className={classes.portrait}
              />
            </div>
            <figcaption className={classes.caption}>
              <span>{profile.role}</span>
              <span>Business · Technology · Research</span>
            </figcaption>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}

export default Hero
