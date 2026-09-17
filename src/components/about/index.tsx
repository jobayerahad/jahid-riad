import Image from 'next/image'
import { Container, Text, Title } from '@mantine/core'
import { getPortfolioContent } from '@/data/portfolio'
import { getHeroIntroduction, getHeroPortrait } from '@/lib/portfolio-presentation'
import SectionHeader from '@/components/ui/section-header'
import Reveal from '@/components/ui/reveal'
import classes from './styles.module.css'
import type { PublishedPortfolioSnapshot } from '@/schemas/portfolio-content'

const About = async ({ content }: { content?: PublishedPortfolioSnapshot }) => {
  const snapshot = content ?? (await getPortfolioContent())
  const { profile, copy, settings } = snapshot
  const aboutImage = settings.aboutImage?.url !== getHeroPortrait(settings)?.url ? settings.aboutImage : undefined
  const showSummary = getHeroIntroduction(snapshot) !== profile.summary

  return (
    <section id="about" className={`section ${classes.about}`} aria-labelledby="about-title">
      <Container size="xl">
        <div className={classes.layout} data-image={aboutImage ? true : undefined}>
          <div className={classes.label}>{copy.aboutEyebrow === 'Current focus' ? 'Profile' : copy.aboutEyebrow}</div>
          <Reveal className={classes.copy}>
            <SectionHeader id="about-title" title={copy.aboutTitle} />
            <Text className={classes.lead}>{copy.aboutBody}</Text>
            {showSummary ? <Text className={classes.body}>{profile.summary}</Text> : null}
            <div className={classes.principles}>
              <div>
                <Title order={3}>{copy.principleOneTitle}</Title>
                <Text>{copy.principleOneText}</Text>
              </div>
              <div>
                <Title order={3}>{copy.principleTwoTitle}</Title>
                <Text>{copy.principleTwoText}</Text>
              </div>
            </div>
          </Reveal>
          {aboutImage ? (
            <figure className={classes.imagePanel}>
              <Image
                src={aboutImage.url}
                alt={copy.aboutImageAlt}
                width={aboutImage.width ?? 824}
                height={aboutImage.height ?? 1035}
                sizes="(max-width: 48em) 100vw, 24vw"
                className={classes.image}
              />
              <figcaption>
                {copy.aboutCaptionLabel} {profile.location}
              </figcaption>
            </figure>
          ) : null}
        </div>
      </Container>
    </section>
  )
}

export default About
