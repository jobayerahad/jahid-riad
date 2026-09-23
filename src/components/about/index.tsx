import Image from 'next/image'
import Link from 'next/link'
import { HiArrowRight, HiOutlineUser } from 'react-icons/hi2'
import { getPortfolioContent } from '@/data/portfolio'
import { getAboutPortrait, getAboutSummary } from '@/lib/portfolio-presentation'
import { Container } from '@/components/ui/container'
import Reveal, { MotionGroup } from '@/components/ui/reveal'
import classes from './styles.module.css'
import type { PublishedPortfolioSnapshot } from '@/schemas/portfolio-content'

const About = async ({ content }: { content?: PublishedPortfolioSnapshot }) => {
  const snapshot = content ?? (await getPortfolioContent())
  const { profile, copy, settings } = snapshot
  const portrait = getAboutPortrait(settings)

  return (
    <section id="about" className={classes.section} aria-labelledby="about-title">
      <Container size="xl">
        <div className={classes.layout}>
          {portrait ? (
            <Reveal as="article" className={classes.imagePanel} variant="image">
              <div className={classes.imageFrame} style={{ position: 'relative' }}>
                <Image
                  src={portrait.url}
                  alt={portrait.altText ?? `${profile.name} outdoors in Washington, DC`}
                  fill
                  sizes="(max-width: 42em) 100vw, 42vw"
                  className={classes.image}
                />
              </div>
              <p>
                {profile.shortName} · {profile.location}
              </p>
            </Reveal>
          ) : null}

          <MotionGroup className={classes.copy} stagger={0.08}>
            <Reveal grouped direction="right">
              <p className={classes.eyebrow}>
                <HiOutlineUser aria-hidden="true" />
                {copy.aboutEyebrow === 'Current focus' ? 'About' : copy.aboutEyebrow}
              </p>
            </Reveal>
            <Reveal grouped direction="right">
              <h2 id="about-title">{copy.aboutTitle}</h2>
            </Reveal>
            <Reveal grouped direction="right">
              <p className={classes.lead}>{getAboutSummary(snapshot)}</p>
            </Reveal>
            <Reveal grouped direction="right">
              <Link href="/profile" className={classes.link}>
                View experience and background <HiArrowRight aria-hidden="true" />
              </Link>
            </Reveal>
          </MotionGroup>
        </div>
      </Container>
    </section>
  )
}

export default About
